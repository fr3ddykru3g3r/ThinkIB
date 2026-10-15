#!/usr/bin/env python3
"""
Rebuild the SAT question bank (data/sat/*.json + public/sat/q/*.webp) straight from
the College Board Educator Question Bank PDF exports.

Why images: the Math export draws every equation, answer choice and graph as vector
glyph outlines (MathJax -> SVG -> PDF), so there is no text to extract. Any region
that contains vector drawings is therefore cropped and rendered; everything else is
kept as real text (searchable, selectable, dark-mode friendly).

All crops for one question are stacked into a single WebP "sheet" (one request per
question); the JSON stores each crop's rectangle inside the sheet.

Usage:
  python3 scripts/extract-sat-from-pdf.py --math <math.pdf> --rw <rw.pdf> [--limit N]
Requires: pymupdf, pillow
"""
import argparse
import html
import json
import os
import re
import sys
from collections import Counter

import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DATA = os.environ.get('SAT_OUT_DATA') or os.path.join(ROOT, 'data', 'sat')
OUT_IMG = os.environ.get('SAT_OUT_IMG') or os.path.join(ROOT, 'public', 'sat', 'q')
PUBLIC_PREFIX = '/sat/q'

LEFT = 18.0            # page left margin (pt)
PAGE_TOP = 12.0
PAGE_BOTTOM = 780.0
ZOOM_Q = 3.0           # px per pt for question sheets
ZOOM_R = 2.5           # px per pt for rationale sheets
PAD = 3.0              # pt padding around a crop
GAP = 6                # px between crops in a sheet

LETTER_RE = re.compile(r'^([A-D])\.\s')
SKILL_FIX = {'Cross-text Connections': 'Cross-Text Connections'}


# ---------------------------------------------------------------- page model
def baseline(l):
    return l['chars'][0]['origin'][1]


def merge_rows(lines):
    """Glue fragments that share a baseline (e.g. a closing quote set in a symbol font)
    back into one visual line. Fragments far apart horizontally (table columns) stay apart."""
    lines = sorted(lines, key=lambda l: (round(baseline(l)), l['bbox'].x0))
    out = []
    for l in lines:
        prev = out[-1] if out else None
        if prev is not None and abs(baseline(prev) - baseline(l)) < 2.0 \
                and -1.0 <= l['bbox'].x0 - prev['bbox'].x1 < 12:
            gap = l['bbox'].x0 - prev['bbox'].x1
            chars = list(prev['chars'])
            if gap > 1.4 and not prev['text'].endswith(' ') and not l['text'].startswith(' '):
                sp = dict(chars[-1])
                sp['c'] = ' '
                chars.append(sp)
            chars.extend(l['chars'])
            prev['chars'] = chars
            prev['text'] = ''.join(c['c'] for c in chars)
            prev['bbox'] = prev['bbox'] | l['bbox']
        else:
            out.append({'bbox': pymupdf.Rect(l['bbox']), 'text': l['text'], 'chars': list(l['chars'])})
    return out


class PageModel:
    def __init__(self, page):
        self.page = page
        raw = page.get_text('rawdict')
        self.lines = []
        for b in raw['blocks']:
            for l in b.get('lines', []):
                chars = []
                for s in l['spans']:
                    for c in s['chars']:
                        if c['c'] == ' ' and c['bbox'][2] - c['bbox'][0] < 1.0:
                            continue  # kerning artefact from the Type3 fonts ("repor ted")
                        chars.append({'c': c['c'], 'bbox': pymupdf.Rect(c['bbox']),
                                      'font': s['font'], 'origin': c['origin']})
                if not chars:
                    continue
                text = ''.join(c['c'] for c in chars)
                if not text.strip():
                    continue
                self.lines.append({'bbox': pymupdf.Rect(l['bbox']), 'text': text, 'chars': chars})
        self.lines = merge_rows(self.lines)
        self.lines.sort(key=lambda l: (round(l['bbox'].y0, 1), l['bbox'].x0))
        self.drawings = []
        for d in page.get_drawings():
            r = pymupdf.Rect(d['rect'])
            # hairlines come through as zero-height/width rects, which PyMuPDF treats as
            # empty (never intersecting) - give them a minimum thickness
            if r.height < 0.5:
                r.y1 = r.y0 + 0.5
            if r.width < 0.5:
                r.x1 = r.x0 + 0.5
            if r.width > 590 and r.height > 700:
                continue  # page background / clip
            if d.get('fill') == (1.0, 1.0, 1.0) and not d.get('color'):
                continue  # white fill (erasers, backgrounds)
            self.drawings.append(r)
        # older bank items embed equations/figures as raster images: treat them like drawings
        for info in page.get_image_info():
            r = pymupdf.Rect(info['bbox'])
            if r.width > 1 and r.height > 1 and not (r.width > 590 and r.height > 700):
                self.drawings.append(r)
        self._fonts = None

    def lines_in(self, y0, y1, x0=0):
        return [l for l in self.lines
                if y0 - 0.5 <= (l['bbox'].y0 + l['bbox'].y1) / 2 <= y1 + 0.5 and l['bbox'].x1 > x0]

    def drawings_in(self, y0, y1, x0=0):
        # centre-based: inline raster equations often poke above their label's line box
        return [r for r in self.drawings
                if y0 - 1 <= (r.y0 + r.y1) / 2 <= y1 + 1 and r.y0 >= y0 - 14 and r.x1 > x0]

    def font_roles(self):
        """Identify body / heading fonts; any other font carrying letters is italic."""
        if self._fonts is None:
            cnt = Counter()
            heading = set()
            for l in self.lines:
                t = l['text'].strip()
                if t in ('Question', 'Answer', 'Rationale') or t.startswith('Correct Answer:') \
                        or t.startswith('Question ID:'):
                    heading.update(c['font'] for c in l['chars'])
                    continue
                if l['bbox'].y0 < 125 and l['bbox'].y0 > 50:
                    heading.update(c['font'] for c in l['chars'])  # meta table
                    continue
                for c in l['chars']:
                    if c['c'].isalpha():
                        cnt[c['font']] += 1
            body = cnt.most_common(1)[0][0] if cnt else None
            self._fonts = (body, heading)
        return self._fonts


# ---------------------------------------------------------------- text helpers
def underline_rects(pm, y0, y1):
    """Thin horizontal strokes that sit directly under a run of text = underlines."""
    out = []
    for r in pm.drawings_in(y0, y1):
        if r.height > 1.6 or r.width < 4:
            continue
        covered = 0.0
        for l in pm.lines_in(y0, y1):
            for c in l['chars']:
                base = c['origin'][1]
                if -1.5 <= r.y0 - base <= 4.5 and c['bbox'].x1 > r.x0 and c['bbox'].x0 < r.x1:
                    covered += min(c['bbox'].x1, r.x1) - max(c['bbox'].x0, r.x0)
        if covered >= 0.7 * r.width:
            out.append(r)
    return out


def char_is_underlined(c, ul):
    cx = (c['bbox'].x0 + c['bbox'].x1) / 2
    base = c['origin'][1]
    return any(r.x0 - 0.5 <= cx <= r.x1 + 0.5 and -1.5 <= r.y0 - base <= 4.5 for r in ul)


def line_markup(pm, line, ul, skip_prefix=0):
    body, heading = pm.font_roles()
    runs = []  # (text, italic, underline)
    chars = line['chars'][skip_prefix:]
    # A font is "italic" if it is neither the body font nor a heading font and the
    # run it forms contains at least two letters (symbol fonts carry dashes/quotes).
    groups = []
    for c in chars:
        f = c['font']
        if groups and groups[-1][0] == f:
            groups[-1][1].append(c)
        else:
            groups.append((f, [c]))
    for f, cs in groups:
        letters = sum(1 for c in cs if c['c'].isascii() and c['c'].isalpha())
        italic = f != body and f not in heading and letters >= 2
        for c in cs:
            u = char_is_underlined(c, ul) and c['c'] != ' '
            runs.append((c['c'], italic, u))
    # fill single-space gaps inside underlined spans so "the underlined portion" stays one span
    for i in range(1, len(runs) - 1):
        ch, it, u = runs[i]
        if ch == ' ' and runs[i - 1][2] and runs[i + 1][2]:
            runs[i] = (ch, it, True)
    out = []
    cur_i = cur_u = False
    for ch, it, u in runs:
        if it != cur_i or u != cur_u:
            if cur_u:
                out.append('</u>')
            if cur_i:
                out.append('</i>')
            if it:
                out.append('<i>')
            if u:
                out.append('<u>')
            cur_i, cur_u = it, u
        out.append(html.escape(ch.replace('\xa0', ' '), quote=False))
    if cur_u:
        out.append('</u>')
    if cur_i:
        out.append('</i>')
    return ''.join(out)


def build_paragraphs(pm, lines, ul, prefix_len=None, right_edge=594.0):
    """Group lines into paragraphs; keep deliberate line breaks (poems, 'Text 1' labels)."""
    paras = []
    cur = None
    prev = None
    lines = sorted(lines, key=lambda l: baseline(l))
    pitches = sorted(baseline(b) - baseline(a) for a, b in zip(lines, lines[1:]) if baseline(b) - baseline(a) > 3)
    pitch = pitches[len(pitches) // 4] if pitches else 14.5  # low quartile = normal line pitch
    pitch = min(max(pitch, 10), 16)
    for idx, l in enumerate(lines):
        skip = prefix_len(l) if (prefix_len and idx == 0) else 0
        mk = line_markup(pm, l, ul, skip)
        plain = re.sub(r'<[^>]+>', '', mk)
        new_para = False
        if prev is None:
            new_para = True
        else:
            if baseline(l) - baseline(prev) > 1.4 * pitch or plain.lstrip().startswith('•'):
                new_para = True
        if new_para:
            cur = [mk.strip()]
            paras.append(cur)
        else:
            last = cur[-1]
            last_plain = re.sub(r'<[^>]+>', '', last)
            hard_break = prev['bbox'].x1 < 0.72 * right_edge
            if hard_break:
                cur.append('\n' + mk.strip())
            elif last_plain.endswith(('-', '—', '–', '/')) and not last_plain.endswith(' -'):
                cur[-1] = last + mk.strip()
            else:
                cur[-1] = last + ' ' + mk.strip()
        prev = l
    out = []
    for p in paras:
        s = ''.join(p)
        s = re.sub(r'[ \t]+', ' ', s).strip()
        s = s.replace('</u> <u>', ' ').replace('</i> <i>', ' ')
        if s:
            out.append(s)
    return out


def strip_tags(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s))


# ---------------------------------------------------------------- crops & sheets
class Sheet:
    def __init__(self, zoom):
        self.zoom = zoom
        self.images = []

    def add(self, page, rect):
        pix = page.get_pixmap(matrix=pymupdf.Matrix(self.zoom, self.zoom), clip=rect, alpha=False)
        img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        self.images.append(img)
        return len(self.images) - 1

    def save(self, path):
        if not self.images:
            return None
        w = max(i.width for i in self.images)
        h = sum(i.height for i in self.images) + GAP * (len(self.images) - 1)
        rgb = Image.new('RGB', (w, h), (255, 255, 255))
        rects = []
        y = 0
        for im in self.images:
            rgb.paste(im, (0, y))
            rects.append({'x': 0, 'y': y, 'w': im.width, 'h': im.height})
            y += im.height + GAP
        # Near-greyscale sheets become "ink on transparent" so CSS can recolour them
        # for dark mode; genuinely coloured figures stay RGB on white.
        r, g, b = rgb.split()
        from PIL import ImageChops
        diff = ImageChops.difference(r, g)
        diff2 = ImageChops.difference(g, b)
        colourful = max(diff.getextrema()[1], diff2.getextrema()[1]) > 40
        if colourful:
            rgb.save(path, 'WEBP', quality=88, method=6)
            mode = 'color'
        else:
            gray = rgb.convert('L')
            alpha = gray.point(lambda v: 255 - v)
            ink = Image.new('LA', (w, h), 0)
            ink.putalpha(alpha)
            ink.convert('RGBA').save(path, 'WEBP', lossless=True, method=6)
            mode = 'ink'
        return {'w': w, 'h': h, 'rects': rects, 'mode': mode}


def content_rect(pm, y0, y1, x0=LEFT - 2, include_text=True):
    rects = [r for r in pm.drawings_in(y0, y1, x0)]
    if include_text:
        for l in pm.lines_in(y0, y1, x0):
            bb = pymupdf.Rect(l['bbox'])
            chars = [c for c in l['chars'] if c['bbox'].x0 >= x0 - 0.5 and c['c'].strip()]
            if not chars:
                continue
            bb = pymupdf.Rect(chars[0]['bbox'])
            for c in chars[1:]:
                bb |= c['bbox']
            rects.append(bb)
    if not rects:
        return None
    u = pymupdf.Rect(rects[0])
    for r in rects[1:]:
        u |= r
    u.x0 = max(u.x0, x0)
    return pymupdf.Rect(u.x0 - PAD, u.y0 - PAD, u.x1 + PAD, u.y1 + PAD)


# ---------------------------------------------------------------- structure
def page_segments(a, b):
    """(page,y) -> (page,y) into [(page, y0, y1)]"""
    (p0, y0), (p1, y1) = a, b
    if p0 == p1:
        return [(p0, y0, y1)]
    segs = [(p0, y0, PAGE_BOTTOM)]
    for p in range(p0 + 1, p1):
        segs.append((p, PAGE_TOP, PAGE_BOTTOM))
    segs.append((p1, PAGE_TOP, y1))
    return segs


def scan_events(doc, pms):
    ev = []
    for pi, pm in enumerate(pms):
        for l in pm.lines:
            t = l['text'].strip()
            bb = l['bbox']
            if bb.x0 > 30:
                continue
            if t.startswith('Question ID:'):
                ev.append((pi, bb.y0, bb.y1, 'qid', t.split(':', 1)[1].strip(), l))
            elif t == 'Question':
                ev.append((pi, bb.y0, bb.y1, 'q', None, l))
            elif t == 'Answer':
                ev.append((pi, bb.y0, bb.y1, 'a', None, l))
            elif t.startswith('Correct Answer:'):
                ev.append((pi, bb.y0, bb.y1, 'correct', t.split(':', 1)[1].strip(), l))
            elif t == 'Rationale':
                ev.append((pi, bb.y0, bb.y1, 'r', None, l))
            elif LETTER_RE.match(t + ' ') and len(t) >= 2 and t[1] == '.':
                ev.append((pi, bb.y0, bb.y1, 'choice', t[0], l))
    ev.sort(key=lambda e: (e[0], e[1]))
    return ev


def parse_meta(pm, qid_line):
    """Header table: Assessment | Test | Domain | Skill | Difficulty."""
    labels = {}
    for l in pm.lines:
        if 50 < l['bbox'].y0 < 70:
            for name in ('Assessment', 'Test', 'Domain', 'Skill', 'Difficulty'):
                if l['text'].strip() == name:
                    labels[name] = l['bbox'].x0
    if len(labels) < 5:
        # labels may be one line with spans; fall back to fixed columns
        labels = {'Assessment': 25, 'Test': 135, 'Domain': 250, 'Skill': 370, 'Difficulty': 485}
        # refine from chars of the label row
        for l in pm.lines:
            if 50 < l['bbox'].y0 < 70:
                txt = l['text']
                for name in labels:
                    i = txt.find(name)
                    if i >= 0:
                        labels[name] = l['chars'][i]['bbox'].x0
    cols = sorted(labels.items(), key=lambda kv: kv[1])
    vals = {k: [] for k in labels}
    for l in pm.lines:
        if 75 < l['bbox'].y0 < 125:
            # split a line into column pieces by char x
            for c in l['chars']:
                col = None
                for name, x in cols:
                    if c['bbox'].x0 >= x - 4:
                        col = name
                if col:
                    vals[col].append((round(l['bbox'].y0, 1), c['bbox'].x0, c['c']))
    out = {}
    for k, cs in vals.items():
        cs.sort()
        s = ''
        last_y = None
        for y, x, ch in cs:
            if last_y is not None and y != last_y and not s.endswith(' '):
                s += ' '
            s += ch
            last_y = y
        out[k] = re.sub(r'\s+', ' ', s).strip()
    return out


def extract(pdf_path, section, limit=None, only=None):
    doc = pymupdf.open(pdf_path)
    print(f'[{section}] {doc.page_count} pages', file=sys.stderr)
    pms = [PageModel(doc[i]) for i in range(doc.page_count)]
    ev = scan_events(doc, pms)

    # split into question groups
    groups = []
    for e in ev:
        if e[3] == 'qid':
            groups.append([e])
        elif groups:
            groups[-1].append(e)
    end_markers = [(g[0][0], g[0][1]) for g in groups[1:]] + [(doc.page_count - 1, PAGE_BOTTOM)]

    os.makedirs(OUT_IMG, exist_ok=True)
    questions, problems = [], []
    seen = set()
    for gi, g in enumerate(groups):
        if limit and len(questions) >= limit:
            break
        qid = g[0][4]
        if only and qid not in only:
            continue
        kinds = [e[3] for e in g]
        try:
            q_ev = next(e for e in g if e[3] == 'q')
            r_ev = next(e for e in g if e[3] == 'r')
        except StopIteration:
            problems.append((qid, 'missing section', kinds))
            continue
        corr_ev = next((e for e in g if e[3] == 'correct'), None)
        if corr_ev is None:
            # Some older items have no "Correct Answer:" line; the rationale states it instead.
            # Synthesize the event at the Rationale heading so section bounds still work.
            corr_ev = (r_ev[0], r_ev[1], r_ev[2], 'correct', None, r_ev[5])
        a_ev = next((e for e in g if e[3] == 'a'), None)
        choice_ev = []
        if a_ev:
            for e in g:
                if e[3] == 'choice' and (e[0], e[1]) > (a_ev[0], a_ev[1]) and (e[0], e[1]) < (corr_ev[0], corr_ev[1]):
                    choice_ev.append(e)
            # keep first A,B,C,D in order
            dedup, want = [], 'ABCD'
            for e in choice_ev:
                if len(dedup) < 4 and e[4] == want[len(dedup)]:
                    dedup.append(e)
            choice_ev = dedup
        is_mcq = len(choice_ev) == 4
        if a_ev and not is_mcq:
            problems.append((qid, f'choices found {len(choice_ev)}', kinds))
            continue

        meta = parse_meta(pms[g[0][0]], g[0][5])
        pm0 = pms[g[0][0]]
        diff = meta.get('Difficulty', '')
        diff = diff if diff in ('Easy', 'Medium', 'Hard') else 'Medium'

        stem_end = (a_ev[0], a_ev[1]) if a_ev else (corr_ev[0], corr_ev[1])
        stem_segs = page_segments((q_ev[0], q_ev[2]), stem_end)
        rat_segs = page_segments((r_ev[0], r_ev[2]), end_markers[gi])

        sheet_q = Sheet(ZOOM_Q)
        sheet_r = Sheet(ZOOM_R)
        stem_blocks = []
        stem_plain = []

        # ---- stem
        for (p, y0, y1) in stem_segs:
            pm = pms[p]
            if section == 'math':
                has_draw = bool(pm.drawings_in(y0, y1))
                lines = pm.lines_in(y0, y1)
                if not has_draw:
                    ul = underline_rects(pm, y0, y1)
                    for para in build_paragraphs(pm, lines, ul):
                        stem_blocks.append({'type': 'text', 'html': para})
                        stem_plain.append(strip_tags(para))
                else:
                    rect = content_rect(pm, y0, y1)
                    if rect:
                        idx = sheet_q.add(pm.page, rect)
                        alt = ' '.join(l['text'].strip() for l in lines)
                        stem_blocks.append({'type': 'img', 'i': idx, 'alt': re.sub(r'\s+', ' ', alt)})
                        stem_plain.append(alt)
            else:
                ul = underline_rects(pm, y0, y1)
                ul_ids = {id(r) for r in ul}
                figs = [r for r in pm.drawings_in(y0, y1) if not any(r is u for u in ul)]
                # cluster figure drawings
                clusters = []
                for r in sorted(figs, key=lambda r: r.y0):
                    rr = pymupdf.Rect(r)
                    merged = False
                    for ci in range(len(clusters)):
                        if (rr + (-8, -8, 8, 8)).intersects(clusters[ci]):
                            clusters[ci] = clusters[ci] | rr
                            merged = True
                            break
                    if not merged:
                        clusters.append(rr)
                # merge overlapping clusters until stable
                changed = True
                while changed:
                    changed = False
                    for i in range(len(clusters)):
                        for j in range(i + 1, len(clusters)):
                            if (clusters[i] + (-8, -8, 8, 8)).intersects(clusters[j]):
                                clusters[i] = clusters[i] | clusters[j]
                                clusters.pop(j)
                                changed = True
                                break
                        if changed:
                            break
                clusters = [c for c in clusters if c.width > 20 and c.height > 12]
                lines = pm.lines_in(y0, y1)
                # attach captions/titles/axis labels that are not left-margin prose
                for ci in range(len(clusters)):
                    grew = True
                    while grew:
                        grew = False
                        c = clusters[ci]
                        for l in lines:
                            bb = l['bbox']
                            if c.contains(bb):
                                continue
                            inside = c.intersects(bb) and (bb & c).get_area() > 0.5 * bb.get_area()
                            near = (bb.y1 >= c.y0 - 16 and bb.y0 <= c.y1 + 16)
                            not_prose = bb.x0 > LEFT + 6
                            if inside or (near and not_prose and bb.x1 > c.x0 - 40 and bb.x0 < c.x1 + 40):
                                c = c | bb
                                clusters[ci] = c
                                grew = True
                # growth can make neighbouring clusters (chart + legend) overlap: merge again
                changed = True
                while changed:
                    changed = False
                    for i in range(len(clusters)):
                        for j in range(i + 1, len(clusters)):
                            if (clusters[i] + (-4, -4, 4, 4)).intersects(clusters[j]):
                                clusters[i] = clusters[i] | clusters[j]
                                clusters.pop(j)
                                changed = True
                                break
                        if changed:
                            break
                in_fig = lambda l: any(c.intersects(l['bbox']) and (l['bbox'] & c).get_area() > 0.4 * l['bbox'].get_area() for c in clusters)
                prose = [l for l in lines if not in_fig(l)]
                items = [('fig', c.y0, c) for c in clusters] + [('line', l['bbox'].y0, l) for l in prose]
                items.sort(key=lambda t: t[1])
                buf = []

                def flush():
                    if buf:
                        for para in build_paragraphs(pm, buf, ul):
                            stem_blocks.append({'type': 'text', 'html': para})
                            stem_plain.append(strip_tags(para))
                        buf.clear()
                for kind, _, obj in items:
                    if kind == 'line':
                        buf.append(obj)
                    else:
                        flush()
                        rect = pymupdf.Rect(obj.x0 - PAD, obj.y0 - PAD, obj.x1 + PAD, obj.y1 + PAD)
                        idx = sheet_q.add(pm.page, rect)
                        alt = ' '.join(l['text'].strip() for l in lines if in_fig(l) and rect.intersects(l['bbox']))
                        stem_blocks.append({'type': 'img', 'i': idx, 'alt': re.sub(r'\s+', ' ', alt)})
                flush()

        # ---- choices
        choices, choice_imgs = [], []
        pend = []  # crops collected first so neighbours can be trimmed apart
        if is_mcq:
            bounds = [(e[0], e[1]) for e in choice_ev] + [(corr_ev[0], corr_ev[1])]
            for ci, e in enumerate(choice_ev):
                label_line = e[5]
                label_x1 = label_line['chars'][1]['bbox'].x1 + 0.5  # "A." glyphs
                nb = bounds[ci + 1]
                # ink can sit a few pt above its label's line box, so split neighbours 6pt early
                nb = (nb[0], nb[1] - (6 if ci < 3 else 0))
                segs = page_segments((e[0], e[1] - 6), nb)
                texts, imgs = [], []
                for (p, y0, y1) in segs:
                    pm = pms[p]
                    lines = pm.lines_in(y0, y1)
                    draws = pm.drawings_in(y0, y1, label_x1)
                    ul = underline_rects(pm, y0, y1)
                    real_draws = [d for d in draws if not any(d == u for u in ul)]
                    if section == 'math' and real_draws:
                        rect = content_rect(pm, y0, y1, x0=label_x1 + 1)
                        if rect:
                            pend.append({'ci': ci, 'p': p, 'rect': rect})
                            texts.append(' '.join(l['text'].strip() for l in lines))
                    else:
                        def pl(l, e=e):
                            m = re.match(r'^\s*[A-D]\.\s*', l['text'])
                            return len(m.group(0)) if (m and l is e[5]) else 0
                        paras = build_paragraphs(pm, lines, ul, prefix_len=pl)
                        texts.append('\n'.join(paras))
                txt = ' '.join(t for t in texts if t).strip()
                if section == 'math':
                    txt = re.sub(r'^[A-D]\.\s*', '', strip_tags(txt)).strip()
                if section == 'math' and not txt and not any(it['ci'] == ci for it in pend):
                    # Some older items place each choice's image *above* its letter label.
                    prev_y = (a_ev[2] if ci == 0 else choice_ev[ci - 1][2]) + 1
                    same_page = choice_ev[ci - 1][0] == e[0] if ci else a_ev[0] == e[0]
                    if same_page:
                        pm = pms[e[0]]
                        rect = content_rect(pm, prev_y, e[2] + 3, x0=LEFT - 2, include_text=False)
                        if rect:
                            pend.append({'ci': ci, 'p': e[0], 'rect': rect})
                choices.append(txt)
                choice_imgs.append(imgs)
            # Trim each crop so it stops where its neighbour's ink begins (superscripts of the
            # next choice can sit above that choice's label line).
            for a, b in zip(pend, pend[1:]):
                if a['p'] == b['p']:
                    b_top = b['rect'].y0 + PAD
                    a_bot = a['rect'].y1 - PAD
                    a['rect'].y1 = max(a_bot + 0.5, min(a['rect'].y1, b_top - 0.4))
                    b['rect'].y0 = min(b['rect'].y0, b['rect'].y0)  # keep
                    b['rect'].y0 = max(b['rect'].y0, min(a_bot + 0.4, b_top - 0.5))
            for item in pend:
                choice_imgs[item['ci']].append(sheet_q.add(pms[item['p']].page, item['rect']))

        # ---- correct answer
        correct = corr_ev[4]
        if correct is None:
            rat_text = ' '.join(l['text'] for (p, y0, y1) in rat_segs for l in pms[p].lines_in(y0, y1))
            rat_text = re.sub(r'\s+', ' ', rat_text)
            if is_mcq:
                m = re.search(r'Choice ([A-D]) is (?:correct|the best answer)', rat_text)
                correct = m.group(1) if m else ''
            elif re.search(r'The correct answer is (-?[\d.,/]+?)\.(?:\s|$)', rat_text):
                correct = re.search(r'The correct answer is (-?[\d.,/]+?)\.(?:\s|$)', rat_text).group(1).replace(',', '')
            else:
                m = re.search(r'Note that (.+?) (?:are|is) (?:examples|an example) of (?:ways|a way) to enter a correct answer', rat_text)
                if m:
                    forms = re.split(r',\s*(?:and\s+|or\s+)?|\s+and\s+|\s+or\s+', m.group(1))
                    correct = ', '.join(f.strip().rstrip('.') for f in forms if re.fullmatch(r'-?(\d+/\d+|\d+\.?\d*|\.\d+)', f.strip().rstrip('.')))
                else:
                    correct = ''
            if not correct:
                problems.append((qid, 'no answer in export', kinds))
                continue
        accepted = None
        if not is_mcq:
            accepted = [a.strip() for a in correct.split(',') if a.strip()]
            if not accepted:
                problems.append((qid, 'empty SPR answer', kinds))
                continue
        elif correct not in ('A', 'B', 'C', 'D'):
            problems.append((qid, f'bad mcq answer {correct!r}', kinds))
            continue

        # ---- rationale
        rat_blocks, rat_plain = [], []
        for (p, y0, y1) in rat_segs:
            pm = pms[p]
            lines = pm.lines_in(y0, y1)
            if not lines and not pm.drawings_in(y0, y1):
                continue
            has_draw = bool(pm.drawings_in(y0, y1))
            if section == 'math' and has_draw:
                rect = content_rect(pm, y0, y1)
                if rect:
                    idx = sheet_r.add(pm.page, rect)
                    alt = re.sub(r'\s+', ' ', ' '.join(l['text'].strip() for l in lines))
                    rat_blocks.append({'type': 'img', 'i': idx, 'alt': alt})
                    rat_plain.append(alt)
            else:
                ul = underline_rects(pm, y0, y1)
                # RW rationales occasionally quote a table/graph: crop it
                figs = [r for r in pm.drawings_in(y0, y1) if r.height > 2 and r.width > 2]
                if figs and section != 'math':
                    rect = content_rect(pm, y0, y1)
                    idx = sheet_r.add(pm.page, rect)
                    alt = re.sub(r'\s+', ' ', ' '.join(l['text'].strip() for l in lines))
                    rat_blocks.append({'type': 'img', 'i': idx, 'alt': alt})
                    rat_plain.append(alt)
                    continue
                for para in build_paragraphs(pm, lines, ul):
                    rat_blocks.append({'type': 'text', 'html': para})
                    rat_plain.append(strip_tags(para))

        if qid in seen:
            problems.append((qid, 'duplicate id', kinds))
            continue
        seen.add(qid)

        prefix = 'm' if section == 'math' else 'rw'
        qsheet = sheet_q.save(os.path.join(OUT_IMG, f'{qid}.webp'))
        rsheet = sheet_r.save(os.path.join(OUT_IMG, f'{qid}-r.webp'))

        def resolve(blocks, sheet_meta, src):
            out = []
            for b in blocks:
                if b['type'] == 'img':
                    r = sheet_meta['rects'][b['i']]
                    out.append({'type': 'img', 'alt': b['alt'], **r})
                else:
                    out.append(b)
            return out

        stem_blocks = resolve(stem_blocks, qsheet, None) if qsheet else stem_blocks
        rat_blocks = resolve(rat_blocks, rsheet, None) if rsheet else rat_blocks
        choice_media = None
        if any(choice_imgs):
            choice_media = [[qsheet['rects'][i] for i in imgs] for imgs in choice_imgs]

        prompt_plain = re.sub(r'\s+', ' ', ' '.join(stem_plain)).strip()
        q = {
            'questionId': qid,
            'section': 'math' if section == 'math' else 'reading-writing',
            'pageNumber': g[0][0] + 1,
            'exam': 'Digital SAT Math' if section == 'math' else 'Digital SAT Reading and Writing',
            'domain': meta.get('Domain', ''),
            'skill': SKILL_FIX.get(meta.get('Skill', ''), meta.get('Skill', '')),
            'difficulty': diff,
            'type': 'mcq' if is_mcq else 'spr',
            'prompt': prompt_plain,
            'stem': stem_blocks,
            'choices': choices,
            'correctAnswer': correct if is_mcq else accepted[0],
            'rationale': re.sub(r'[ \t]+', ' ', '\n\n'.join(rat_plain)).strip(),
            'rationaleBlocks': rat_blocks,
        }
        if accepted:
            q['acceptedAnswers'] = accepted
        if choice_media:
            q['choiceMedia'] = choice_media
        if qsheet:
            q['sheet'] = {'src': f'{PUBLIC_PREFIX}/{qid}.webp', 'w': qsheet['w'], 'h': qsheet['h'],
                          'mode': qsheet['mode'], 'scale': ZOOM_Q}
        if rsheet:
            q['rationaleSheet'] = {'src': f'{PUBLIC_PREFIX}/{qid}-r.webp', 'w': rsheet['w'], 'h': rsheet['h'],
                                   'mode': rsheet['mode'], 'scale': ZOOM_R}
        questions.append(q)
        if len(questions) % 100 == 0:
            print(f'  {len(questions)} …', file=sys.stderr)
    return questions, problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--math')
    ap.add_argument('--rw')
    ap.add_argument('--limit', type=int)
    ap.add_argument('--ids', help='comma-separated question ids (debug)')
    ap.add_argument('--dry', action='store_true', help='write JSON to stdout summary only')
    a = ap.parse_args()
    summary = {'files': []}
    for pdf, section, fname in ((a.math, 'math', 'official-sat-math.json'),
                                (a.rw, 'rw', 'official-sat-reading-writing.json')):
        if not pdf:
            continue
        qs, probs = extract(pdf, section, a.limit, set(a.ids.split(',')) if a.ids else None)
        print(f'[{section}] {len(qs)} questions, {len(probs)} problems', file=sys.stderr)
        for p in probs[:40]:
            print('   ', p, file=sys.stderr)
        if not a.dry:
            with open(os.path.join(OUT_DATA, fname), 'w') as f:
                json.dump(qs, f, ensure_ascii=False, separators=(',', ':'))
            with open(os.path.join(OUT_DATA, fname.replace('.json', '-skipped.json')), 'w') as f:
                json.dump([{'questionId': p[0], 'reason': p[1]} for p in probs], f, indent=1)
        summary['files'].append({'kind': f'sat-{section}', 'questions': len(qs), 'skipped': len(probs),
                                 'byType': dict(Counter(q['type'] for q in qs)),
                                 'byDifficulty': dict(Counter(q['difficulty'] for q in qs))})
    if not a.dry:
        with open(os.path.join(OUT_DATA, 'official-sat-summary.json'), 'w') as f:
            json.dump(summary, f, indent=2)
    print(json.dumps(summary, indent=1), file=sys.stderr)


if __name__ == '__main__':
    main()

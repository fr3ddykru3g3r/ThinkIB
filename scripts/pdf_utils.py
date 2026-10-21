"""
pdf_utils.py
============
Shared helpers for the topical PDF generators.
"""

import re

import fitz  # PyMuPDF

# Lines that IB papers print on pages with no question content.
BOILERPLATE_PATTERNS = [
    r"blank page",
    r"intentionally (left )?blank",
    r"please do not write on this page",
    r"answers written on this page",
    r"will not be marked",
    r"turn over",
    r"continues? on the (following|next) page",
    r"\(?question \d+ continued\)?",
    r"international baccalaureate",
    r"^[–\-\s]*\d+[–\-\s]*$",          # page numbers like "– 7 –"
    r"^\d{4}\s*[–-]\s*\d{4}",            # paper codes like "8823-6501"
    r"^[a-z]{2}\d+$",                    # footer codes like "ep04"
    r"^\[?\d+\]?$",                      # mark tallies like "[3]"
]
_BOILERPLATE_RE = re.compile("|".join(BOILERPLATE_PATTERNS), re.IGNORECASE)
_EXPLICIT_BLANK_RE = re.compile(
    r"blank page|intentionally (left )?blank|please do not write on this page",
    re.IGNORECASE,
)


def _meaningful_text(text: str) -> str:
    kept = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        # Answer lines: rows of dots, underscores, dashes or private-use glyphs
        if all(c in ".\x08 _-�" or ord(c) > 127 for c in line):
            continue
        if _BOILERPLATE_RE.search(line):
            continue
        kept.append(line)
    return " ".join(kept)


def is_blank_slice(page: "fitz.Page", clip_rect) -> bool:
    """True when a clipped region holds no real question content
    (blank/'do not write' pages, or nothing but answer lines and footers)."""
    rect = fitz.Rect(*clip_rect)
    text = page.get_text("text", clip=rect)
    meaningful = _meaningful_text(text)

    if _EXPLICIT_BLANK_RE.search(text) and len(meaningful) < 40:
        return True
    if len(meaningful) >= 25:
        return False

    # Little text: keep it only if there is a diagram or image in the region.
    for img in page.get_image_info():
        if fitz.Rect(img["bbox"]).intersects(rect):
            return False
    shapes = 0
    for d in page.get_drawings():
        r = d["rect"]
        if not r.intersects(rect):
            continue
        # Ignore thin rules (answer lines, borders)
        if r.height < 2.5 or r.width < 2.5:
            continue
        shapes += 1
        if shapes > 3:
            return False
    return True


def tighten_clip(page: "fitz.Page", clip_rect, pad: float = 8.0) -> "fitz.Rect":
    """Shrink a clip's bottom edge to the last real content inside it, so
    trailing answer lines and empty space don't take up a whole output page."""
    rect = fitz.Rect(*clip_rect)
    bottom = rect.y0
    for b in page.get_text("blocks", clip=rect):
        if _meaningful_text(b[4]):
            bottom = max(bottom, b[3])
    for img in page.get_image_info():
        r = fitz.Rect(img["bbox"]) & rect
        if not r.is_empty:
            bottom = max(bottom, r.y1)
    for d in page.get_drawings():
        r = d["rect"] & rect
        # Thin horizontal rules are answer lines; skip them
        if r.is_empty or r.height < 2.5:
            continue
        bottom = max(bottom, r.y1)
    if bottom <= rect.y0:
        return rect
    return fitz.Rect(rect.x0, rect.y0, rect.x1, min(rect.y1, bottom + pad))


def dedupe_questions(questions):
    """Drop repeats of the same question (SL and HL papers often share items).
    Keeps the first occurrence, so callers should pass questions newest-first."""
    seen = set()
    unique = []
    for q in questions:
        body = re.sub(r"^\s*\d+\.\s*", "", q.full_text or "")
        key = re.sub(r"\W+", "", body.lower())[:400]
        if key and key in seen:
            continue
        seen.add(key)
        unique.append(q)
    return unique

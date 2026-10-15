#!/usr/bin/env python3
"""
generate-physics-topical-pdfs.py
================================
End-to-end PDF slicing, classification, and compilation pipeline for IB Physics.
Crawls the 'IB PAST PAPERS - YEAR' archive (2010–2025), extracts every IB Physics
question and markscheme block as crisp vector crops using PyMuPDF (fitz), classifies
them into the 2025 IB Physics Syllabus (Themes A–E and Sub-topics A.1–E.5), filters
out retired syllabus content, and compiles:
  1. 24 Focused Sub-Topic PDFs + 24 Sub-Topic Markscheme PDFs (Pure questions)
  2. 5 Master Theme PDFs + 5 Master Markscheme PDFs (Pure + Mixed/Synthesis questions)
  3. Manifest index 'physics_topicals_map.json' and 'excluded_legacy.json'
"""

import os
import sys
import re
import glob
import json
import time
from typing import Dict, List, Set, Tuple, Optional, Any
from dataclasses import dataclass, asdict

import fitz  # PyMuPDF

# Ensure script can import physics_taxonomy
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from physics_taxonomy import (
    THEMES,
    SUBTOPICS,
    ClassificationResult,
    classify_physics_question,
    check_exclusion
)

# Configuration & Paths
REPO_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
PAST_PAPERS_DIR = os.path.join(REPO_ROOT, "IB PAST PAPERS - YEAR")
OUTPUT_VAULT_DIR = os.path.join(CURRENT_DIR, "../public/vault/physics-topicals")
MAP_OUTPUT_PATH = os.path.join(CURRENT_DIR, "../app/past-papers/physics_topicals_map.json")
EXCLUDED_LOG_PATH = os.path.join(CURRENT_DIR, "../app/past-papers/excluded_legacy.json")

# A4 dimensions in points
A4_WIDTH = 595.3
A4_HEIGHT = 841.9
MARGIN_LEFT = 40.0
MARGIN_RIGHT = 555.0
USABLE_WIDTH = MARGIN_RIGHT - MARGIN_LEFT
TOP_MARGIN = 45.0
BOTTOM_MARGIN = 800.0


# ==============================================================================
# 1. QUESTION DATA STRUCTURES
# ==============================================================================

@dataclass
class QuestionSlice:
    src_pdf: str
    page_num: int
    clip_rect: List[float]  # [x0, y0, x1, y1]
    is_first_slice: bool = True

@dataclass
class MarkschemeSlice:
    ms_pdf: str
    page_num: int
    clip_rect: List[float]
    is_mcq: bool = False
    mcq_answer: Optional[str] = None
    prompt_snippet: Optional[str] = None

@dataclass
class ExtractedQuestion:
    id: str
    year: int
    session: str         # "May" | "Nov"
    tz: str              # "TZ1" | "TZ2" | "TZ0" | "TZ3"
    level: str           # "SL" | "HL"
    paper_type: str      # "Paper 1" | "Paper 2" | "Paper 3"
    paper_code: str      # "P1" | "P2" | "P3"
    q_num: int
    source_label: str    # "May 2024 TZ1 HL Paper 2 Q3"
    source_pdf: str
    ms_pdf: Optional[str]
    slices: List[QuestionSlice]
    full_text: str
    subpart_texts: List[str]
    classification: ClassificationResult
    ms_slices: List[MarkschemeSlice]


# ==============================================================================
# 2. ARCHIVE CRAWLER & PAPER PAIRER
# ==============================================================================

def parse_paper_metadata(pdf_path: str) -> Dict[str, Any]:
    """Extract year, session, timezone, level, and paper type from path/filename."""
    bn = os.path.basename(pdf_path)
    path_lower = pdf_path.lower()
    
    # Year
    year = 2024
    for yr in range(2025, 2009, -1):
        if str(yr) in path_lower:
            year = yr
            break

    # Session
    session = "May"
    if "nov" in path_lower or "november" in path_lower:
        session = "Nov"

    # Timezone
    tz = "TZ1"
    if "tz2" in bn.lower():
        tz = "TZ2"
    elif "tz3" in bn.lower():
        tz = "TZ3"
    elif "tz0" in bn.lower() or "tz 0" in bn.lower():
        tz = "TZ0"

    # Level
    level = "HL"
    if "sl" in bn.lower() and "hl" not in bn.lower():
        level = "SL"
    elif "hl" in bn.lower():
        level = "HL"

    # Paper Type
    paper_type = "Paper 1"
    paper_code = "P1"
    if "paper_2" in bn.lower() or "paper 2" in bn.lower() or "p2" in bn.lower():
        paper_type = "Paper 2"
        paper_code = "P2"
    elif "paper_3" in bn.lower() or "paper 3" in bn.lower() or "p3" in bn.lower():
        paper_type = "Paper 3"
        paper_code = "P3"
    elif "paper_1b" in bn.lower() or "paper 1b" in bn.lower():
        paper_type = "Paper 1B"
        paper_code = "P1B"
    elif "paper_1a" in bn.lower() or "paper 1a" in bn.lower():
        paper_type = "Paper 1A"
        paper_code = "P1"

    is_markscheme = "markscheme" in bn.lower() or "_ms" in bn.lower()

    return {
        "year": year,
        "session": session,
        "tz": tz,
        "level": level,
        "paper_type": paper_type,
        "paper_code": paper_code,
        "is_markscheme": is_markscheme,
        "filename": bn,
        "path": pdf_path
    }

def find_physics_paper_pairs(base_dir: str, start_year: int = 2016, end_year: int = 2025) -> List[Tuple[Dict[str, Any], Optional[str]]]:
    """Finds all Physics Question Papers and their matching Markschemes."""
    all_pdfs = glob.glob(f"{base_dir}/**/*.pdf", recursive=True)
    
    qp_candidates = []
    ms_lookup = {}

    for p in all_pdfs:
        bn = os.path.basename(p)
        if "physics" not in bn.lower() or bn.startswith("."):
            continue
        meta = parse_paper_metadata(p)
        if not (start_year <= meta["year"] <= end_year):
            continue

        if meta["is_markscheme"]:
            # Key for matching
            key = f"{meta['year']}_{meta['session']}_{meta['level']}_{meta['paper_code']}_{meta['tz']}".lower()
            ms_lookup[key] = p
            # Also store exact filename stem match
            stem = bn.lower().replace("_markscheme", "").replace("markscheme", "").replace(".pdf", "")
            ms_lookup[stem] = p
        else:
            qp_candidates.append(meta)

    pairs = []
    for qp in qp_candidates:
        bn = qp["filename"]
        stem = bn.lower().replace(".pdf", "")
        # 1. Try same directory match
        d = os.path.dirname(qp["path"])
        cand1 = os.path.join(d, bn.replace(".pdf", "_markscheme.pdf"))
        cand2 = os.path.join(d, bn.replace(".pdf", "_markscheme_en.pdf"))
        cand3 = os.path.join(d, bn.replace(".pdf", "markscheme.pdf"))
        cand4 = os.path.join(d, bn.replace(".pdf", "_MS.pdf"))
        
        found_ms = None
        for cand in [cand1, cand2, cand3, cand4]:
            if os.path.exists(cand):
                found_ms = cand
                break
        
        # 2. Try stem lookup
        if not found_ms and stem in ms_lookup:
            found_ms = ms_lookup[stem]

        # 3. Try key lookup
        if not found_ms:
            key = f"{qp['year']}_{qp['session']}_{qp['level']}_{qp['paper_code']}_{qp['tz']}".lower()
            if key in ms_lookup:
                found_ms = ms_lookup[key]

        pairs.append((qp, found_ms))

    # Sort newest first
    pairs.sort(key=lambda x: (x[0]["year"], x[0]["session"], x[0]["level"]), reverse=True)
    return pairs


# ==============================================================================
# 3. QUESTION EXTRACTION & CROPPING
# ==============================================================================

def extract_mcq_markscheme_answers(ms_path: Optional[str]) -> Dict[int, str]:
    """Extracts answer letters {1: 'B', 2: 'A', ...} from Paper 1 Markscheme."""
    if not ms_path or not os.path.exists(ms_path):
        return {}
    answers = {}
    try:
        doc = fitz.open(ms_path)
        ms_text = ""
        for p in doc:
            ms_text += p.get_text("text") + "\n"
        doc.close()

        # Regex: e.g. '1.\nB' or '1. B' or '1\tB'
        matches = re.findall(r"(?:^|\n)\s*(\d+)\.\s*\n?\s*([A-D])\b", ms_text)
        for q_str, ans in matches:
            answers[int(q_str)] = ans
    except Exception as e:
        print(f"Warning: Failed reading MCQ MS {ms_path}: {e}")
    return answers

def find_frq_markscheme_slices(ms_path: Optional[str], q_num: int) -> List[MarkschemeSlice]:
    """Finds the vector markscheme table slices corresponding to question q_num."""
    if not ms_path or not os.path.exists(ms_path):
        return []
    
    slices = []
    try:
        doc = fitz.open(ms_path)
        target_pages = []

        # Find which pages question q_num appears on
        for p_idx in range(len(doc)):
            page = doc[p_idx]
            blocks = page.get_text("blocks")
            # In landscape markschemes, questions are in column 1 (x < 85)
            for b in blocks:
                if b[0] < 85 and b[1] > 70:
                    txt = b[4].strip()
                    m = re.match(r"^(\d+)\.", txt)
                    if m and int(m.group(1)) == q_num:
                        target_pages.append((p_idx, b[1]))
                        break

        if not target_pages:
            doc.close()
            return []

        # Extract rows for each page
        for p_idx, y_start in target_pages:
            page = doc[p_idx]
            blocks = page.get_text("blocks")
            # Find next question on same page
            next_y = page.rect.height - 40.0
            for b in blocks:
                if b[0] < 85 and b[1] > y_start + 10:
                    m = re.match(r"^(\d+)\.", b[4].strip())
                    if m and int(m.group(1)) != q_num:
                        next_y = min(next_y, b[1] - 4.0)
                        break

            # Landscape markscheme width is typically ~842 pt
            w = page.rect.width
            clip = [35.0, max(65.0, y_start - 6.0), w - 35.0, min(page.rect.height - 35.0, next_y)]
            slices.append(MarkschemeSlice(
                ms_pdf=ms_path,
                page_num=p_idx,
                clip_rect=clip
            ))
        doc.close()
    except Exception as e:
        print(f"Warning: Failed slicing FRQ MS {ms_path} Q{q_num}: {e}")
    return slices

def extract_paper_1_questions(
    qp_meta: Dict[str, Any],
    ms_path: Optional[str]
) -> List[ExtractedQuestion]:
    """Extracts all MCQs from Paper 1 / Paper 1A."""
    pdf_path = qp_meta["path"]
    mcq_answers = extract_mcq_markscheme_answers(ms_path)
    
    questions = []
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            # Ignore cover / copyright pages
            if page_num < 2:
                txt_check = page.get_text("text").lower()
                if "international baccalaureate" in txt_check and "1." not in txt_check:
                    continue

            blocks = page.get_text("blocks")
            page_qs = []
            for b in blocks:
                txt = b[4].strip()
                m = re.match(r"^(\d+)\.\s+", txt)
                if m and b[0] < 85 and b[1] > 60:
                    q_n = int(m.group(1))
                    page_qs.append((q_n, b[1]))

            page_qs.sort(key=lambda x: x[1])

            for idx, (q_n, y_top) in enumerate(page_qs):
                if idx + 1 < len(page_qs):
                    y_bot = page_qs[idx + 1][1] - 4.0
                else:
                    y_bot = min(775.0, page.rect.height - 45.0)

                clip_rect = [35.0, max(65.0, y_top - 4.0), min(565.0, page.rect.width - 30.0), y_bot]
                rect_obj = fitz.Rect(*clip_rect)
                q_text = page.get_text("text", clip=rect_obj).strip()

                if not q_text:
                    continue

                # Run classification
                res = classify_physics_question(q_text, paper_info=qp_meta)

                # Build markscheme slice
                ans_letter = mcq_answers.get(q_n)
                ms_slices = [
                    MarkschemeSlice(
                        ms_pdf=ms_path or "",
                        page_num=page_num,
                        clip_rect=clip_rect,
                        is_mcq=True,
                        mcq_answer=ans_letter,
                        prompt_snippet=q_text[:120].replace("\n", " ")
                    )
                ]

                source_label = f"{qp_meta['session']} {qp_meta['year']} {qp_meta['tz']} {qp_meta['level']} {qp_meta['paper_type']} Q{q_n}"

                eq = ExtractedQuestion(
                    id=f"{qp_meta['year']}_{qp_meta['session']}_{qp_meta['level']}_{qp_meta['paper_code']}_Q{q_n}",
                    year=qp_meta["year"],
                    session=qp_meta["session"],
                    tz=qp_meta["tz"],
                    level=qp_meta["level"],
                    paper_type=qp_meta["paper_type"],
                    paper_code=qp_meta["paper_code"],
                    q_num=q_n,
                    source_label=source_label,
                    source_pdf=pdf_path,
                    ms_pdf=ms_path,
                    slices=[QuestionSlice(src_pdf=pdf_path, page_num=page_num, clip_rect=clip_rect, is_first_slice=True)],
                    full_text=q_text,
                    subpart_texts=[],
                    classification=res,
                    ms_slices=ms_slices
                )
                questions.append(eq)

        doc.close()
    except Exception as e:
        print(f"Error extracting P1 questions from {pdf_path}: {e}")
    return questions

def extract_paper_2_3_questions(
    qp_meta: Dict[str, Any],
    ms_path: Optional[str]
) -> List[ExtractedQuestion]:
    """Extracts all structured questions from Paper 2 and relevant sections of Paper 3."""
    pdf_path = qp_meta["path"]
    is_p3 = qp_meta["paper_code"] == "P3"

    questions = []
    try:
        doc = fitz.open(pdf_path)
        
        # 1. Map question locations across pages
        # Question anchors: (q_num, page_num, y_top, option_letter)
        anchors = []
        current_option = None

        for p_idx in range(len(doc)):
            page = doc[p_idx]
            page_text = page.get_text("text")

            # Check option header for Paper 3
            if is_p3:
                for opt in ["Option A", "Option B", "Option C", "Option D"]:
                    if opt in page_text:
                        current_option = opt[-1]
                        break

            # Find question anchors
            blocks = page.get_text("blocks")
            for b in blocks:
                txt = b[4].strip()
                m = re.match(r"^(\d+)\.\s+", txt)
                if m and b[0] < 85 and b[1] > 60:
                    q_n = int(m.group(1))
                    # Ignore section A data questions in P3 if we only want Options A, B, D
                    if is_p3 and not current_option:
                        continue
                    anchors.append((q_n, p_idx, b[1], current_option))

        # Sort anchors
        anchors.sort(key=lambda x: (x[1], x[2]))

        # 2. Slice each question
        for i, (q_n, start_page, y_start, opt_letter) in enumerate(anchors):
            # Check end page and end y
            if i + 1 < len(anchors):
                next_q_n, next_page, next_y, _ = anchors[i + 1]
            else:
                next_page = len(doc) - 1
                next_y = 780.0

            q_slices = []
            full_text_parts = []
            subparts = []

            for p_num in range(start_page, next_page + 1):
                page = doc[p_num]
                blocks = page.get_text("blocks")
                
                # Check if this page has continuation of question q_n
                # On start page, clip from y_start
                # On subsequent pages, check for (Question N continued)
                if p_num == start_page:
                    clip_top = max(65.0, y_start - 6.0)
                else:
                    cont_found = False
                    for b in blocks:
                        if f"question {q_n} continued" in b[4].lower() or f"question {q_n}" in b[4].lower():
                            clip_top = max(65.0, b[3] + 4.0)
                            cont_found = True
                            break
                    if not cont_found:
                        clip_top = 65.0

                # Determine clip bottom on this page
                if p_num == next_page and i + 1 < len(anchors):
                    clip_bot = next_y - 6.0
                else:
                    # Find last real prompt / diagram on this page before dotted lines
                    last_content_y = 750.0
                    for b in blocks:
                        txt = b[4].strip()
                        # check if not dots and not footer
                        is_dots = all(c in ".\x08 " or ord(c) > 127 for c in txt)
                        is_footer = "turn over" in txt.lower() or "continues on" in txt.lower() or "ep0" in txt.lower()
                        if not is_dots and not is_footer and b[1] >= clip_top:
                            last_content_y = max(last_content_y, b[3] + 15.0)
                    clip_bot = min(775.0, min(page.rect.height - 40.0, last_content_y))

                if clip_bot <= clip_top + 20:
                    continue

                clip_rect = [35.0, clip_top, min(565.0, page.rect.width - 30.0), clip_bot]
                q_slices.append(QuestionSlice(
                    src_pdf=pdf_path,
                    page_num=p_num,
                    clip_rect=clip_rect,
                    is_first_slice=(p_num == start_page)
                ))

                slice_text = page.get_text("text", clip=fitz.Rect(*clip_rect))
                full_text_parts.append(slice_text)

                # Extract subpart prompts (a), (b), (c)
                sp_matches = re.split(r"(?:^|\n)\s*\(([a-d])\)\s*", slice_text)
                if len(sp_matches) > 1:
                    for sp_idx in range(1, len(sp_matches), 2):
                        subparts.append(sp_matches[sp_idx] + " " + sp_matches[sp_idx+1])

            combined_text = "\n".join(full_text_parts).strip()
            if not combined_text:
                continue

            # Paper info dictionary
            p_info = dict(qp_meta)
            if opt_letter:
                p_info["option"] = opt_letter

            # Run classification
            res = classify_physics_question(combined_text, subparts, paper_info=p_info)

            # Match Markscheme
            ms_slices = find_frq_markscheme_slices(ms_path, q_n)

            source_label = f"{qp_meta['session']} {qp_meta['year']} {qp_meta['tz']} {qp_meta['level']} {qp_meta['paper_type']}"
            if opt_letter:
                source_label += f" Opt {opt_letter}"
            source_label += f" Q{q_n}"

            eq = ExtractedQuestion(
                id=f"{qp_meta['year']}_{qp_meta['session']}_{qp_meta['level']}_{qp_meta['paper_code']}_Q{q_n}",
                year=qp_meta["year"],
                session=qp_meta["session"],
                tz=qp_meta["tz"],
                level=qp_meta["level"],
                paper_type=qp_meta["paper_type"],
                paper_code=qp_meta["paper_code"],
                q_num=q_n,
                source_label=source_label,
                source_pdf=pdf_path,
                ms_pdf=ms_path,
                slices=q_slices,
                full_text=combined_text,
                subpart_texts=subparts,
                classification=res,
                ms_slices=ms_slices
            )
            questions.append(eq)

        doc.close()
    except Exception as e:
        print(f"Error extracting P2/P3 questions from {pdf_path}: {e}")
    return questions


# ==============================================================================
# 4. VECTOR PDF STITCHER & COMPILER
# ==============================================================================

def draw_header_banner(
    page: fitz.Page,
    y_pos: float,
    label_text: str,
    badge_text: str,
    is_ms: bool = False,
    page_width: float = A4_WIDTH
):
    """Draws a crisp editorial header banner above a stitched question."""
    banner_height = 20.0
    margin_l = MARGIN_LEFT
    margin_r = page_width - MARGIN_LEFT
    banner_rect = fitz.Rect(margin_l, y_pos, margin_r, y_pos + banner_height)
    
    bg_fill = (0.94, 0.96, 0.98) if not is_ms else (0.98, 0.95, 0.92)
    border_col = (0.15, 0.35, 0.65) if not is_ms else (0.75, 0.35, 0.15)
    text_col = (0.1, 0.18, 0.3) if not is_ms else (0.4, 0.15, 0.05)
    
    # Outer pill/bar
    page.draw_rect(banner_rect, fill=bg_fill, color=border_col, width=0.75)
    
    # Text
    full_banner_text = f"{label_text}  •  {badge_text}"
    page.insert_text(
        fitz.Point(margin_l + 8.0, y_pos + 13.5),
        full_banner_text,
        fontname="helv",
        fontsize=8.5,
        color=text_col
    )
    return banner_height

def draw_cover_page(
    doc: fitz.Document,
    title: str,
    subtitle: str,
    theme_name: str,
    q_count: int,
    mcq_count: int,
    frq_count: int,
    is_markscheme: bool = False,
    is_master: bool = False
):
    """Draws a clean, publication-grade cover page for the topical booklet."""
    page = doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)

    # Accent top bar
    bar_color = (0.04, 0.41, 0.85) if not is_markscheme else (0.85, 0.35, 0.1)
    page.draw_rect(fitz.Rect(0, 0, A4_WIDTH, 8), fill=bar_color, color=None)

    # Header badge pill
    badge_rect = fitz.Rect(50, 60, 360, 80)
    page.draw_rect(badge_rect, fill=(0.95, 0.97, 1.0), color=bar_color, width=0.8)
    badge_title = "IB DIPLOMA PROGRAMME • 2025 SYLLABUS ARCHIVE"
    if is_markscheme:
        badge_title += " • MARKSCHEME"
    page.insert_text(fitz.Point(62, 74), badge_title, fontsize=8, fontname="helv", color=bar_color)

    # Title & Subtitle
    display_title = title if not is_markscheme else f"{title} (Markscheme)"
    page.insert_text(fitz.Point(50, 130), display_title, fontsize=24, fontname="helv", color=(0.1, 0.12, 0.16))
    page.insert_text(fitz.Point(50, 155), subtitle, fontsize=12, fontname="helv", color=(0.4, 0.45, 0.52))

    # Divider line
    page.draw_line(fitz.Point(50, 180), fitz.Point(545, 180), color=(0.85, 0.88, 0.92), width=1.0)

    # Stats cards grid
    # Card 1: Curriculum Theme
    page.draw_rect(fitz.Rect(50, 200, 290, 270), fill=(0.97, 0.98, 0.99), color=(0.85, 0.88, 0.92), width=0.8)
    page.insert_text(fitz.Point(65, 222), "CURRICULUM THEME", fontsize=8, fontname="helv", color=(0.45, 0.5, 0.55))
    page.insert_text(fitz.Point(65, 246), theme_name, fontsize=11, fontname="helv", color=(0.1, 0.15, 0.25))

    # Card 2: Question Volume
    page.draw_rect(fitz.Rect(305, 200, 545, 270), fill=(0.97, 0.98, 0.99), color=(0.85, 0.88, 0.92), width=0.8)
    page.insert_text(fitz.Point(320, 222), "CURATED QUESTIONS", fontsize=8, fontname="helv", color=(0.45, 0.5, 0.55))
    stats_str = f"{q_count} Questions ({mcq_count} MCQs • {frq_count} FRQs)"
    page.insert_text(fitz.Point(320, 246), stats_str, fontsize=11, fontname="helv", color=(0.1, 0.15, 0.25))

    # Card 3: Year Coverage
    page.draw_rect(fitz.Rect(50, 285, 290, 355), fill=(0.97, 0.98, 0.99), color=(0.85, 0.88, 0.92), width=0.8)
    page.insert_text(fitz.Point(65, 307), "EXAMINATION COVERAGE", fontsize=8, fontname="helv", color=(0.45, 0.5, 0.55))
    page.insert_text(fitz.Point(65, 331), "May 2016 – May 2025 Sessions", fontsize=11, fontname="helv", color=(0.1, 0.15, 0.25))

    # Card 4: Assessment Level
    page.draw_rect(fitz.Rect(305, 285, 545, 355), fill=(0.97, 0.98, 0.99), color=(0.85, 0.88, 0.92), width=0.8)
    page.insert_text(fitz.Point(320, 307), "EXAMINATION PAPERS", fontsize=8, fontname="helv", color=(0.45, 0.5, 0.55))
    page.insert_text(fitz.Point(320, 331), "Paper 1 (MCQ) & Paper 2 / 3 (FRQ)", fontsize=11, fontname="helv", color=(0.1, 0.15, 0.25))

    # Notes section
    page.draw_rect(fitz.Rect(50, 380, 545, 475), fill=(0.99, 0.99, 1.0), color=(0.8, 0.85, 0.95), width=0.8)
    page.insert_text(fitz.Point(65, 405), "SYLLABUS & COMPILATION NOTES:", fontsize=9, fontname="helv", color=bar_color)
    notes = [
        "• All questions classified strictly under the 2025 IB Physics Guide (Themes A–E).",
        "• Retired syllabus items (old Topic 7.3 quarks, Topic 11.2 capacitors, polarization) have been filtered out.",
        "• Vector extraction via PyMuPDF ensures crisp rendering with zero image compression loss.",
        "• Paired markscheme solutions available via the split-screen viewer in ThinkIB."
    ]
    for idx, line in enumerate(notes):
        page.insert_text(fitz.Point(65, 425 + idx * 14), line, fontsize=8.5, fontname="helv", color=(0.25, 0.3, 0.35))

    # Footer note
    page.insert_text(fitz.Point(50, 810), "ThinkIB Official Topical Examination Archive • Generated with PyMuPDF", fontsize=8, fontname="helv", color=(0.55, 0.6, 0.65))

def assemble_topical_pdf(
    questions: Optional[List[ExtractedQuestion]],
    output_path: str,
    title: str,
    subtitle: str,
    theme_name: str,
    is_markscheme: bool = False,
    is_master: bool = False,
    sections: Optional[List[Tuple[str, List[ExtractedQuestion]]]] = None
):
    """Assembles vector slices into an A4 topical booklet."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    out_doc = fitz.open()

    # Flatten questions if sections provided
    if sections:
        all_qs = [q for _, q_list in sections for q in q_list]
    else:
        all_qs = questions or []

    mcq_count = sum(1 for q in all_qs if "Paper 1" in q.paper_type or q.paper_code == "P1")
    frq_count = len(all_qs) - mcq_count

    # 1. Add Cover Page
    draw_cover_page(
        out_doc,
        title=title,
        subtitle=subtitle,
        theme_name=theme_name,
        q_count=len(all_qs),
        mcq_count=mcq_count,
        frq_count=frq_count,
        is_markscheme=is_markscheme,
        is_master=is_master
    )

    current_page = None
    current_y = TOP_MARGIN
    source_docs = {}
    actual_toc = []

    def get_source_doc(path: str) -> Optional[fitz.Document]:
        if not path or not os.path.exists(path):
            return None
        if path not in source_docs:
            source_docs[path] = fitz.open(path)
        return source_docs[path]

    # Handle empty booklet
    if not all_qs:
        p2 = out_doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)
        p2.insert_text(
            fitz.Point(MARGIN_LEFT, 150),
            "No examination questions found for this topic in the selected sessions.",
            fontsize=12,
            fontname="helv",
            color=(0.4, 0.45, 0.5)
        )
        out_doc.save(output_path, garbage=3, deflate=True)
        out_doc.close()
        return

    # Helper to render question list
    def render_question_group(q_list: List[ExtractedQuestion], sec_title: Optional[str] = None):
        nonlocal current_page, current_y
        if not q_list:
            return

        if sec_title:
            # Force new page for each master section
            current_page = out_doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)
            current_y = TOP_MARGIN
            page_num_1indexed = len(out_doc)
            actual_toc.append([1, sec_title, page_num_1indexed])

            # Section Header Bar
            sec_rect = fitz.Rect(MARGIN_LEFT, current_y, MARGIN_RIGHT, current_y + 28.0)
            current_page.draw_rect(sec_rect, fill=(0.92, 0.95, 0.99), color=(0.1, 0.35, 0.7), width=1.0)
            current_page.insert_text(
                fitz.Point(MARGIN_LEFT + 10.0, current_y + 18.0),
                sec_title.upper(),
                fontname="helv",
                fontsize=10.0,
                color=(0.08, 0.25, 0.55)
            )
            current_y += 42.0

        for q_idx, q in enumerate(q_list):
            label_text = f"Q{q_idx + 1} | {q.source_label}"
            badge_text = q.classification.badge

            if not is_markscheme:
                for slice_idx, q_slice in enumerate(q.slices):
                    s_doc = get_source_doc(q_slice.src_pdf)
                    if not s_doc or q_slice.page_num >= len(s_doc):
                        continue

                    clip_w = q_slice.clip_rect[2] - q_slice.clip_rect[0]
                    clip_h = q_slice.clip_rect[3] - q_slice.clip_rect[1]
                    if clip_h <= 10 or clip_w <= 10:
                        continue

                    scale = min(1.0, USABLE_WIDTH / clip_w)
                    render_w = clip_w * scale
                    render_h = clip_h * scale
                    needed_h = render_h + (25.0 if slice_idx == 0 else 5.0)

                    if current_page is None or (current_y + needed_h > BOTTOM_MARGIN):
                        current_page = out_doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)
                        current_y = TOP_MARGIN

                    if slice_idx == 0:
                        banner_h = draw_header_banner(current_page, current_y, label_text, badge_text, is_ms=False)
                        current_y += banner_h + 4.0

                    target_rect = fitz.Rect(MARGIN_LEFT, current_y, MARGIN_LEFT + render_w, current_y + render_h)
                    clip_rect = fitz.Rect(*q_slice.clip_rect)
                    current_page.show_pdf_page(target_rect, s_doc, q_slice.page_num, clip=clip_rect)
                    current_y += render_h + 12.0
            else:
                if "Paper 1" in q.paper_type or q.paper_code == "P1":
                    ans_letter = q.ms_slices[0].mcq_answer if q.ms_slices else "?"
                    prompt_snip = q.ms_slices[0].prompt_snippet if q.ms_slices else ""

                    entry_h = 58.0
                    if current_page is None or (current_y + entry_h > BOTTOM_MARGIN):
                        current_page = out_doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)
                        current_y = TOP_MARGIN

                    draw_header_banner(current_page, current_y, label_text, badge_text, is_ms=True)
                    current_y += 24.0

                    card_rect = fitz.Rect(MARGIN_LEFT, current_y, MARGIN_RIGHT, current_y + 28.0)
                    current_page.draw_rect(card_rect, fill=(0.97, 0.98, 0.99), color=(0.85, 0.88, 0.92), width=0.75)
                    current_page.insert_text(
                        fitz.Point(MARGIN_LEFT + 12.0, current_y + 18.0),
                        f"CORRECT ANSWER:  [ {ans_letter} ]",
                        fontname="helv",
                        fontsize=10.5,
                        color=(0.1, 0.45, 0.2)
                    )
                    if prompt_snip:
                        current_page.insert_text(
                            fitz.Point(MARGIN_LEFT + 180.0, current_y + 17.5),
                            f"Prompt: {prompt_snip[:65]}...",
                            fontname="helv",
                            fontsize=7.5,
                            color=(0.45, 0.5, 0.55)
                        )
                    current_y += 38.0
                else:
                    if q.ms_slices:
                        for slice_idx, ms_slice in enumerate(q.ms_slices):
                            ms_doc = get_source_doc(ms_slice.ms_pdf)
                            if not ms_doc or ms_slice.page_num >= len(ms_doc):
                                continue

                            clip_w = ms_slice.clip_rect[2] - ms_slice.clip_rect[0]
                            clip_h = ms_slice.clip_rect[3] - ms_slice.clip_rect[1]
                            if clip_h <= 10 or clip_w <= 10:
                                continue

                            scale = min(1.0, USABLE_WIDTH / clip_w)
                            render_w = clip_w * scale
                            render_h = clip_h * scale
                            needed_h = render_h + (25.0 if slice_idx == 0 else 5.0)

                            if current_page is None or (current_y + needed_h > BOTTOM_MARGIN):
                                current_page = out_doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)
                                current_y = TOP_MARGIN

                            if slice_idx == 0:
                                banner_h = draw_header_banner(current_page, current_y, label_text, badge_text, is_ms=True)
                                current_y += banner_h + 4.0

                            target_rect = fitz.Rect(MARGIN_LEFT, current_y, MARGIN_LEFT + render_w, current_y + render_h)
                            clip_rect = fitz.Rect(*ms_slice.clip_rect)
                            current_page.show_pdf_page(target_rect, ms_doc, ms_slice.page_num, clip=clip_rect)
                            current_y += render_h + 12.0
                    else:
                        entry_h = 42.0
                        if current_page is None or (current_y + entry_h > BOTTOM_MARGIN):
                            current_page = out_doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)
                            current_y = TOP_MARGIN

                        draw_header_banner(current_page, current_y, label_text, badge_text, is_ms=True)
                        current_y += 24.0

                        card_rect = fitz.Rect(MARGIN_LEFT, current_y, MARGIN_RIGHT, current_y + 22.0)
                        current_page.draw_rect(card_rect, fill=(0.98, 0.98, 0.98), color=(0.85, 0.85, 0.85), width=0.75)
                        current_page.insert_text(
                            fitz.Point(MARGIN_LEFT + 10.0, current_y + 15.0),
                            "Official Markscheme for this session can be referenced in the main examination archive.",
                            fontname="helv",
                            fontsize=8.0,
                            color=(0.4, 0.45, 0.5)
                        )
                        current_y += 32.0

    if sections:
        for sec_name, sec_qs in sections:
            render_question_group(sec_qs, sec_title=sec_name)
    else:
        render_question_group(all_qs)

    # 3. Add TOC Bookmarks if any
    if actual_toc:
        out_doc.set_toc(actual_toc)

    # 4. Save optimized PDF
    out_doc.save(output_path, garbage=3, deflate=True)
    out_doc.close()

    # Close open source docs
    for d in source_docs.values():
        try:
            d.close()
        except:
            pass


# ==============================================================================
# 5. PIPELINE EXECUTION & ORCHESTRATION
# ==============================================================================

def run_physics_topical_pipeline(
    start_year: int = 2016,
    end_year: int = 2025,
    max_papers: Optional[int] = None
):
    """Executes the full extraction, classification, and compilation pipeline."""
    print("=" * 70)
    print("⚡ STARTING IB PHYSICS TOPICAL PAST PAPER GENERATION PIPELINE")
    print(f"Archive Directory : {PAST_PAPERS_DIR}")
    print(f"Output Vault      : {OUTPUT_VAULT_DIR}")
    print(f"Year Scope        : {start_year} – {end_year}")
    print("=" * 70)

    start_time = time.time()
    os.makedirs(OUTPUT_VAULT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MAP_OUTPUT_PATH), exist_ok=True)

    # 1. Find all physics QP/MS pairs
    pairs = find_physics_paper_pairs(PAST_PAPERS_DIR, start_year, end_year)
    if max_papers:
        pairs = pairs[:max_papers]
    print(f"\n📂 Identified {len(pairs)} Question Paper / Markscheme pairs.")

    # 2. Extract and classify all questions
    all_questions: List[ExtractedQuestion] = []
    excluded_questions: List[Dict[str, Any]] = []

    print("\n🔍 Extracting and Classifying questions across all papers...")
    for idx, (qp_meta, ms_path) in enumerate(pairs):
        p_code = qp_meta["paper_code"]
        if p_code in ["P1", "P1A"]:
            extracted = extract_paper_1_questions(qp_meta, ms_path)
        else:
            extracted = extract_paper_2_3_questions(qp_meta, ms_path)

        for eq in extracted:
            if eq.classification.is_excluded:
                excluded_questions.append({
                    "id": eq.id,
                    "source": eq.source_label,
                    "reason": eq.classification.exclusion_reason,
                    "preview": eq.full_text[:120].replace("\n", " ")
                })
            else:
                all_questions.append(eq)

        if (idx + 1) % 15 == 0 or idx == len(pairs) - 1:
            print(f"  Processed {idx + 1}/{len(pairs)} papers (Harvested {len(all_questions)} valid questions, {len(excluded_questions)} excluded)...")

    print(f"\n✅ Total valid questions harvested : {len(all_questions)}")
    print(f"🚫 Total retired syllabus excluded : {len(excluded_questions)}")

    # Write excluded legacy log
    with open(EXCLUDED_LOG_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "total_excluded": len(excluded_questions),
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "excluded_questions": excluded_questions
        }, f, indent=2)
    print(f"📝 Excluded log written to {EXCLUDED_LOG_PATH}")

    # 3. Route questions into Sub-Topics and Master Themes
    # Sub-Topic pure buckets: { "A.1": [questions], ... }
    subtopic_pure_buckets: Dict[str, List[ExtractedQuestion]] = {code: [] for code in SUBTOPICS}
    # Master Theme buckets:
    # { "A": { "pure": { "A.1": [], ... }, "intra_mixed": [], "cross_synthesis": [] } }
    theme_buckets: Dict[str, Dict[str, Any]] = {
        theme_id: {
            "pure": {code: [] for code, s in SUBTOPICS.items() if s["theme"] == theme_id},
            "intra_mixed": [],
            "cross_synthesis": []
        }
        for theme_id in THEMES
    }

    for eq in all_questions:
        cls = eq.classification
        if cls.is_pure:
            subtopic = cls.primary_subtopics[0]
            if subtopic in subtopic_pure_buckets:
                subtopic_pure_buckets[subtopic].append(eq)
            theme_id = SUBTOPICS[subtopic]["theme"]
            theme_buckets[theme_id]["pure"][subtopic].append(eq)
        elif cls.is_intra_theme:
            # Belongs to a single theme
            theme_id = cls.target_themes[0]
            theme_buckets[theme_id]["intra_mixed"].append(eq)
        elif cls.is_cross_theme:
            # Bridges multiple themes
            for theme_id in cls.target_themes:
                theme_buckets[theme_id]["cross_synthesis"].append(eq)

    # 4. Generate 24 Sub-Topic PDFs + Markschemes
    print("\n📚 Generating 24 Focused Sub-Topic PDFs + Markschemes...")
    manifest_subtopics = {}

    for code, data in SUBTOPICS.items():
        title_sanitized = data["title"].replace(" ", "_").replace(",", "").replace("-", "_")
        qp_filename = f"{code}_{title_sanitized}.pdf"
        ms_filename = f"{code}_{title_sanitized}_MS.pdf"
        qp_out = os.path.join(OUTPUT_VAULT_DIR, qp_filename)
        ms_out = os.path.join(OUTPUT_VAULT_DIR, ms_filename)

        qs = subtopic_pure_buckets[code]
        # Order chronologically (newest first), Paper 1 first then Paper 2/3
        qs.sort(key=lambda q: (q.year, q.session, -1 if "Paper 1" in q.paper_type else 1), reverse=True)

        mcq_cnt = sum(1 for q in qs if "Paper 1" in q.paper_type or q.paper_code == "P1")
        frq_cnt = len(qs) - mcq_cnt
        sl_cnt = sum(1 for q in qs if q.level == "SL")
        hl_cnt = sum(1 for q in qs if q.level == "HL")

        theme_info = THEMES[data["theme"]]
        subtitle = f"{data['description']}"

        assemble_topical_pdf(
            questions=qs,
            output_path=qp_out,
            title=f"Sub-Topic {code}: {data['title']}",
            subtitle=subtitle,
            theme_name=f"Theme {data['theme']}: {theme_info['title']}",
            is_markscheme=False
        )

        assemble_topical_pdf(
            questions=qs,
            output_path=ms_out,
            title=f"Sub-Topic {code}: {data['title']}",
            subtitle=subtitle,
            theme_name=f"Theme {data['theme']}: {theme_info['title']}",
            is_markscheme=True
        )

        manifest_subtopics[code] = {
            "code": code,
            "title": data["title"],
            "theme": data["theme"],
            "theme_title": theme_info["title"],
            "hl_only": data["hl_only"],
            "description": data["description"],
            "total_questions": len(qs),
            "mcq_count": mcq_cnt,
            "frq_count": frq_cnt,
            "sl_count": sl_cnt,
            "hl_count": hl_cnt,
            "pure_count": len(qs),
            "mixed_count": 0,
            "qp_path": f"/vault/physics-topicals/{qp_filename}",
            "ms_path": f"/vault/physics-topicals/{ms_filename}"
        }
        print(f"  ✓ [{code}] {data['title']} ({len(qs)} Qs: {mcq_cnt} MCQs, {frq_cnt} FRQs)")

    # 5. Generate 5 Master Theme PDFs + Markschemes
    print("\n🏛️ Generating 5 Master Theme PDFs + Markschemes...")
    manifest_themes = {}

    for theme_id, t_info in THEMES.items():
        qp_filename = f"Theme_{theme_id}_Master.pdf"
        ms_filename = f"Theme_{theme_id}_Master_MS.pdf"
        qp_out = os.path.join(OUTPUT_VAULT_DIR, qp_filename)
        ms_out = os.path.join(OUTPUT_VAULT_DIR, ms_filename)

        theme_data = theme_buckets[theme_id]
        # Build structured sections for the Master Theme booklet
        sections = []
        all_theme_qs = []

        # Section 1..N: Pure Sub-Topics
        for st_code, st_info in SUBTOPICS.items():
            if st_info["theme"] == theme_id:
                st_qs = theme_data["pure"][st_code]
                if st_qs:
                    st_qs.sort(key=lambda q: (q.year, q.session), reverse=True)
                    sections.append((f"Section: {st_code} {st_info['title']} (Pure)", st_qs))
                    all_theme_qs.extend(st_qs)

        # Section Intra-Theme Mixed
        intra_qs = theme_data["intra_mixed"]
        if intra_qs:
            intra_qs.sort(key=lambda q: (q.year, q.session), reverse=True)
            sections.append((f"Section: Intra-Theme Mixed Questions (Theme {theme_id})", intra_qs))
            all_theme_qs.extend(intra_qs)

        # Section Cross-Theme Synthesis
        cross_qs = theme_data["cross_synthesis"]
        if cross_qs:
            cross_qs.sort(key=lambda q: (q.year, q.session), reverse=True)
            sections.append((f"Section: Cross-Theme Synthesis Questions", cross_qs))
            all_theme_qs.extend(cross_qs)

        pure_cnt = sum(len(theme_data["pure"][code]) for code in SUBTOPICS if SUBTOPICS[code]["theme"] == theme_id)
        intra_cnt = len(intra_qs)
        cross_cnt = len(cross_qs)

        subtitle = f"{t_info['description']} • Complete Pure & Synthesis Question Bank"

        assemble_topical_pdf(
            questions=None,
            output_path=qp_out,
            title=f"Theme {theme_id}: {t_info['title']}",
            subtitle=subtitle,
            theme_name=f"Theme {theme_id}: {t_info['title']}",
            is_markscheme=False,
            is_master=True,
            sections=sections
        )

        assemble_topical_pdf(
            questions=None,
            output_path=ms_out,
            title=f"Theme {theme_id}: {t_info['title']}",
            subtitle=subtitle,
            theme_name=f"Theme {theme_id}: {t_info['title']}",
            is_markscheme=True,
            is_master=True,
            sections=sections
        )

        manifest_themes[theme_id] = {
            "theme": theme_id,
            "title": t_info["title"],
            "description": t_info["description"],
            "color": t_info["color"],
            "accent": t_info["accent"],
            "total_questions": len(all_theme_qs),
            "pure_count": pure_cnt,
            "intra_mixed_count": intra_cnt,
            "cross_synthesis_count": cross_cnt,
            "subtopics": [code for code, s in SUBTOPICS.items() if s["theme"] == theme_id],
            "qp_path": f"/vault/physics-topicals/{qp_filename}",
            "ms_path": f"/vault/physics-topicals/{ms_filename}"
        }
        print(f"  ✓ [Theme {theme_id}] {t_info['title']} ({len(all_theme_qs)} Qs: {pure_cnt} Pure, {intra_cnt} Intra-Mixed, {cross_cnt} Cross-Synthesis)")

    # 6. Write Manifest
    manifest = {
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_questions_harvested": len(all_questions),
        "total_excluded_legacy": len(excluded_questions),
        "themes": manifest_themes,
        "subtopics": manifest_subtopics
    }

    with open(MAP_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n📊 Manifest map saved to: {MAP_OUTPUT_PATH}")

    duration = time.time() - start_time
    print(f"\n🎉 PIPELINE COMPLETED IN {duration:.1f} SECONDS!")
    print(f"   Generated 24 Sub-Topic PDFs + 24 MS PDFs")
    print(f"   Generated 5 Master Theme PDFs + 5 MS PDFs")
    print(f"   Indexed {len(all_questions)} questions across Themes A–E.")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate IB Physics Topical Past Papers")
    parser.add_argument("--start-year", type=int, default=2016, help="Earliest examination year (default 2016)")
    parser.add_argument("--end-year", type=int, default=2025, help="Latest examination year (default 2025)")
    parser.add_argument("--max-papers", type=int, default=None, help="Limit number of papers for testing")
    args = parser.parse_args()

    run_physics_topical_pipeline(
        start_year=args.start_year,
        end_year=args.end_year,
        max_papers=args.max_papers
    )

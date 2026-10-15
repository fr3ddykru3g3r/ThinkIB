#!/usr/bin/env python3
"""
generate-math-topical-pdfs.py
==============================
End-to-end vector slicing, classification, and compilation pipeline for IB Mathematics.
Crawls the 'IB PAST PAPERS - YEAR' archive (2016–2025) for:
  - Mathematics: Analysis and Approaches (AA SL/HL)
  - Mathematics: Applications and Interpretation (AI SL/HL)
  - Legacy Mathematics (SL/HL) (2016–2020)
  - Legacy Mathematical Studies (SL) (2016–2020)

Extracts every question and markscheme block with 100% vector fidelity using PyMuPDF (fitz),
classifies them into Themes T1–T5 and Sub-Topics T1.1–T5.5, filters out retired legacy content,
preserves [NO CALCULATOR - P1] vs [CALCULATOR ALLOWED - P2/P3] tags, and compiles:
  1. 25 Sub-Topic PDFs + 25 Sub-Topic Markscheme PDFs (Pure questions)
  2. 5 Master Theme PDFs + 5 Master Markscheme PDFs (Pure + Section B Mixed/Synthesis)
  3. Manifest index 'math_topicals_map.json' and 'excluded_math_legacy.json'
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

# Ensure script can import math_taxonomy
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from math_taxonomy import (
    THEMES,
    SUBTOPICS,
    ClassificationResult,
    classify_math_question,
    check_exclusion
)

# Configuration & Paths
REPO_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
PAST_PAPERS_DIR = os.path.join(REPO_ROOT, "IB PAST PAPERS - YEAR")
OUTPUT_VAULT_DIR = os.path.join(CURRENT_DIR, "../public/vault/math-topicals")
MAP_OUTPUT_PATH = os.path.join(CURRENT_DIR, "../app/past-papers/math_topicals_map.json")
EXCLUDED_LOG_PATH = os.path.join(CURRENT_DIR, "../app/past-papers/excluded_math_legacy.json")

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
    clip_rect: List[float]  # [x0, y0, x1, y1]

@dataclass
class ExtractedQuestion:
    id: str
    year: int
    session: str         # "May" | "Nov"
    tz: str              # "TZ1" | "TZ2" | "TZ0" | "TZ3"
    level: str           # "SL" | "HL"
    course: str          # "AA" | "AI" | "Math" | "Studies"
    paper_type: str      # "Paper 1" | "Paper 2" | "Paper 3"
    paper_code: str      # "P1" | "P2" | "P3"
    calc_tag: str        # "[NO CALCULATOR - P1]" | "[CALCULATOR ALLOWED - P2]" | "[HL INVESTIGATION - P3]"
    course_level_tag: str # "[AA HL]" | "[AA SL]" | "[AI HL]" | "[AI SL]" | "[Math HL]" | ...
    q_num: int
    section: str         # "Section A" | "Section B" | "Section Investigation"
    source_label: str    # "May 2023 TZ1 HL Paper 1 Q3"
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
    """Extract year, session, timezone, course, level, and paper type from path/filename."""
    bn = os.path.basename(pdf_path)
    path_lower = pdf_path.lower()
    bn_lower = bn.lower()

    # Year (2016-2025)
    year = 2024
    for yr in range(2025, 2015, -1):
        if str(yr) in path_lower:
            year = yr
            break

    # Session
    session = "May"
    if "nov" in path_lower or "november" in path_lower:
        session = "Nov"

    # Timezone
    tz = "TZ1"
    if "tz2" in bn_lower:
        tz = "TZ2"
    elif "tz3" in bn_lower:
        tz = "TZ3"
    elif "tz0" in bn_lower or "tz 0" in bn_lower:
        tz = "TZ0"

    # Level
    level = "HL"
    if "sl" in bn_lower and "hl" not in bn_lower:
        level = "SL"
    elif "hl" in bn_lower:
        level = "HL"

    # Paper Type & Code
    paper_type = "Paper 1"
    paper_code = "P1"
    if "paper_2" in bn_lower or "paper 2" in bn_lower or "p2" in bn_lower:
        paper_type = "Paper 2"
        paper_code = "P2"
    elif "paper_3" in bn_lower or "paper 3" in bn_lower or "p3" in bn_lower:
        paper_type = "Paper 3"
        paper_code = "P3"

    # Course
    course = "AA"
    if "applications" in bn_lower:
        course = "AI"
    elif "studies" in bn_lower:
        course = "Studies"
    elif "further" in bn_lower:
        course = "Further"
    elif "analysis" not in bn_lower:
        course = "Math"

    # Calculator Tag & Course Level Tag
    if course == "AA":
        course_level_tag = f"[AA {level}]"
        if paper_code == "P1":
            calc_tag = "[NO CALCULATOR - P1]"
        elif paper_code == "P2":
            calc_tag = "[CALCULATOR ALLOWED - P2]"
        else:
            calc_tag = "[HL INVESTIGATION - P3]"
    elif course == "AI":
        course_level_tag = f"[AI {level}]"
        if paper_code == "P1":
            calc_tag = "[CALCULATOR ALLOWED - P1]"
        elif paper_code == "P2":
            calc_tag = "[CALCULATOR ALLOWED - P2]"
        else:
            calc_tag = "[HL INVESTIGATION - P3]"
    elif course == "Studies":
        course_level_tag = "[Studies SL]"
        calc_tag = f"[CALCULATOR ALLOWED - {paper_code}]"
    else:  # Legacy Math
        course_level_tag = f"[Math {level}]"
        if paper_code == "P1":
            calc_tag = "[NO CALCULATOR - P1]"
        elif paper_code == "P2":
            calc_tag = "[CALCULATOR ALLOWED - P2]"
        else:
            calc_tag = "[HL INVESTIGATION - P3]"

    is_markscheme = "markscheme" in bn_lower or "_ms" in bn_lower

    return {
        "year": year,
        "session": session,
        "tz": tz,
        "level": level,
        "course": course,
        "paper_type": paper_type,
        "paper_code": paper_code,
        "calc_tag": calc_tag,
        "course_level_tag": course_level_tag,
        "is_markscheme": is_markscheme,
        "filename": bn,
        "path": pdf_path
    }


def find_math_paper_pairs(
    base_dir: str,
    start_year: int = 2016,
    end_year: int = 2025
) -> List[Tuple[Dict[str, Any], Optional[str]]]:
    """Finds all Mathematics Question Papers and their matching Markschemes."""
    all_pdfs = glob.glob(f"{base_dir}/**/*.pdf", recursive=True)

    qp_candidates = []
    ms_lookup = {}

    for p in all_pdfs:
        bn = os.path.basename(p)
        if "math" not in bn.lower() or bn.startswith("."):
            continue
        meta = parse_paper_metadata(p)
        if not (start_year <= meta["year"] <= end_year):
            continue

        if meta["is_markscheme"]:
            # Lookup key
            k = f"{meta['year']}_{meta['session']}_{meta['course']}_{meta['level']}_{meta['paper_code']}_{meta['tz']}".lower()
            ms_lookup[k] = p
            # Exact filename stem match
            stem = bn.lower().replace("_markscheme", "").replace("markscheme", "").replace(".pdf", "")
            ms_lookup[stem] = p
        else:
            qp_candidates.append(meta)

    pairs = []
    for qp in qp_candidates:
        bn = qp["filename"]
        stem = bn.lower().replace(".pdf", "")
        d = os.path.dirname(qp["path"])

        found_ms = None
        for cand_name in [
            bn.replace(".pdf", "_markscheme.pdf"),
            bn.replace(".pdf", "_markscheme_en.pdf"),
            bn.replace(".pdf", "markscheme.pdf"),
            bn.replace(".pdf", "_MS.pdf")
        ]:
            cand = os.path.join(d, cand_name)
            if os.path.exists(cand):
                found_ms = cand
                break

        if not found_ms and stem in ms_lookup:
            found_ms = ms_lookup[stem]

        if not found_ms:
            k = f"{qp['year']}_{qp['session']}_{qp['course']}_{qp['level']}_{qp['paper_code']}_{qp['tz']}".lower()
            if k in ms_lookup:
                found_ms = ms_lookup[k]

        pairs.append((qp, found_ms))

    # Sort newest first, then AA/AI before legacy, then HL before SL
    pairs.sort(
        key=lambda x: (
            x[0]["year"],
            x[0]["session"],
            0 if x[0]["course"] in ["AA", "AI"] else 1,
            x[0]["level"],
            x[0]["paper_code"]
        ),
        reverse=True
    )
    return pairs


# ==============================================================================
# 3. QUESTION & MARKSCHEME SLICER
# ==============================================================================

def find_math_markscheme_slices(
    ms_path: Optional[str],
    num_questions: int
) -> Dict[int, List[MarkschemeSlice]]:
    """
    Slices a portrait markscheme into question-specific vector blocks for Q1..QN.
    Handles single-page questions and multi-page extended questions seamlessly.
    """
    if not ms_path or not os.path.exists(ms_path):
        return {}

    ms_slices_by_q: Dict[int, List[MarkschemeSlice]] = {}
    try:
        doc = fitz.open(ms_path)
        q_anchors = []

        # Find question anchors (skip first 3 pages of generic instructions)
        for p_idx in range(len(doc)):
            if p_idx < 3:
                continue
            blocks = doc[p_idx].get_text("blocks")
            for b in blocks:
                txt = b[4].strip()
                if b[0] < 85 and b[1] > 60:
                    m = re.match(r"^(\d+)\.\s*", txt)
                    if m:
                        qn = int(m.group(1))
                        if 1 <= qn <= num_questions + 1:
                            q_anchors.append((qn, p_idx, b[1]))

        q_anchors.sort(key=lambda x: (x[1], x[2]))

        # Filter strictly sequential 1..N
        filtered = []
        expected = 1
        for qn, p_idx, y in q_anchors:
            if qn == expected:
                filtered.append((qn, p_idx, y))
                expected += 1

        for i, (qn, start_p, start_y) in enumerate(filtered):
            slices = []
            if i + 1 < len(filtered):
                next_qn, next_p, next_y = filtered[i + 1]
            else:
                next_p = len(doc) - 1
                next_y = 800.0

            for p_idx in range(start_p, next_p + 1):
                top_y = max(60.0, start_y - 6.0) if p_idx == start_p else 60.0
                if p_idx == next_p and i + 1 < len(filtered):
                    bot_y = next_y - 6.0
                else:
                    bot_y = 790.0

                if bot_y > top_y + 15.0:
                    clip_rect = [35.0, top_y, min(565.0, doc[p_idx].rect.width - 30.0), bot_y]
                    slices.append(MarkschemeSlice(
                        ms_pdf=ms_path,
                        page_num=p_idx,
                        clip_rect=clip_rect
                    ))

            ms_slices_by_q[qn] = slices

        doc.close()
    except Exception as e:
        print(f"Warning: Failed slicing markscheme {ms_path}: {e}")

    return ms_slices_by_q


def extract_math_paper_questions(
    qp_meta: Dict[str, Any],
    ms_path: Optional[str]
) -> List[ExtractedQuestion]:
    """
    Extracts all structured questions (Section A & Section B) from a Mathematics Question Paper.
    Uses intelligent bottom clipping to eliminate blank working lines.
    """
    pdf_path = qp_meta["path"]
    questions: List[ExtractedQuestion] = []

    try:
        doc = fitz.open(pdf_path)

        # 1. Identify question anchors across pages
        # Anchor: (q_num, page_num, y_top, section_name)
        anchors = []
        current_section = "Section A" if qp_meta["paper_code"] != "P3" else "Section Investigation"

        for p_idx in range(len(doc)):
            page = doc[p_idx]
            blocks = page.get_text("blocks")

            for b in blocks:
                txt = b[4].strip()
                txt_lower = txt.lower()

                # Track Section headers
                if "section b" in txt_lower:
                    current_section = "Section B"
                elif "section a" in txt_lower:
                    current_section = "Section A"

                # Look for question start anchor: e.g. "1. [Maximum mark: 6]" or "1.\t"
                if b[0] < 85 and b[1] > 55:
                    m = re.match(r"^(\d+)\.\s*", txt)
                    if m:
                        q_n = int(m.group(1))
                        # Question numbers in IB Math are 1..25
                        if 1 <= q_n <= 25:
                            anchors.append((q_n, p_idx, b[1], current_section))

        anchors.sort(key=lambda x: (x[1], x[2]))

        # Filter strictly sequential 1..N
        filtered_anchors = []
        expected = 1
        for q_n, p_idx, y, sec in anchors:
            if q_n == expected:
                filtered_anchors.append((q_n, p_idx, y, sec))
                expected += 1

        if not filtered_anchors:
            doc.close()
            return []

        # 2. Extract markscheme slices for all questions in this paper
        ms_slices_dict = find_math_markscheme_slices(ms_path, len(filtered_anchors))

        # 3. Slice each question
        for i, (q_n, start_p, start_y, sec_name) in enumerate(filtered_anchors):
            if i + 1 < len(filtered_anchors):
                next_q_n, next_p, next_y, _ = filtered_anchors[i + 1]
            else:
                next_p = len(doc) - 1
                next_y = 800.0

            q_slices = []
            full_text_parts = []
            subparts = []

            for p_num in range(start_p, next_p + 1):
                page = doc[p_num]
                blocks = page.get_text("blocks")

                # Top clipping
                if p_num == start_p:
                    clip_top = max(60.0, start_y - 6.0)
                else:
                    # Check for continuation header (e.g. "(Question 8 continued)")
                    clip_top = 65.0
                    for b in blocks:
                        txt_l = b[4].lower()
                        if f"question {q_n} continued" in txt_l or f"question {q_n}" in txt_l:
                            clip_top = max(65.0, b[3] + 4.0)
                            break

                # Bottom clipping: remove blank answer lines on Section A pages
                if p_num == next_p and i + 1 < len(filtered_anchors):
                    clip_bot = next_y - 6.0
                else:
                    # Find last real prompt block on this page
                    last_content_y = 70.0
                    for b in blocks:
                        txt = b[4].strip()
                        # Ignore lines of dots, underscores, form feeds
                        is_dots = all(c in ".\x08 _-\ufffd" or ord(c) > 127 for c in txt)
                        is_footer = any(w in txt.lower() for w in [
                            "turn over", "continues on", "ep0", "international baccalaureate"
                        ])
                        if not is_dots and not is_footer and b[1] >= clip_top:
                            last_content_y = max(last_content_y, b[3] + 16.0)

                    clip_bot = min(775.0, min(page.rect.height - 40.0, max(clip_top + 30.0, last_content_y)))

                if clip_bot <= clip_top + 15.0:
                    continue

                clip_rect = [35.0, clip_top, min(565.0, page.rect.width - 30.0), clip_bot]
                q_slices.append(QuestionSlice(
                    src_pdf=pdf_path,
                    page_num=p_num,
                    clip_rect=clip_rect,
                    is_first_slice=(p_num == start_p)
                ))

                slice_text = page.get_text("text", clip=fitz.Rect(*clip_rect))
                full_text_parts.append(slice_text)

                # Extract subparts (a), (b), (c)...
                sp_matches = re.split(r"(?:^|\n)\s*\(([a-z])\)\s*", slice_text)
                if len(sp_matches) > 1:
                    for sp_idx in range(1, len(sp_matches), 2):
                        subparts.append(f"({sp_matches[sp_idx]}) {sp_matches[sp_idx+1]}")

            combined_text = "\n".join(full_text_parts).strip()
            if not combined_text:
                continue

            # Run classification
            res = classify_math_question(combined_text, subparts, paper_info=qp_meta)

            ms_slices = ms_slices_dict.get(q_n, [])

            source_label = f"{qp_meta['session']} {qp_meta['year']} {qp_meta['tz']} {qp_meta['level']} {qp_meta['paper_type']} Q{q_n}"

            eq = ExtractedQuestion(
                id=f"{qp_meta['year']}_{qp_meta['session']}_{qp_meta['course']}_{qp_meta['level']}_{qp_meta['paper_code']}_Q{q_n}",
                year=qp_meta["year"],
                session=qp_meta["session"],
                tz=qp_meta["tz"],
                level=qp_meta["level"],
                course=qp_meta["course"],
                paper_type=qp_meta["paper_type"],
                paper_code=qp_meta["paper_code"],
                calc_tag=qp_meta["calc_tag"],
                course_level_tag=qp_meta["course_level_tag"],
                q_num=q_n,
                section=sec_name,
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
        print(f"Error extracting questions from {pdf_path}: {e}")

    return questions


# ==============================================================================
# 4. VECTOR PDF STITCHER & COMPILER
# ==============================================================================

def draw_header_banner(
    page: fitz.Page,
    y_pos: float,
    label_text: str,
    course_level_tag: str,
    calc_tag: str,
    badge_text: str,
    is_ms: bool = False,
    page_width: float = A4_WIDTH
) -> float:
    """Draws a crisp editorial banner above each stitched question with full calculator tagging."""
    banner_height = 20.0
    margin_l = MARGIN_LEFT
    margin_r = page_width - MARGIN_LEFT
    banner_rect = fitz.Rect(margin_l, y_pos, margin_r, y_pos + banner_height)

    bg_fill = (0.94, 0.96, 0.98) if not is_ms else (0.98, 0.95, 0.92)
    border_col = (0.15, 0.35, 0.65) if not is_ms else (0.75, 0.35, 0.15)
    text_col = (0.1, 0.18, 0.3) if not is_ms else (0.4, 0.15, 0.05)

    # Outer pill bar
    page.draw_rect(banner_rect, fill=bg_fill, color=border_col, width=0.75)

    # Text composition
    full_banner_text = f"{label_text}  •  {course_level_tag}  •  {calc_tag}  •  {badge_text}"
    font_size = 7.5 if len(full_banner_text) > 65 else 8.5

    page.insert_text(
        fitz.Point(margin_l + 8.0, y_pos + 13.5),
        full_banner_text,
        fontname="helv",
        fontsize=font_size,
        color=text_col
    )
    return banner_height


def draw_cover_page(
    doc: fitz.Document,
    title: str,
    subtitle: str,
    theme_name: str,
    q_count: int,
    p1_count: int,
    p2_count: int,
    p3_count: int,
    is_markscheme: bool = False,
    is_master: bool = False,
    theme_color: Tuple[float, float, float] = (0.04, 0.41, 0.85)
):
    """Draws a clean, publication-grade cover page for the topical booklet."""
    page = doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)

    # Accent top bar
    bar_color = theme_color if not is_markscheme else (0.85, 0.35, 0.1)
    page.draw_rect(fitz.Rect(0, 0, A4_WIDTH, 8), fill=bar_color, color=None)

    # Header badge pill
    badge_rect = fitz.Rect(50, 60, 420, 80)
    page.draw_rect(badge_rect, fill=(0.95, 0.97, 1.0), color=bar_color, width=0.8)
    badge_title = "IB DIPLOMA PROGRAMME • MATHEMATICS ARCHIVE (AA & AI)"
    if is_markscheme:
        badge_title += " • MARKSCHEME"
    page.insert_text(fitz.Point(62, 74), badge_title, fontsize=8, fontname="helv", color=bar_color)

    # Title & Subtitle
    display_title = title if not is_markscheme else f"{title} (Markscheme)"
    page.insert_text(fitz.Point(50, 130), display_title, fontsize=22, fontname="helv", color=(0.1, 0.12, 0.16))
    page.insert_text(fitz.Point(50, 155), subtitle[:95], fontsize=11, fontname="helv", color=(0.4, 0.45, 0.52))

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
    stats_str = f"{q_count} Questions ({p1_count} P1 • {p2_count} P2 • {p3_count} P3)"
    page.insert_text(fitz.Point(320, 246), stats_str, fontsize=10.5, fontname="helv", color=(0.1, 0.15, 0.25))

    # Card 3: Year Coverage
    page.draw_rect(fitz.Rect(50, 285, 290, 355), fill=(0.97, 0.98, 0.99), color=(0.85, 0.88, 0.92), width=0.8)
    page.insert_text(fitz.Point(65, 307), "EXAMINATION COVERAGE", fontsize=8, fontname="helv", color=(0.45, 0.5, 0.55))
    page.insert_text(fitz.Point(65, 331), "May 2016 – May 2025 Sessions", fontsize=11, fontname="helv", color=(0.1, 0.15, 0.25))

    # Card 4: Assessment Level
    page.draw_rect(fitz.Rect(305, 285, 545, 355), fill=(0.97, 0.98, 0.99), color=(0.85, 0.88, 0.92), width=0.8)
    page.insert_text(fitz.Point(320, 307), "COURSES & PAPERS", fontsize=8, fontname="helv", color=(0.45, 0.5, 0.55))
    page.insert_text(fitz.Point(320, 331), "AA SL/HL, AI SL/HL & Legacy Math", fontsize=11, fontname="helv", color=(0.1, 0.15, 0.25))

    # Notes section
    page.draw_rect(fitz.Rect(50, 380, 545, 485), fill=(0.99, 0.99, 1.0), color=(0.8, 0.85, 0.95), width=0.8)
    page.insert_text(fitz.Point(65, 405), "SYLLABUS & COMPILATION NOTES:", fontsize=9, fontname="helv", color=bar_color)
    notes = [
        "• All questions classified strictly under the 2025 IB Mathematics Curriculum (Themes T1–T5).",
        "• Retired syllabus items (Abstract Algebra, Convergence Tests, Congruences) filtered out.",
        "• Calculator requirements preserved: [NO CALCULATOR - P1] vs [CALCULATOR ALLOWED - P2/P3].",
        "• High-resolution vector extraction via PyMuPDF ensures crisp rendering without raster compression.",
        "• Paired markscheme solutions available via the split-screen self-grader in ThinkIB."
    ]
    for idx, line in enumerate(notes):
        page.insert_text(fitz.Point(65, 425 + idx * 13), line, fontsize=8.2, fontname="helv", color=(0.25, 0.3, 0.35))

    # Footer note
    page.insert_text(fitz.Point(50, 810), "ThinkIB Official Mathematics Examination Archive • Generated with PyMuPDF", fontsize=8, fontname="helv", color=(0.55, 0.6, 0.65))


def hex_to_rgb(hex_str: str) -> Tuple[float, float, float]:
    """Convert hex string '#0969da' to RGB tuple of floats."""
    hex_str = hex_str.lstrip("#")
    return tuple(int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4))


def assemble_topical_pdf(
    questions: Optional[List[ExtractedQuestion]],
    output_path: str,
    title: str,
    subtitle: str,
    theme_name: str,
    is_markscheme: bool = False,
    is_master: bool = False,
    sections: Optional[List[Tuple[str, List[ExtractedQuestion]]]] = None,
    theme_color_hex: str = "#0969da"
):
    """Assembles vector slices into an A4 topical booklet."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    out_doc = fitz.open()

    if sections:
        all_qs = [q for _, q_list in sections for q in q_list]
    else:
        all_qs = questions or []

    p1_count = sum(1 for q in all_qs if q.paper_code == "P1")
    p2_count = sum(1 for q in all_qs if q.paper_code == "P2")
    p3_count = sum(1 for q in all_qs if q.paper_code == "P3")

    theme_color = hex_to_rgb(theme_color_hex)

    # 1. Add Cover Page
    draw_cover_page(
        out_doc,
        title=title,
        subtitle=subtitle,
        theme_name=theme_name,
        q_count=len(all_qs),
        p1_count=p1_count,
        p2_count=p2_count,
        p3_count=p3_count,
        is_markscheme=is_markscheme,
        is_master=is_master,
        theme_color=theme_color
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

    def render_question_group(q_list: List[ExtractedQuestion], sec_title: Optional[str] = None):
        nonlocal current_page, current_y
        if not q_list:
            return

        if sec_title:
            current_page = out_doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)
            current_y = TOP_MARGIN
            page_num_1indexed = len(out_doc)
            actual_toc.append([1, sec_title, page_num_1indexed])

            sec_rect = fitz.Rect(MARGIN_LEFT, current_y, MARGIN_RIGHT, current_y + 28.0)
            current_page.draw_rect(sec_rect, fill=(0.92, 0.95, 0.99), color=(0.1, 0.35, 0.7), width=1.0)
            current_page.insert_text(
                fitz.Point(MARGIN_LEFT + 10.0, current_y + 18.0),
                sec_title.upper(),
                fontname="helv",
                fontsize=9.5,
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
                        banner_h = draw_header_banner(
                            current_page, current_y, label_text, q.course_level_tag, q.calc_tag, badge_text, is_ms=False
                        )
                        current_y += banner_h + 4.0

                    target_rect = fitz.Rect(MARGIN_LEFT, current_y, MARGIN_LEFT + render_w, current_y + render_h)
                    clip_rect = fitz.Rect(*q_slice.clip_rect)
                    current_page.show_pdf_page(target_rect, s_doc, q_slice.page_num, clip=clip_rect)
                    current_y += render_h + 12.0
            else:
                # Markscheme rendering
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
                            banner_h = draw_header_banner(
                                current_page, current_y, label_text, q.course_level_tag, q.calc_tag, badge_text, is_ms=True
                            )
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

                    draw_header_banner(
                        current_page, current_y, label_text, q.course_level_tag, q.calc_tag, badge_text, is_ms=True
                    )
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

    if actual_toc:
        out_doc.set_toc(actual_toc)

    out_doc.save(output_path, garbage=3, deflate=True)
    out_doc.close()

    for d in source_docs.values():
        try:
            d.close()
        except:
            pass


# ==============================================================================
# 5. PIPELINE EXECUTION & ORCHESTRATION
# ==============================================================================

def run_math_topical_pipeline(
    start_year: int = 2016,
    end_year: int = 2025,
    max_papers: Optional[int] = None
):
    """Executes the full Mathematics extraction, classification, and compilation pipeline."""
    print("=" * 70)
    print("⚡ STARTING IB MATHEMATICS (AA & AI) TOPICAL PAST PAPER GENERATION")
    print(f"Archive Directory : {PAST_PAPERS_DIR}")
    print(f"Output Vault      : {OUTPUT_VAULT_DIR}")
    print(f"Year Scope        : {start_year} – {end_year}")
    print("=" * 70)

    start_time = time.time()
    os.makedirs(OUTPUT_VAULT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MAP_OUTPUT_PATH), exist_ok=True)

    # 1. Find all Mathematics QP/MS pairs
    pairs = find_math_paper_pairs(PAST_PAPERS_DIR, start_year, end_year)
    if max_papers:
        pairs = pairs[:max_papers]
    print(f"\n📂 Identified {len(pairs)} Question Paper / Markscheme pairs.")

    # 2. Extract and classify all questions
    all_questions: List[ExtractedQuestion] = []
    excluded_questions: List[Dict[str, Any]] = []

    print("\n🔍 Extracting and Classifying questions across all papers...")
    for idx, (qp_meta, ms_path) in enumerate(pairs):
        extracted = extract_math_paper_questions(qp_meta, ms_path)

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

        if (idx + 1) % 20 == 0 or idx == len(pairs) - 1:
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
    subtopic_pure_buckets: Dict[str, List[ExtractedQuestion]] = {code: [] for code in SUBTOPICS}
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
            theme_id = cls.target_themes[0]
            theme_buckets[theme_id]["intra_mixed"].append(eq)
        elif cls.is_cross_theme:
            for theme_id in cls.target_themes:
                theme_buckets[theme_id]["cross_synthesis"].append(eq)

    # 4. Generate 25 Sub-Topic PDFs + Markschemes
    print("\n📚 Generating 25 Focused Sub-Topic PDFs + Markschemes...")
    manifest_subtopics = {}
    for code, data in SUBTOPICS.items():
        raw_title = data["title"]
        title_sanitized = raw_title.replace("/", "_and_").replace("&", "and").replace(":", "")
        title_sanitized = title_sanitized.replace(" ", "_").replace(",", "").replace("-", "_")
        title_sanitized = re.sub(r'[^A-Za-z0-9_]', '', title_sanitized)
        title_sanitized = re.sub(r'_+', '_', title_sanitized).strip('_')
        qp_filename = f"{code}_{title_sanitized}.pdf"
        ms_filename = f"{code}_{title_sanitized}_MS.pdf"
        qp_out = os.path.join(OUTPUT_VAULT_DIR, qp_filename)
        ms_out = os.path.join(OUTPUT_VAULT_DIR, ms_filename)

        qs = subtopic_pure_buckets[code]
        qs.sort(key=lambda q: (q.year, q.session, -1 if q.paper_code == "P1" else 1), reverse=True)

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
            is_markscheme=False,
            theme_color_hex=theme_info["color"]
        )

        assemble_topical_pdf(
            questions=qs,
            output_path=ms_out,
            title=f"Sub-Topic {code}: {data['title']}",
            subtitle=subtitle,
            theme_name=f"Theme {data['theme']}: {theme_info['title']}",
            is_markscheme=True,
            theme_color_hex=theme_info["color"]
        )

        manifest_subtopics[code] = {
            "code": code,
            "title": data["title"],
            "theme": data["theme"],
            "theme_title": theme_info["title"],
            "hl_only": data["hl_only"],
            "description": data["description"],
            "total_questions": len(qs),
            "mcq_count": 0,
            "frq_count": len(qs),
            "sl_count": sl_cnt,
            "hl_count": hl_cnt,
            "pure_count": len(qs),
            "mixed_count": 0,
            "qp_path": f"/vault/math-topicals/{qp_filename}",
            "ms_path": f"/vault/math-topicals/{ms_filename}"
        }
        print(f"  ✓ [{code}] {data['title']} ({len(qs)} Qs: {sl_cnt} SL, {hl_cnt} HL)")

    # 5. Generate 5 Master Theme PDFs + Markschemes
    print("\n🏛️ Generating 5 Master Theme PDFs + Markschemes...")
    manifest_themes = {}

    for theme_id, t_info in THEMES.items():
        qp_filename = f"Theme_{theme_id}_Master.pdf"
        ms_filename = f"Theme_{theme_id}_Master_MS.pdf"
        qp_out = os.path.join(OUTPUT_VAULT_DIR, qp_filename)
        ms_out = os.path.join(OUTPUT_VAULT_DIR, ms_filename)

        theme_data = theme_buckets[theme_id]
        sections = []
        all_theme_qs = []

        # Section 1..K: Pure Sub-Topics
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

        # Section Cross-Theme Synthesis (Section B Extended)
        cross_qs = theme_data["cross_synthesis"]
        if cross_qs:
            cross_qs.sort(key=lambda q: (q.year, q.session), reverse=True)
            sections.append((f"Section: Cross-Theme Synthesis Questions (Section B Extended)", cross_qs))
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
            sections=sections,
            theme_color_hex=t_info["color"]
        )

        assemble_topical_pdf(
            questions=None,
            output_path=ms_out,
            title=f"Theme {theme_id}: {t_info['title']}",
            subtitle=subtitle,
            theme_name=f"Theme {theme_id}: {t_info['title']}",
            is_markscheme=True,
            is_master=True,
            sections=sections,
            theme_color_hex=t_info["color"]
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
            "qp_path": f"/vault/math-topicals/{qp_filename}",
            "ms_path": f"/vault/math-topicals/{ms_filename}"
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
    print(f"   Generated 25 Sub-Topic PDFs + 25 MS PDFs")
    print(f"   Generated 5 Master Theme PDFs + 5 MS PDFs")
    print(f"   Indexed {len(all_questions)} questions across Themes T1–T5.")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate IB Mathematics Topical Past Papers")
    parser.add_argument("--start-year", type=int, default=2016, help="Earliest examination year (default 2016)")
    parser.add_argument("--end-year", type=int, default=2025, help="Latest examination year (default 2025)")
    parser.add_argument("--max-papers", type=int, default=None, help="Limit number of papers for testing")
    args = parser.parse_args()

    run_math_topical_pipeline(
        start_year=args.start_year,
        end_year=args.end_year,
        max_papers=args.max_papers
    )

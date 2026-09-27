#!/usr/bin/env python3
"""
NetSage AI — Dashboard Builder
--------------------------------
Builds dashboard/netsage_dashboard.xlsx summarizing:
  - Case counts and severity by fault category
  - AI vs human review outcomes (Accepted / Edited / Rejected)
  - AI-human agreement rate
All summary values use live formulas (COUNTIFS / COUNTA) referencing the raw
data sheets, per project convention -- nothing here is a hardcoded Python total.
"""
import csv
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, PieChart, Reference
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

BASE = Path(__file__).resolve().parent.parent
CASES_CSV = BASE / "data" / "cases.csv"
DIAG_CSV = BASE / "data" / "ai_diagnoses.csv"
OUT_XLSX = BASE / "dashboard" / "netsage_dashboard.xlsx"

FONT_NAME = "Arial"
HEADER_FILL = PatternFill("solid", fgColor="1F4E78")
HEADER_FONT = Font(name=FONT_NAME, bold=True, color="FFFFFF")
TITLE_FONT = Font(name=FONT_NAME, bold=True, size=14, color="1F4E78")
LABEL_FONT = Font(name=FONT_NAME, bold=True)
BODY_FONT = Font(name=FONT_NAME)
THIN = Side(style="thin", color="B7B7B7")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

CATEGORIES = ["VLAN", "Gateway", "DHCP", "DNS", "Routing", "ACL", "NAT", "Wireless"]
SEVERITIES = ["High", "Medium", "Low"]
DECISIONS = ["Accepted", "Edited", "Rejected"]


def style_header_row(ws, row, n_cols):
    for c in range(1, n_cols + 1):
        cell = ws.cell(row=row, column=c)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = BORDER


def autosize(ws, widths):
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def main():
    cases = load_csv(CASES_CSV)
    diagnoses = load_csv(DIAG_CSV)

    wb = Workbook()

    # ---------------- Sheet: Cases (raw data) ----------------
    ws_cases = wb.active
    ws_cases.title = "Cases"
    headers = ["case_id", "category", "severity", "osi_layer", "concept_tag"]
    ws_cases.append(headers)
    style_header_row(ws_cases, 1, len(headers))
    for c in cases:
        ws_cases.append([c["case_id"], c["category"], c["severity"], c["osi_layer"], c["concept_tag"]])
    for row in ws_cases.iter_rows(min_row=2, max_row=ws_cases.max_row, max_col=len(headers)):
        for cell in row:
            cell.font = BODY_FONT
            cell.border = BORDER
    autosize(ws_cases, [10, 12, 10, 12, 32])
    n_cases = len(cases)

    # ---------------- Sheet: Diagnoses (raw data) ----------------
    ws_diag = wb.create_sheet("Diagnoses")
    headers2 = ["case_id", "category", "reviewer_decision"]
    ws_diag.append(headers2)
    style_header_row(ws_diag, 1, len(headers2))
    for d in diagnoses:
        ws_diag.append([d["case_id"], d["category"], d["reviewer_decision"]])
    for row in ws_diag.iter_rows(min_row=2, max_row=ws_diag.max_row, max_col=len(headers2)):
        for cell in row:
            cell.font = BODY_FONT
            cell.border = BORDER
    autosize(ws_diag, [10, 12, 18])
    n_diag = len(diagnoses)

    # ---------------- Sheet: Dashboard (formula-driven summary) ----------------
    ws = wb.create_sheet("Dashboard")
    ws["A1"] = "NetSage AI — Troubleshooting Dashboard"
    ws["A1"].font = TITLE_FONT
    ws["A2"] = "Live summary computed from the Cases and Diagnoses sheets via formulas."
    ws["A2"].font = Font(name=FONT_NAME, italic=True, size=9, color="666666")

    # --- Table 1: Cases by category ---
    r0 = 4
    ws.cell(row=r0, column=1, value="Cases by Fault Category").font = LABEL_FONT
    ws.cell(row=r0 + 1, column=1, value="Category")
    ws.cell(row=r0 + 1, column=2, value="Case Count")
    style_header_row(ws, r0 + 1, 2)
    for i, cat in enumerate(CATEGORIES):
        rr = r0 + 2 + i
        ws.cell(row=rr, column=1, value=cat).font = BODY_FONT
        ws.cell(row=rr, column=2,
                value=f'=COUNTIF(Cases!B2:B{n_cases + 1},A{rr})').font = BODY_FONT
        ws.cell(row=rr, column=1).border = BORDER
        ws.cell(row=rr, column=2).border = BORDER
    total_row = r0 + 2 + len(CATEGORIES)
    ws.cell(row=total_row, column=1, value="Total").font = LABEL_FONT
    ws.cell(row=total_row, column=2,
            value=f'=SUM(B{r0 + 2}:B{total_row - 1})').font = LABEL_FONT

    # --- Table 2: Severity breakdown ---
    r1 = total_row + 3
    ws.cell(row=r1, column=1, value="Cases by Severity").font = LABEL_FONT
    ws.cell(row=r1 + 1, column=1, value="Severity")
    ws.cell(row=r1 + 1, column=2, value="Case Count")
    style_header_row(ws, r1 + 1, 2)
    for i, sev in enumerate(SEVERITIES):
        rr = r1 + 2 + i
        ws.cell(row=rr, column=1, value=sev).font = BODY_FONT
        ws.cell(row=rr, column=2,
                value=f'=COUNTIF(Cases!C2:C{n_cases + 1},A{rr})').font = BODY_FONT
        ws.cell(row=rr, column=1).border = BORDER
        ws.cell(row=rr, column=2).border = BORDER
    sev_total_row = r1 + 2 + len(SEVERITIES)

    # --- Table 3: AI vs Human Review outcomes ---
    r2 = sev_total_row + 3
    ws.cell(row=r2, column=1, value="AI Diagnosis Review Outcomes").font = LABEL_FONT
    ws.cell(row=r2 + 1, column=1, value="Decision")
    ws.cell(row=r2 + 1, column=2, value="Count")
    ws.cell(row=r2 + 1, column=3, value="% of Total")
    style_header_row(ws, r2 + 1, 3)
    for i, dec in enumerate(DECISIONS):
        rr = r2 + 2 + i
        ws.cell(row=rr, column=1, value=dec).font = BODY_FONT
        ws.cell(row=rr, column=2,
                value=f'=COUNTIF(Diagnoses!C2:C{n_diag + 1},A{rr})').font = BODY_FONT
        ws.cell(row=rr, column=3,
                value=f'=B{rr}/{n_diag}').font = BODY_FONT
        ws.cell(row=rr, column=3).number_format = "0.0%"
        for cc in (1, 2, 3):
            ws.cell(row=rr, column=cc).border = BORDER
    dec_total_row = r2 + 2 + len(DECISIONS)

    # --- Headline metric: AI-human agreement rate ---
    r3 = dec_total_row + 2
    ws.cell(row=r3, column=1, value="AI-Human Agreement Rate (Accepted / Total)").font = LABEL_FONT
    agree_cell = ws.cell(row=r3, column=2,
                          value=f'=B{r2 + 2}/{n_diag}')
    agree_cell.number_format = "0.0%"
    agree_cell.font = Font(name=FONT_NAME, bold=True, size=12, color="1F4E78")

    r4 = r3 + 1
    ws.cell(row=r4, column=1, value="Cases Requiring Correction (Edited + Rejected)").font = LABEL_FONT
    ws.cell(row=r4, column=2, value=f'=B{r2+3}+B{r2+4}').font = Font(name=FONT_NAME, bold=True)

    autosize(ws, [42, 14, 12])

    # ---------------- Charts ----------------
    # Bar chart: cases by category
    bar = BarChart()
    bar.title = "Cases by Fault Category"
    bar.y_axis.title = "Case Count"
    bar.x_axis.title = "Category"
    bar.style = 10
    cats_ref = Reference(ws, min_col=1, min_row=r0 + 2, max_row=r0 + 1 + len(CATEGORIES))
    data_ref = Reference(ws, min_col=2, min_row=r0 + 1, max_row=r0 + 1 + len(CATEGORIES))
    bar.add_data(data_ref, titles_from_data=True)
    bar.set_categories(cats_ref)
    bar.width, bar.height = 16, 9
    ws.add_chart(bar, "E4")

    # Pie chart: AI review outcomes
    pie = PieChart()
    pie.title = "AI Diagnosis Review Outcomes"
    labels = Reference(ws, min_col=1, min_row=r2 + 2, max_row=r2 + 1 + len(DECISIONS))
    data_ref2 = Reference(ws, min_col=2, min_row=r2 + 1, max_row=r2 + 1 + len(DECISIONS))
    pie.add_data(data_ref2, titles_from_data=True)
    pie.set_categories(labels)
    pie.width, pie.height = 16, 9
    ws.add_chart(pie, "E22")

    wb.move_sheet("Dashboard", offset=-2)  # put Dashboard first
    OUT_XLSX.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT_XLSX)
    print(f"Dashboard written to {OUT_XLSX}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
NetSage AI — HTML Dashboard Builder
-------------------------------------
Builds dashboard/netsage_dashboard.html: a single-file, interactive dashboard
(KPIs, charts, filterable case table, Responsible AI log) built from the same
three CSVs as the Excel dashboard, so both stay in sync. Chart.js is loaded
from cdnjs; everything else is inline, so the file opens standalone in any
browser with no server or build step.
"""
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
CASES_CSV = BASE / "data" / "cases.csv"
DIAG_CSV = BASE / "data" / "ai_diagnoses.csv"
RULE_CSV = BASE / "data" / "rule_checker_results.csv"
OUT_HTML = BASE / "dashboard" / "netsage_dashboard.html"

CATEGORY_ORDER = ["VLAN", "Gateway", "DHCP", "DNS", "Routing", "ACL", "NAT", "Wireless"]
SEVERITY_ORDER = ["High", "Medium", "Low"]
DECISION_ORDER = ["Accepted", "Edited", "Rejected"]

SEVERITY_COLOR = {"High": "#C0392B", "Medium": "#D9822B", "Low": "#2E7D5B"}
DECISION_COLOR = {"Accepted": "#2E7D5B", "Edited": "#D9822B", "Rejected": "#C0392B"}


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def main():
    cases = load_csv(CASES_CSV)
    diagnoses = {d["case_id"]: d for d in load_csv(DIAG_CSV)}
    rules = {r["case_id"]: r for r in load_csv(RULE_CSV)}

    merged = []
    for c in cases:
        cid = c["case_id"]
        d = diagnoses.get(cid, {})
        r = rules.get(cid, {})
        merged.append({
            "case_id": cid,
            "category": c["category"],
            "severity": c["severity"],
            "osi_layer": c["osi_layer"],
            "concept_tag": c["concept_tag"],
            "symptom": c["symptom"],
            "expected_fault": c["expected_fault"],
            "ai_root_cause": d.get("ai_root_cause", ""),
            "ai_confidence": d.get("ai_confidence", ""),
            "reviewer_decision": d.get("reviewer_decision", ""),
            "correction_reason": d.get("correction_reason", ""),
            "rule_flags": r.get("flags_raised", "none"),
        })

    cat_counts = Counter(c["category"] for c in merged)
    sev_counts = Counter(c["severity"] for c in merged)
    dec_counts = Counter(c["reviewer_decision"] for c in merged)
    total = len(merged)
    agreement = dec_counts.get("Accepted", 0) / total * 100 if total else 0
    corrected = dec_counts.get("Edited", 0) + dec_counts.get("Rejected", 0)
    rule_flagged = sum(1 for c in merged if c["rule_flags"] not in ("none", ""))

    corrected_cases = [c for c in merged if c["reviewer_decision"] in ("Edited", "Rejected")]

    data_json = json.dumps({
        "cases": merged,
        "categoryOrder": CATEGORY_ORDER,
        "categoryCounts": [cat_counts.get(k, 0) for k in CATEGORY_ORDER],
        "severityOrder": SEVERITY_ORDER,
        "severityCounts": [sev_counts.get(k, 0) for k in SEVERITY_ORDER],
        "decisionOrder": DECISION_ORDER,
        "decisionCounts": [dec_counts.get(k, 0) for k in DECISION_ORDER],
    })

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NetSage AI — Troubleshooting Dashboard</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js"></script>
<style>
  :root {{
    --navy: #0F3057;
    --teal: #1C7293;
    --ice: #E8F1F5;
    --ink: #16232E;
    --muted: #5B6B77;
    --card-bg: #FFFFFF;
    --bg: #F3F6F8;
    --good: #2E7D5B;
    --warn: #D9822B;
    --bad: #C0392B;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: var(--bg);
    color: var(--ink);
  }}
  header {{
    background: linear-gradient(120deg, var(--navy), var(--teal));
    color: #fff;
    padding: 28px 32px;
  }}
  header h1 {{ margin: 0 0 4px 0; font-size: 26px; }}
  header p {{ margin: 0; opacity: 0.9; font-size: 14px; }}
  main {{ max-width: 1180px; margin: 0 auto; padding: 24px 20px 60px; }}
  .kpi-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }}
  .kpi-card {{
    background: var(--card-bg);
    border-radius: 10px;
    padding: 18px 20px;
    box-shadow: 0 1px 3px rgba(15,48,87,0.12);
    border-top: 3px solid var(--teal);
  }}
  .kpi-card .value {{ font-size: 30px; font-weight: bold; color: var(--navy); }}
  .kpi-card .label {{ font-size: 12.5px; color: var(--muted); margin-top: 4px; }}
  .chart-grid {{
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 28px;
  }}
  .card {{
    background: var(--card-bg);
    border-radius: 10px;
    padding: 18px 20px;
    box-shadow: 0 1px 3px rgba(15,48,87,0.12);
  }}
  .card h2 {{ font-size: 15px; margin: 0 0 12px 0; color: var(--navy); }}
  section.block {{ margin-bottom: 28px; }}
  section.block > h2 {{ font-size: 18px; color: var(--navy); margin-bottom: 12px; }}
  .filters {{
    display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; align-items: center;
  }}
  .filters select, .filters input {{
    padding: 8px 10px; border-radius: 6px; border: 1px solid #C7D2D9; font-size: 13px; font-family: Arial;
  }}
  table {{ width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(15,48,87,0.12);}}
  th, td {{ text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #EAEFF2; vertical-align: top; }}
  th {{ background: var(--navy); color: #fff; font-weight: 600; position: sticky; top: 0; }}
  tr:hover td {{ background: var(--ice); }}
  .badge {{
    display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 11.5px; font-weight: bold; color: #fff;
  }}
  .badge.High {{ background: var(--bad); }}
  .badge.Medium {{ background: var(--warn); }}
  .badge.Low {{ background: var(--good); }}
  .badge.Accepted {{ background: var(--good); }}
  .badge.Edited {{ background: var(--warn); }}
  .badge.Rejected {{ background: var(--bad); }}
  .rai-item {{
    background: var(--card-bg); border-left: 4px solid var(--warn); border-radius: 6px;
    padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(15,48,87,0.08);
  }}
  .rai-item.Rejected {{ border-left-color: var(--bad); }}
  .rai-item h3 {{ margin: 0 0 6px 0; font-size: 14.5px; color: var(--navy); }}
  .rai-item p {{ margin: 4px 0; font-size: 13px; color: var(--ink); }}
  .rai-item .tag {{ font-size: 11.5px; color: var(--muted); }}
  footer {{ text-align: center; color: var(--muted); font-size: 12px; padding: 20px; }}
  @media (max-width: 900px) {{
    .kpi-grid {{ grid-template-columns: repeat(2, 1fr); }}
    .chart-grid {{ grid-template-columns: 1fr; }}
  }}
</style>
</head>
<body>

<header>
  <h1>NetSage AI — Troubleshooting Dashboard</h1>
  <p>Applied AI + Network Troubleshooting · Packet Tracer lab cases · human-reviewed AI diagnoses</p>
</header>

<main>
  <div class="kpi-grid">
    <div class="kpi-card"><div class="value">{total}</div><div class="label">Total cases</div></div>
    <div class="kpi-card"><div class="value">{len(CATEGORY_ORDER)}</div><div class="label">Fault categories covered</div></div>
    <div class="kpi-card"><div class="value">{agreement:.1f}%</div><div class="label">AI–human agreement rate</div></div>
    <div class="kpi-card"><div class="value">{corrected}</div><div class="label">Cases corrected by a human reviewer</div></div>
  </div>

  <div class="chart-grid">
    <div class="card"><h2>Cases by Fault Category</h2><canvas id="catChart" height="220"></canvas></div>
    <div class="card"><h2>Cases by Severity</h2><canvas id="sevChart" height="220"></canvas></div>
    <div class="card"><h2>AI Review Outcomes</h2><canvas id="decChart" height="220"></canvas></div>
  </div>

  <section class="block">
    <h2>Rule Checker Coverage</h2>
    <div class="card">
      <p style="margin:0; font-size:13.5px; color:var(--ink);">
        The deterministic Python rule checker (<code>rule_checker.py</code>) independently flagged
        <strong>{rule_flagged} of {total}</strong> cases for common Cisco config mistakes
        (duplicate IPs, mask mismatches, gateway mismatches, interface-down states, missing VLANs,
        missing routes) — used as supporting evidence alongside the AI diagnosis, never as a
        replacement for human review.
      </p>
    </div>
  </section>

  <section class="block">
    <h2>Case Explorer</h2>
    <div class="filters">
      <input type="text" id="searchBox" placeholder="Search symptom or fault…" style="min-width:240px;">
      <select id="categoryFilter"><option value="">All categories</option></select>
      <select id="severityFilter"><option value="">All severities</option></select>
      <select id="decisionFilter"><option value="">All review outcomes</option></select>
    </div>
    <table id="caseTable">
      <thead>
        <tr>
          <th>Case</th><th>Category</th><th>Severity</th><th>OSI Layer</th>
          <th>Expected Fault</th><th>Review Outcome</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </section>

  <section class="block">
    <h2>Responsible AI Log — Corrected Diagnoses</h2>
    <div id="raiList"></div>
  </section>
</main>

<footer>NetSage AI · Project 2, Applied AI + Network Troubleshooting · generated from cases.csv, ai_diagnoses.csv, rule_checker_results.csv</footer>

<script>
const DATA = {data_json};

function el(tag, cls, html) {{
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}}

// ---- Populate filter dropdowns ----
function fillSelect(id, values) {{
  const sel = document.getElementById(id);
  values.forEach(v => {{
    const o = document.createElement('option');
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  }});
}}
fillSelect('categoryFilter', DATA.categoryOrder);
fillSelect('severityFilter', DATA.severityOrder);
fillSelect('decisionFilter', DATA.decisionOrder);

// ---- Charts ----
const navy = '#0F3057', teal = '#1C7293', ice = '#8FB8CC';
new Chart(document.getElementById('catChart'), {{
  type: 'bar',
  data: {{
    labels: DATA.categoryOrder,
    datasets: [{{ label: 'Cases', data: DATA.categoryCounts, backgroundColor: teal, borderRadius: 4 }}]
  }},
  options: {{
    plugins: {{ legend: {{ display: false }} }},
    scales: {{ y: {{ beginAtZero: true, ticks: {{ precision: 0 }} }} }}
  }}
}});
new Chart(document.getElementById('sevChart'), {{
  type: 'doughnut',
  data: {{
    labels: DATA.severityOrder,
    datasets: [{{ data: DATA.severityCounts, backgroundColor: ['#C0392B', '#D9822B', '#2E7D5B'] }}]
  }},
  options: {{ plugins: {{ legend: {{ position: 'bottom' }} }} }}
}});
new Chart(document.getElementById('decChart'), {{
  type: 'doughnut',
  data: {{
    labels: DATA.decisionOrder,
    datasets: [{{ data: DATA.decisionCounts, backgroundColor: ['#2E7D5B', '#D9822B', '#C0392B'] }}]
  }},
  options: {{ plugins: {{ legend: {{ position: 'bottom' }} }} }}
}});

// ---- Case table ----
const tbody = document.querySelector('#caseTable tbody');
function renderTable() {{
  const q = document.getElementById('searchBox').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const sev = document.getElementById('severityFilter').value;
  const dec = document.getElementById('decisionFilter').value;
  tbody.innerHTML = '';
  DATA.cases.filter(c => {{
    if (cat && c.category !== cat) return false;
    if (sev && c.severity !== sev) return false;
    if (dec && c.reviewer_decision !== dec) return false;
    if (q && !(c.symptom.toLowerCase().includes(q) || c.expected_fault.toLowerCase().includes(q))) return false;
    return true;
  }}).forEach(c => {{
    const tr = el('tr');
    tr.appendChild(el('td', null, '<strong>' + c.case_id + '</strong>'));
    tr.appendChild(el('td', null, c.category));
    tr.appendChild(el('td', null, '<span class="badge ' + c.severity + '">' + c.severity + '</span>'));
    tr.appendChild(el('td', null, c.osi_layer));
    tr.appendChild(el('td', null, c.expected_fault));
    tr.appendChild(el('td', null, '<span class="badge ' + c.reviewer_decision + '">' + c.reviewer_decision + '</span>'));
    tbody.appendChild(tr);
  }});
}}
['searchBox','categoryFilter','severityFilter','decisionFilter'].forEach(id => {{
  document.getElementById(id).addEventListener('input', renderTable);
  document.getElementById(id).addEventListener('change', renderTable);
}});
renderTable();

// ---- Responsible AI log ----
const raiList = document.getElementById('raiList');
DATA.cases.filter(c => c.reviewer_decision === 'Edited' || c.reviewer_decision === 'Rejected').forEach(c => {{
  const item = el('div', 'rai-item ' + c.reviewer_decision);
  item.innerHTML = `
    <h3>${{c.case_id}} — <span class="badge ${{c.reviewer_decision}}">${{c.reviewer_decision}}</span></h3>
    <p><strong>Symptom:</strong> ${{c.symptom}}</p>
    <p><strong>AI's first-pass diagnosis:</strong> ${{c.ai_root_cause}}</p>
    <p><strong>Correction:</strong> ${{c.correction_reason}}</p>
    <p class="tag">Category: ${{c.category}} · Concept: ${{c.concept_tag}}</p>
  `;
  raiList.appendChild(item);
}});
</script>
</body>
</html>
"""

    OUT_HTML.parent.mkdir(parents=True, exist_ok=True)
    OUT_HTML.write_text(html, encoding="utf-8")
    print(f"HTML dashboard written to {OUT_HTML}")
    print(f"Total cases: {total}, agreement: {agreement:.1f}%, corrected: {corrected}, rule-flagged: {rule_flagged}")


if __name__ == "__main__":
    main()

const pptxgen = require("pptxgenjs");

// ---------- Palette: "Ocean Gradient" (networking-appropriate) ----------
const NAVY = "0F3057";
const DEEP = "065A82";
const TEAL = "1C7293";
const ICE = "E8F1F5";
const WHITE = "FFFFFF";
const GOOD = "2E7D5B";
const WARN = "D9822B";
const BAD = "C0392B";
const MUTED = "5B6B77";
const INK = "16232E";

const FONT = "Calibri";
const FONT_HEAD = "Cambria";

function newDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
  pres.author = "NetSage AI Team";
  pres.company = "Cisco NetAcad Project 2";
  pres.title = "NetSage AI — Applied AI + Network Troubleshooting";
  return pres;
}

function darkSlide(pres) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  return s;
}
function lightSlide(pres) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  return s;
}

function kicker(s, text, opts = {}) {
  s.addText(text.toUpperCase(), {
    x: opts.x ?? 0.6, y: opts.y ?? 0.4, w: opts.w ?? 8, h: 0.35,
    fontFace: FONT, fontSize: 12, bold: true, color: opts.color ?? TEAL,
    charSpacing: 2, isTextBox: true,
  });
}
function title(s, text, opts = {}) {
  s.addText(text, {
    x: opts.x ?? 0.6, y: opts.y ?? 0.72, w: opts.w ?? 11.5, h: opts.h ?? 0.9,
    fontFace: FONT_HEAD, fontSize: opts.size ?? 32, bold: true,
    color: opts.color ?? NAVY, isTextBox: true,
  });
}
function pageNum(s, pres, n) {
  s.addText(`${n}`, {
    x: 12.7, y: 7.1, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 10,
    color: MUTED, align: "right", isTextBox: true,
  });
}
function circleStat(s, x, y, d, value, label, color) {
  s.addShape("ellipse", { x, y, w: d, h: d, fill: { color: ICE }, line: { color, width: 2 } });
  s.addText(String(value), {
    x, y: y + d * 0.18, w: d, h: d * 0.5, align: "center", valign: "middle",
    fontFace: FONT_HEAD, fontSize: d > 1.6 ? 30 : 22, bold: true, color, isTextBox: true,
  });
  s.addText(label, {
    x: x - 0.3, y: y + d * 0.62, w: d + 0.6, h: 0.5, align: "center", valign: "top",
    fontFace: FONT, fontSize: 11, color: INK, isTextBox: true,
  });
}

function build() {
  const pres = newDeck();
  let n = 0;

  // ============ SLIDE 1 — Title ============
  {
    const s = darkSlide(pres);
    s.addShape("rect", { x: 0, y: 0, w: 13.33, h: 2.0, fill: { color: DEEP }, line: { type: "none" } });
    s.addText("NetSage AI", {
      x: 0.9, y: 2.35, w: 11.5, h: 1.3, fontFace: FONT_HEAD, fontSize: 60, bold: true,
      color: WHITE, isTextBox: true,
    });
    s.addText("An AI Troubleshooting Helper with Human Review", {
      x: 0.9, y: 3.55, w: 11, h: 0.6, fontFace: FONT, fontSize: 22, color: "CADCFC", isTextBox: true,
    });
    s.addText("Project 2  |  Applied AI + Network Troubleshooting  |  Cisco-style Packet Tracer Labs", {
      x: 0.9, y: 4.2, w: 11, h: 0.5, fontFace: FONT, fontSize: 14, color: "9FC1D6", isTextBox: true,
    });
    s.addShape("roundRect", {
      x: 0.9, y: 5.15, w: 4.1, h: 0.55, rectRadius: 0.28,
      fill: { color: TEAL }, line: { type: "none" },
    });
    s.addText("SAFETY RULE:  HUMAN REVIEW REQUIRED", {
      x: 0.9, y: 5.15, w: 4.1, h: 0.55, align: "center", valign: "middle",
      fontFace: FONT, fontSize: 12.5, bold: true, color: WHITE, isTextBox: true,
    });
    s.addText("Team NetSage  ·  [Add team member names here]", {
      x: 0.9, y: 6.85, w: 8, h: 0.4, fontFace: FONT, fontSize: 12, italic: true, color: "8FA9BC", isTextBox: true,
    });
    s.addNotes(
      "Hi, we're Team NetSage. Our project is NetSage AI — an AI-assisted troubleshooter for Cisco-style " +
      "Packet Tracer lab networks. In one sentence: it reads symptoms and show-command output, suggests a " +
      "likely cause and next steps, and always requires a human to review before any fix is accepted. " +
      "That human-review rule is the safety backbone of everything you're about to see."
    );
  }

  // ============ SLIDE 2 — Problem Statement ============
  {
    const s = lightSlide(pres);
    kicker(s, "The Problem");
    title(s, "Junior engineers can run commands.\nThey struggle to connect symptom to root cause.");
    s.addShape("rect", { x: 0.6, y: 2.35, w: 7.0, h: 4.4, fill: { color: ICE }, line: { type: "none" } });
    s.addText([
      { text: "\u201C", options: { fontSize: 44, color: TEAL, bold: true } },
      { text: "PC gets an IP address but cannot reach a server.\n", options: { fontSize: 20, bold: true, color: NAVY, breakLine: true } },
      { text: "Is it VLAN? Routing? DHCP? DNS? ACL? NAT?", options: { fontSize: 18, color: INK } },
    ], { x: 0.95, y: 2.65, w: 6.4, h: 3.9, isTextBox: true, valign: "top" });
    const rightItems = ["VLAN", "Gateway", "DHCP", "DNS", "Routing", "ACL", "NAT", "Wireless"];
    let ry = 2.35;
    rightItems.forEach((t, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      s.addShape("roundRect", {
        x: 8.0 + col * 2.5, y: 2.35 + row * 1.08, w: 2.25, h: 0.8, rectRadius: 0.1,
        fill: { color: row % 2 === 0 ? DEEP : TEAL }, line: { type: "none" },
      });
      s.addText(t, {
        x: 8.0 + col * 2.5, y: 2.35 + row * 1.08, w: 2.25, h: 0.8, align: "center", valign: "middle",
        fontFace: FONT, fontSize: 14, bold: true, color: WHITE, isTextBox: true,
      });
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "Here's the real problem statement from the brief. A junior engineer sees a PC that gets an IP address " +
      "but can't reach a server. That single symptom could map to eight different fault categories — VLAN, " +
      "gateway, DHCP, DNS, routing, ACL, NAT, or wireless. Knowing individual show commands doesn't automatically " +
      "tell you which of these eight buckets you're actually in — that diagnostic leap is what NetSage AI is built to assist with."
    );
  }

  // ============ SLIDE 3 — Solution / Workflow ============
  {
    const s = lightSlide(pres);
    kicker(s, "The Solution");
    title(s, "Evidence in. Recommendation out. Human decides.");
    const steps = [
      ["1", "Symptom + Show Output", "PC/server symptom, topology note, and real show-command evidence"],
      ["2", "AI Diagnosis", "Structured JSON: root cause, OSI layer, confidence, evidence, next command, fix"],
      ["3", "Rule Checker", "Deterministic Python script cross-checks common config mistakes"],
      ["4", "Human Review", "Reviewer marks Accepted / Edited / Rejected — nothing is auto-applied"],
    ];
    const colors = [DEEP, TEAL, "3E8E9E", GOOD];
    steps.forEach((st, i) => {
      const x = 0.6 + i * 3.05;
      s.addShape("roundRect", { x, y: 2.5, w: 2.8, h: 3.7, rectRadius: 0.08, fill: { color: ICE }, line: { color: colors[i], width: 1.5 } });
      s.addShape("ellipse", { x: x + 1.1, y: 2.75, w: 0.6, h: 0.6, fill: { color: colors[i] }, line: { type: "none" } });
      s.addText(st[0], { x: x + 1.1, y: 2.75, w: 0.6, h: 0.6, align: "center", valign: "middle", fontFace: FONT_HEAD, fontSize: 20, bold: true, color: WHITE, isTextBox: true });
      s.addText(st[1], { x: x + 0.15, y: 3.55, w: 2.5, h: 0.7, align: "center", fontFace: FONT, fontSize: 14, bold: true, color: NAVY, isTextBox: true });
      s.addText(st[2], { x: x + 0.2, y: 4.25, w: 2.4, h: 1.8, align: "center", fontFace: FONT, fontSize: 11, color: MUTED, isTextBox: true });
      if (i < 3) {
        s.addText("\u2192", { x: x + 2.78, y: 3.9, w: 0.5, h: 0.6, align: "center", valign: "middle", fontFace: FONT, fontSize: 24, bold: true, color: colors[i], isTextBox: true });
      }
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "Our workflow has four stages. Evidence goes in as a symptom plus real show-command output. NetSage AI " +
      "returns a structured JSON diagnosis — never free text. Independently, a deterministic Python rule checker " +
      "cross-validates common config mistakes. And critically, a human reviewer always makes the final call: " +
      "Accepted, Edited, or Rejected. Nothing here ever touches a real or lab device automatically."
    );
  }

  // ============ SLIDE 4 — 6-step build workflow ============
  {
    const s = lightSlide(pres);
    kicker(s, "How We Built It");
    title(s, "Six-step project workflow");
    const items = [
      "Collect 30+ real lab cases across 8 fault categories",
      "Write structured JSON prompts with 2–3 worked examples",
      "Build a deterministic Python rule checker",
      "Run AI diagnosis on every case and save the response",
      "Add human review: Accepted / Edited / Rejected + reasons",
      "Build the dashboard and record a live demo",
    ];
    items.forEach((t, i) => {
      const y = 2.35 + i * 0.78;
      s.addShape("roundRect", { x: 0.6, y, w: 0.5, h: 0.5, rectRadius: 0.06, fill: { color: i % 2 === 0 ? DEEP : TEAL }, line: { type: "none" } });
      s.addText(String(i + 1), { x: 0.6, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: FONT_HEAD, fontSize: 16, bold: true, color: WHITE, isTextBox: true });
      s.addText(t, { x: 1.3, y: y - 0.03, w: 11.2, h: 0.55, valign: "middle", fontFace: FONT, fontSize: 16, color: INK, isTextBox: true });
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "This mirrors the project brief exactly: collect real cases, write structured prompts, build a rule " +
      "checker, run AI diagnosis and save every response, layer in human review, and finally package it into " +
      "a dashboard and a recorded demo. Every one of these six steps has a corresponding file in our submission."
    );
  }

  // ============ SLIDE 5 — Case dataset (bar chart) ============
  {
    const s = lightSlide(pres);
    kicker(s, "Deliverable: cases.csv");
    title(s, "36 lab cases across 8 fault categories");
    circleStat(s, 0.6, 2.5, 1.7, "36", "Total cases\n(min. 30 required)", DEEP);
    circleStat(s, 0.6, 4.6, 1.7, "8", "Fault categories", TEAL);
    const chartData = [
      { name: "Cases", labels: ["VLAN", "Gateway", "DHCP", "DNS", "Routing", "ACL", "NAT", "Wireless"], values: [6, 4, 4, 4, 6, 4, 4, 4] },
    ];
    s.addChart(pres.ChartType.bar, chartData, {
      x: 2.85, y: 2.35, w: 9.9, h: 4.6,
      showTitle: true, title: "Cases by Fault Category", titleFontFace: FONT, titleFontSize: 13, titleColor: NAVY,
      showLegend: false,
      chartColors: [TEAL],
      barDir: "col",
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: INK,
      catAxisLabelColor: MUTED, catAxisLabelFontSize: 11,
      valAxisLabelColor: MUTED, valAxisLabelFontSize: 11,
      valGridLine: { color: "E3E9ED", size: 1 },
      catGridLine: { style: "none" },
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "Every case in cases.csv includes a symptom, a topology note, realistic show-command output, the expected " +
      "fault, the OSI layer, a concept tag, and a severity rating. We covered all eight required fault types — " +
      "VLAN, Gateway, DHCP, DNS, Routing, ACL, NAT, and Wireless — with 36 total cases, 20% over the 30-case minimum."
    );
  }

  // ============ SLIDE 6 — Severity + review outcome (two doughnuts) ============
  {
    const s = lightSlide(pres);
    kicker(s, "Case Mix & Review Outcomes");
    title(s, "Balanced severity. Transparent review outcomes.");
    s.addChart(pres.ChartType.doughnut, [
      { name: "Severity", labels: ["High", "Medium", "Low"], values: [11, 18, 7] },
    ], {
      x: 0.5, y: 2.35, w: 5.9, h: 4.5,
      showTitle: true, title: "Cases by Severity", titleFontFace: FONT, titleFontSize: 13, titleColor: NAVY,
      showLegend: true, legendPos: "b", legendColor: INK, legendFontSize: 11,
      chartColors: [BAD, WARN, GOOD],
      dataLabelColor: WHITE, showValue: true, dataLabelFontSize: 12,
    });
    s.addChart(pres.ChartType.doughnut, [
      { name: "Review Outcome", labels: ["Accepted", "Edited", "Rejected"], values: [29, 3, 4] },
    ], {
      x: 6.85, y: 2.35, w: 5.9, h: 4.5,
      showTitle: true, title: "AI Diagnosis Review Outcomes", titleFontFace: FONT, titleFontSize: 13, titleColor: NAVY,
      showLegend: true, legendPos: "b", legendColor: INK, legendFontSize: 11,
      chartColors: [GOOD, WARN, BAD],
      dataLabelColor: WHITE, showValue: true, dataLabelFontSize: 12,
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "Severity is fairly balanced — 11 high, 18 medium, 7 low — so the AI has to handle both urgent and " +
      "low-stakes cases. On the review side, out of 36 AI diagnoses, human reviewers accepted 29, edited 3, " +
      "and rejected 4. That's an 80.6% first-pass agreement rate, and it's the headline number on our dashboard."
    );
  }

  // ============ SLIDE 7 — Prompt design ============
  {
    const s = darkSlide(pres);
    kicker(s, "Deliverable: diagnose_prompt.md", { color: "9FC1D6" });
    title(s, "One JSON schema. Every diagnosis.", { color: WHITE });
    const fields = [
      ["root_cause", "One-sentence root cause"],
      ["osi_layer", "Layer 1 through Layer 7, or a range"],
      ["confidence", "low / medium / high — calibrated, not guessed"],
      ["evidence", "The exact show-command line(s) relied on"],
      ["next_command", "Single most useful next diagnostic step"],
      ["fix_steps", "Ordered, concrete configuration steps"],
    ];
    fields.forEach((f, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.7 + col * 6.0, y = 2.5 + row * 1.5;
      s.addShape("roundRect", { x, y, w: 5.6, h: 1.25, rectRadius: 0.08, fill: { color: "12385F" }, line: { color: TEAL, width: 1 } });
      s.addText(f[0], { x: x + 0.25, y: y + 0.12, w: 5.1, h: 0.4, fontFace: "Consolas", fontSize: 15, bold: true, color: "7FD1C4", isTextBox: true });
      s.addText(f[1], { x: x + 0.25, y: y + 0.55, w: 5.1, h: 0.6, fontFace: FONT, fontSize: 12.5, color: "CADCFC", isTextBox: true });
    });
    s.addText("+ 3 worked examples included in every call, including one deliberate low-confidence case", {
      x: 0.7, y: 6.75, w: 11.9, h: 0.4, italic: true, fontFace: FONT, fontSize: 12, color: "9FC1D6", isTextBox: true,
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "The heart of the AI side is a strict JSON schema: root cause, OSI layer, a calibrated confidence level, " +
      "the specific evidence line it relied on, one prioritized next command, and ordered fix steps. We include " +
      "three worked few-shot examples with every call — one of them is deliberately low-evidence, to teach the " +
      "model to say 'low confidence' instead of guessing when the case doesn't give it enough to be sure."
    );
  }

  // ============ SLIDE 8 — Rule checker ============
  {
    const s = lightSlide(pres);
    kicker(s, "Deliverable: rule_checker.py");
    title(s, "A deterministic second opinion, independent of the AI");
    const checks = [
      "Duplicate IP addresses", "Wrong / mismatched subnet masks",
      "Default-gateway mismatch", "Interface / line-protocol down",
      "Missing VLAN on trunk", "Missing routes",
    ];
    checks.forEach((c, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 0.6 + col * 4.1, y = 2.45 + row * 1.55;
      s.addShape("roundRect", { x, y, w: 3.8, h: 1.3, rectRadius: 0.08, fill: { color: ICE }, line: { type: "none" } });
      s.addShape("ellipse", { x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, fill: { color: DEEP }, line: { type: "none" } });
      s.addText("\u2713", { x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: FONT, fontSize: 16, bold: true, color: WHITE, isTextBox: true });
      s.addText(c, { x: x + 0.9, y: y + 0.2, w: 2.75, h: 0.9, valign: "middle", fontFace: FONT, fontSize: 13, bold: true, color: NAVY, isTextBox: true });
    });
    s.addShape("roundRect", { x: 0.6, y: 5.75, w: 11.8, h: 1.05, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" } });
    s.addText("Result: independently flagged 12 of 36 cases (33%) — used as supporting evidence for the AI, never as a stand-in for it.", {
      x: 0.9, y: 5.75, w: 11.2, h: 1.05, valign: "middle", fontFace: FONT, fontSize: 14, color: WHITE, isTextBox: true,
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "Separately from the AI, we wrote a plain Python rule checker — regex-based, fully deterministic — that " +
      "scans show-command output for six common Cisco mistakes. It's not trying to replace the AI's reasoning; " +
      "it's a fast, explainable pre-check. On our dataset it independently flagged 12 of 36 cases, about a third, " +
      "which we then hand to the AI as supporting evidence per our helper prompt template."
    );
  }

  // ============ SLIDE 9 — Worked example C019 ============
  {
    const s = lightSlide(pres);
    kicker(s, "Worked Example — Case C019");
    title(s, "Gateway ping works. VLAN 30 is still unreachable.");
    s.addShape("rect", { x: 0.6, y: 2.3, w: 5.9, h: 4.5, fill: { color: "1B1F27" }, line: { type: "none" } });
    s.addText([
      { text: "R1# show ip route\n", options: { color: "7FD1C4", bold: true, breakLine: true } },
      { text: "C  192.168.10.0/24 is directly connected, Gi0/0.10\n", options: { color: "D7E4EA", breakLine: true } },
      { text: "C  192.168.20.0/24 is directly connected, Gi0/0.20\n", options: { color: "D7E4EA", breakLine: true } },
      { text: "(no route to 192.168.30.0/24)", options: { color: "F2A65A", bold: true } },
    ], { x: 0.9, y: 2.55, w: 5.3, h: 4.0, fontFace: "Consolas", fontSize: 13, isTextBox: true });

    const items = [
      ["Root cause", "No route / sub-interface exists for VLAN 30 on R1"],
      ["OSI layer", "Layer 3"],
      ["Confidence", "High"],
      ["Next command", "show running-config interface Gi0/0.30"],
      ["Reviewer decision", "Accepted"],
    ];
    items.forEach((it, i) => {
      const y = 2.35 + i * 0.85;
      s.addText(it[0], { x: 6.85, y, w: 2.5, h: 0.5, fontFace: FONT, fontSize: 12.5, bold: true, color: TEAL, isTextBox: true });
      s.addText(it[1], { x: 6.85, y: y + 0.35, w: 5.9, h: 0.5, fontFace: FONT, fontSize: 13.5, color: INK, isTextBox: true });
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "This is the assignment's own example case, C019: a PC gets an IP, gateway ping works, but VLAN 30 is " +
      "unreachable. The evidence — 'show ip route' — shows connected routes for VLAN 10 and 20 but nothing for " +
      "VLAN 30. NetSage AI cites that missing line directly as its evidence, calls it Layer 3, high confidence, " +
      "and proposes checking the Gi0/0.30 sub-interface config as the next step. The reviewer accepted this one as-is."
    );
  }

  // ============ SLIDE 10 — Responsible AI ============
  {
    const s = darkSlide(pres);
    kicker(s, "Deliverable: responsible_ai_log.md", { color: "9FC1D6" });
    title(s, "7 of 36 diagnoses needed a human correction", { color: WHITE });
    s.addShape("roundRect", { x: 0.6, y: 2.35, w: 6.0, h: 4.4, rectRadius: 0.08, fill: { color: "12385F" }, line: { color: BAD, width: 1.5 } });
    s.addText("Case C030 — Rejected", { x: 0.9, y: 2.55, w: 5.4, h: 0.4, bold: true, fontFace: FONT, fontSize: 15, color: WHITE, isTextBox: true });
    s.addText([
      { text: "AI said: ", options: { bold: true, color: "F2A65A" } },
      { text: "\u201CISP is rate-limiting our public IP.\u201D\n", options: { color: "CADCFC", breakLine: true } },
      { text: "\nEvidence actually showed: ", options: { bold: true, color: "7FD1C4", breakLine: true } },
      { text: "'show ip nat statistics' — active translations climbing toward the PAT overload ceiling.\n", options: { color: "CADCFC", breakLine: true } },
      { text: "\nCorrected to: ", options: { bold: true, color: GOOD, breakLine: true } },
      { text: "local NAT/PAT port exhaustion — fixed by adding a second public IP.", options: { color: "CADCFC" } },
    ], { x: 0.9, y: 3.05, w: 5.4, h: 3.5, fontFace: FONT, fontSize: 12.5, isTextBox: true, valign: "top" });

    circleStat(s, 7.6, 2.5, 1.55, "3", "Edited", WARN);
    circleStat(s, 9.5, 2.5, 1.55, "4", "Rejected", BAD);
    s.addText("Every correction is logged with: what the AI said, why it was wrong, the human's fix, and a team takeaway.", {
      x: 7.4, y: 4.6, w: 5.3, h: 1.8, fontFace: FONT, fontSize: 13, color: "CADCFC", isTextBox: true,
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "This slide is the heart of our Responsible AI deliverable. We documented all 7 cases where a human " +
      "overruled the AI — well above the 5-case minimum. Case C030 is a good example: the AI blamed an external, " +
      "unverifiable cause — the ISP — when the local NAT statistics already explained the problem. The reviewer " +
      "rejected that diagnosis and redirected the fix to something the team could actually act on."
    );
  }

  // ============ SLIDE 11 — Dashboards ============
  {
    const s = lightSlide(pres);
    kicker(s, "Deliverable: Dashboard (two formats)");
    title(s, "One data source. Two dashboards.");
    const cols = [
      [DEEP, "Excel — netsage_dashboard.xlsx", ["Live COUNTIFS formulas, zero hardcoded numbers", "Cases + Diagnoses raw-data tabs", "Bar + pie charts, recalculated and verified"]],
      [TEAL, "HTML — netsage_dashboard.html", ["Single self-contained file, opens in any browser", "Filterable, searchable case explorer table", "Same KPIs + charts, plus the full Responsible AI log inline"]],
    ];
    cols.forEach((c, i) => {
      const x = 0.6 + i * 6.2;
      s.addShape("roundRect", { x, y: 2.35, w: 5.9, h: 4.5, rectRadius: 0.08, fill: { color: ICE }, line: { color: c[0], width: 1.5 } });
      s.addText(c[1], { x: x + 0.3, y: 2.6, w: 5.3, h: 0.6, fontFace: FONT, fontSize: 16, bold: true, color: NAVY, isTextBox: true });
      c[2].forEach((line, j) => {
        s.addText("\u2022 " + line, { x: x + 0.35, y: 3.35 + j * 0.85, w: 5.2, h: 0.75, fontFace: FONT, fontSize: 12.5, color: INK, isTextBox: true });
      });
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "We built the dashboard in two formats from the same three CSVs, so they can never drift out of sync. " +
      "The Excel version uses only live formulas — every number recalculates if the underlying data changes. " +
      "The HTML version is a single file anyone can open with no installation, with a searchable case explorer " +
      "and the full Responsible AI log built right in."
    );
  }

  // ============ SLIDE 12 — Results ============
  {
    const s = darkSlide(pres);
    kicker(s, "Results", { color: "9FC1D6" });
    title(s, "What the numbers say", { color: WHITE });
    const stats = [
      ["36", "Total cases", "5FB4E5"],
      ["80.6%", "AI–human agreement", "6FD6C9"],
      ["7", "Corrections documented", "F2B25A"],
      ["12 / 36", "Independently rule-checked", "7BC99A"],
    ];
    stats.forEach((st, i) => {
      const x = 0.7 + i * 3.0;
      s.addShape("roundRect", { x, y: 2.5, w: 2.7, h: 2.9, rectRadius: 0.1, fill: { color: "12385F" }, line: { color: st[2], width: 1.5 } });
      s.addText(st[0], { x, y: 2.85, w: 2.7, h: 1.2, align: "center", fontFace: FONT_HEAD, fontSize: 34, bold: true, color: st[2], isTextBox: true });
      s.addText(st[1], { x: x + 0.1, y: 4.1, w: 2.5, h: 0.9, align: "center", fontFace: FONT, fontSize: 13, color: "CADCFC", isTextBox: true });
    });
    s.addText("Human review caught real errors — wrong OSI layers, unverifiable external causes, and overconfident hardware claims — before any fix reached a device.", {
      x: 0.9, y: 5.85, w: 11.4, h: 0.9, align: "center", italic: true, fontFace: FONT, fontSize: 14, color: "9FC1D6", isTextBox: true,
    });
    pageNum(s, pres, ++n);
    s.addNotes(
      "To summarize the numbers: 36 cases, an 80.6% first-pass agreement rate between the AI and human reviewers, " +
      "7 fully documented corrections, and independent rule-based flags on a third of the dataset. The takeaway " +
      "isn't that the AI is unreliable — it's that human review is doing real, measurable work, catching wrong " +
      "OSI layers, unverifiable external causes, and overconfident claims before they'd ever reach a real device."
    );
  }

  // ============ SLIDE 13 — Lessons / roadmap ============
  {
    const s = lightSlide(pres);
    kicker(s, "Lessons & Next Steps");
    title(s, "What we'd build next");
    const left = ["Evidence-citation is the single biggest lever against wrong diagnoses", "Low-confidence cases need a self-check pass before reaching a reviewer", "Single-host faults should out-rank server-side explanations by default"];
    const right = ["Wire the rule checker's findings into every AI call automatically", "Expand wireless and NAT case coverage further", "Track agreement rate over time as a team-health metric"];
    s.addText("Lessons from this run", { x: 0.6, y: 2.3, w: 5.8, h: 0.5, bold: true, fontFace: FONT, fontSize: 16, color: NAVY, isTextBox: true });
    left.forEach((t, i) => s.addText("\u2022 " + t, { x: 0.6, y: 2.9 + i * 1.0, w: 5.7, h: 0.9, fontFace: FONT, fontSize: 13.5, color: INK, isTextBox: true }));
    s.addText("Roadmap", { x: 6.9, y: 2.3, w: 5.8, h: 0.5, bold: true, fontFace: FONT, fontSize: 16, color: NAVY, isTextBox: true });
    right.forEach((t, i) => s.addText("\u2022 " + t, { x: 6.9, y: 2.9 + i * 1.0, w: 5.7, h: 0.9, fontFace: FONT, fontSize: 13.5, color: INK, isTextBox: true }));
    pageNum(s, pres, ++n);
    s.addNotes(
      "A few honest lessons: citing exact evidence lines is what catches most AI mistakes, low-confidence cases " +
      "benefit from a dedicated self-check pass, and single-host symptoms should point us toward interface-level " +
      "causes before server-side ones. Looking ahead, we'd wire the rule checker directly into every AI call, " +
      "grow wireless and NAT coverage, and track agreement rate over time as an ongoing team metric."
    );
  }

  // ============ SLIDE 14 — Thank you ============
  {
    const s = darkSlide(pres);
    s.addText("Thank You", { x: 0.9, y: 2.7, w: 11, h: 1.1, fontFace: FONT_HEAD, fontSize: 48, bold: true, color: WHITE, isTextBox: true });
    s.addText("NetSage AI — recommend, evidence, review, verify.", { x: 0.9, y: 3.75, w: 11, h: 0.6, fontFace: FONT, fontSize: 18, color: "CADCFC", isTextBox: true });
    s.addText("Questions? See cases.csv, the prompt library, rule_checker.py, both dashboards, and responsible_ai_log.md in the submission package.", {
      x: 0.9, y: 4.5, w: 10.8, h: 0.8, fontFace: FONT, fontSize: 13, color: "9FC1D6", isTextBox: true,
    });
    s.addNotes(
      "Thank you. That's NetSage AI — recommend, evidence, review, verify, every single time. Happy to take " +
      "questions, and everything we've shown is in the submission package: the case dataset, the prompt library, " +
      "the rule checker, both dashboards, and the full responsible AI log."
    );
  }

  return pres;
}

const pres = build();
pres.writeFile({ fileName: "/home/claude/netsage/docs/NetSage_AI_Presentation.pptx" }).then(() => {
  console.log("Presentation written.");
});

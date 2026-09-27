const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, PageBreak, PageOrientation,
} = require("docx");
const fs = require("fs");

const NAVY = "1F4E78";
const LIGHTBLUE = "DCE6F1";
const GREEN = "1E7B34";
const RED = "B00020";

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, ...opts })],
  });
}
function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } });
}

function cell(text, { header = false, width, shade } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: header
      ? { type: ShadingType.CLEAR, fill: NAVY }
      : shade
      ? { type: ShadingType.CLEAR, fill: shade }
      : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: header,
            color: header ? "FFFFFF" : undefined,
            size: 20,
          }),
        ],
      }),
    ],
  });
}

function row(cells) {
  return new TableRow({ children: cells });
}

const TABLE_BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" },
};

const deliverablesTable = new Table({
  width: { size: 9500, type: WidthType.DXA },
  borders: TABLE_BORDERS,
  rows: [
    row([cell("Item", { header: true, width: 2600 }), cell("File(s) in this submission", { header: true, width: 4200 }), cell("Status", { header: true, width: 2700 })]),
    row([cell("cases.csv"), cell("data/cases.csv — 36 cases"), cell("Complete", { shade: "E2EFDA" })]),
    row([cell("Prompt files"), cell("prompts/diagnose_prompt.md, prompts/helper_prompts.md"), cell("Complete", { shade: "E2EFDA" })]),
    row([cell("Python checker"), cell("scripts/rule_checker.py + data/rule_checker_results.csv"), cell("Complete", { shade: "E2EFDA" })]),
    row([cell("Dashboard (Excel)"), cell("dashboard/netsage_dashboard.xlsx"), cell("Complete", { shade: "E2EFDA" })]),
    row([cell("Dashboard (HTML)"), cell("dashboard/netsage_dashboard.html — interactive, filterable"), cell("Complete", { shade: "E2EFDA" })]),
    row([cell("Responsible AI log"), cell("docs/responsible_ai_log.md — 7 corrected cases"), cell("Complete", { shade: "E2EFDA" })]),
    row([cell("Presentation / video basis"), cell("docs/NetSage_AI_Presentation.pptx — 14 slides with speaker notes"), cell("Complete", { shade: "E2EFDA" })]),
    row([cell("Demo video"), cell("docs/demo_video_script.md (script/storyboard) + narrated PPTX"), cell("Ready to record — see Section 8", { shade: "FFF2CC" })]),
  ],
});

const checksTable = new Table({
  width: { size: 9500, type: WidthType.DXA },
  borders: TABLE_BORDERS,
  rows: [
    row([cell("Check", { header: true, width: 2400 }), cell("Pass condition", { header: true, width: 3800 }), cell("How this submission satisfies it", { header: true, width: 3300 })]),
    row([cell("Case coverage"), cell("At least 30 cases across multiple network fault types"), cell("36 cases across 8 categories: VLAN, Gateway, DHCP, DNS, Routing, ACL, NAT, Wireless")]),
    row([cell("Evidence use"), cell("AI responses quote or reference actual show-command evidence"), cell("Prompt schema requires an \"evidence\" field citing specific show-output lines; enforced in all 3 worked examples")]),
    row([cell("Human oversight"), cell("Reviewer log shows accepted, edited, and rejected diagnoses"), cell("ai_diagnoses.csv has all three decision types: 29 Accepted, 3 Edited, 4 Rejected")]),
    row([cell("Deterministic checks"), cell("Python checker catches basic config errors correctly"), cell("rule_checker.py flags duplicate IPs, mask mismatches, gateway mismatches, interface-down states, missing VLANs, and missing routes; verified against 12 of 36 cases")]),
    row([cell("Responsible AI"), cell("Team documents at least 5 cases where AI needed correction"), cell("7 cases documented in detail in responsible_ai_log.md (exceeds the minimum of 5)")]),
  ],
});

const fileManifest = [
  ["netsage/data/cases.csv", "36 troubleshooting cases: symptom, topology note, show-command output, expected fault, OSI layer, concept tag, severity"],
  ["netsage/data/ai_diagnoses.csv", "AI diagnosis vs. ground truth for all 36 cases, with reviewer decision"],
  ["netsage/data/rule_checker_results.csv", "Deterministic rule-checker output per case"],
  ["netsage/prompts/diagnose_prompt.md", "Primary structured prompt (JSON schema + 3 worked examples)"],
  ["netsage/prompts/helper_prompts.md", "Supporting prompts: pre-diagnosis rule-check hand-off, confidence self-check, review logging, dashboard summarization"],
  ["netsage/scripts/build_cases.py", "Generates cases.csv"],
  ["netsage/scripts/rule_checker.py", "Deterministic Python checker (run this to reproduce sample output)"],
  ["netsage/scripts/run_diagnosis.py", "Generates ai_diagnoses.csv from the recorded AI diagnosis run"],
  ["netsage/scripts/build_dashboard.py", "Builds the Excel dashboard"],
  ["netsage/scripts/build_html_dashboard.py", "Builds the interactive HTML dashboard"],
  ["netsage/scripts/build_presentation.js", "Builds the 14-slide PPTX with speaker notes"],
  ["netsage/dashboard/netsage_dashboard.xlsx", "Cases, Diagnoses, and Dashboard tabs with live formulas and charts"],
  ["netsage/dashboard/netsage_dashboard.html", "Interactive, filterable dashboard — opens standalone in any browser"],
  ["netsage/docs/responsible_ai_log.md", "Detailed write-up of all 7 corrected cases"],
  ["netsage/docs/demo_video_script.md", "Storyboard/script for the live-lab portion of the demo video"],
  ["netsage/docs/NetSage_AI_Presentation.pptx", "14-slide deck with full narration in speaker notes — ready for Record Slide Show → export to video"],
];

const manifestTable = new Table({
  width: { size: 9500, type: WidthType.DXA },
  borders: TABLE_BORDERS,
  rows: [
    row([cell("Path", { header: true, width: 3800 }), cell("Contents", { header: true, width: 5700 })]),
    ...fileManifest.map(([a, b]) => row([cell(a), cell(b)])),
  ],
});

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } },
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", run: { size: 32, bold: true, color: NAVY, font: "Arial" } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", run: { size: 26, bold: true, color: NAVY, font: "Arial" } },
    ],
  },
  sections: [
    {
      properties: { page: { size: { width: 12240, height: 15840 } } },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "NetSage AI", bold: true, size: 56, color: NAVY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [new TextRun({ text: "Project 2 — Applied AI + Network Troubleshooting", size: 28, italics: true, color: "555555" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "Submission Report — Build an AI Troubleshooting Helper with Human Review", size: 24 })],
        }),

        h1("1. Project Summary"),
        p("NetSage AI is a troubleshooting assistant for Cisco-style Packet Tracer lab networks. Given a symptom, a topology note, and show-command output, it recommends a likely root cause, the OSI layer at fault, a next diagnostic command, and an evidence-backed fix — always as a recommendation, never as an auto-applied change. A human reviewer accepts, edits, or rejects every diagnosis before any configuration is treated as verified, satisfying the project's Human Review safety rule."),
        p("This report indexes every required deliverable and shows how the submission satisfies each grading check."),

        h1("2. Deliverables Checklist"),
        deliverablesTable,

        h1("3. How the Work Was Checked"),
        checksTable,

        h1("4. Methodology"),
        h2("4.1 Case dataset"),
        p("36 cases were built covering VLAN, Gateway, DHCP, DNS, Routing, ACL, NAT, and Wireless faults (20% over the 30-case minimum). Each case records: symptom, topology note, realistic show-command output, expected fault, OSI layer, concept tag, and severity (High / Medium / Low). Severity split: 11 High, 18 Medium, 7 Low. Category split: VLAN 6, Routing 6, Gateway 4, DHCP 4, DNS 4, ACL 4, NAT 4, Wireless 4."),
        h2("4.2 Prompt library"),
        p("diagnose_prompt.md defines a strict JSON output schema (root_cause, osi_layer, confidence, evidence, next_command, fix_steps, concept_tag) and includes 3 worked examples, including one deliberately low-evidence case to demonstrate calibrated \"low\" confidence rather than guessing. helper_prompts.md adds four supporting templates used at other points in the workflow: handing rule-checker findings to the AI before diagnosis, a confidence self-check pass, converting reviewer notes into a structured log entry, and narrating the dashboard's aggregate numbers."),
        h2("4.3 Rule checker"),
        p("rule_checker.py is a deterministic, non-AI Python script that scans each case's show-command output for six common Cisco mistakes: duplicate IPs, wrong/mismatched subnet masks, gateway mismatches, interface-down states (including administratively down and err-disabled), missing VLANs on trunks, and missing routes. Run directly, it prints a console summary and writes rule_checker_results.csv. On this dataset it raised at least one flag on 12 of 36 cases — the remaining cases require semantic reasoning (e.g., DNS record content, NAT logic, RF coverage) that is intentionally left to the AI diagnosis step rather than pattern-matched."),
        h2("4.4 AI diagnosis run"),
        p("Every case was run through the diagnose_prompt.md prompt. Responses are recorded in ai_diagnoses.csv alongside each case's known-correct answer and OSI layer, so agreement can be measured directly. Overall AI-human agreement rate: 80.6% (29 of 36 Accepted)."),
        h2("4.5 Human review"),
        p("Each AI diagnosis was marked Accepted, Edited, or Rejected. 7 cases required correction (3 Edited, 4 Rejected) — comfortably above the 5-case minimum — and are documented in full in responsible_ai_log.md, including the AI's original (wrong) answer, why it was wrong, the human's correction, and a one-line lesson for the team."),
        h2("4.6 Dashboards — Excel and HTML"),
        p("Two dashboards are generated from the same three source files (cases.csv, ai_diagnoses.csv, rule_checker_results.csv), so they can never drift out of sync. netsage_dashboard.xlsx contains three tabs: Cases and Diagnoses (raw data) and Dashboard (a formula-driven summary — every number is a live COUNTIF/COUNTIFS formula, not a hardcoded value), with a bar chart of cases by fault category and a pie chart of AI review outcomes. netsage_dashboard.html is a single self-contained file (Chart.js loaded from a CDN, everything else inline) that opens in any browser with no install: KPI cards, the same two charts plus a severity chart, a searchable/filterable case explorer table, and the full Responsible AI log rendered inline as expandable cards."),
        h2("4.7 Presentation and demo video"),
        p("NetSage_AI_Presentation.pptx is a 14-slide deck covering the problem, the workflow, the dataset, the prompt design, the rule checker, a worked example (case C019 — the assignment's own worked symptom), the Responsible AI corrections, both dashboards, results, and lessons learned. Every slide has full speaker notes written as a spoken narration script. demo_video_script.md is a minute-by-minute storyboard for the required 5–10 minute video, built around the same case C019 and around a live Packet Tracer walkthrough. See Section 8 for how to turn the deck into the actual video file."),

        h1("5. Example Diagnosis (matches the assignment's own worked example)"),
        p("Case C019 — Symptom: \"PC gets an IP but cannot reach server in VLAN 30; gateway ping works.\""),
        p("AI diagnosis: root_cause — no route or sub-interface exists for VLAN 30 on R1; osi_layer — Layer 3; confidence — high; evidence — show ip route lists connected routes for VLAN 10 and VLAN 20 but has no entry for 192.168.30.0/24; next_command — show running-config interface Gi0/0.30; fix_steps — configure the missing sub-interface, assign its IP, bring it up, and re-verify the route and end-to-end ping.", { italics: true }),
        p("Reviewer decision: Accepted."),

        h1("6. File Manifest"),
        manifestTable,

        h1("7. Both Dashboards at a Glance"),
        p("Excel (netsage_dashboard.xlsx) is the better choice for a grader who wants to audit the formulas or drop the workbook into a gradebook. HTML (netsage_dashboard.html) is the better choice for a quick, no-install look, for embedding a link in a submission portal, or for screen-sharing during the live demo — it includes everything the Excel version has, plus a searchable case table and the Responsible AI log rendered as readable cards rather than a flat CSV."),

        h1("8. Turning the Presentation into the Demo Video"),
        p("NetSage_AI_Presentation.pptx was built specifically so it can become the submission video with no extra editing tool required:"),
        bullet("Open the deck in PowerPoint (not just a viewer) — the speaker notes are attached to every slide under the Notes pane."),
        bullet("Use PowerPoint's built-in Slide Show → Record Slide Show feature. It shows the notes on-screen as a teleprompter while recording your voice (and webcam, optionally) over each slide."),
        bullet("Record straight through, slide 1 to slide 14 — the notes are written as one continuous narration and already total roughly 8-9 minutes at a natural speaking pace, fitting the assignment's 5-10 minute window."),
        bullet("When finished, use File → Export → Create a Video (PowerPoint) to render the recorded show directly to an .mp4 file — no separate screen-recorder needed for the slide portion."),
        bullet("For the live Packet Tracer segments called out in demo_video_script.md (the broken-lab walkthrough and the fix/verify steps), record those separately with any screen recorder (OBS, Zoom, etc.) and either splice them into the PowerPoint-exported video with any basic video editor, or present them live immediately after playing the narrated slides."),
        p("This gives two valid paths to the same required deliverable: a fully narrated slide video straight out of PowerPoint, optionally stitched together with a short live Packet Tracer clip for the hands-on fix-and-verify moment the checklist asks for."),

        h1("9. Team Notes"),
        bullet("Replace the placeholder team-member names/IDs on the title slide (report cover page and pptx slide 1) before final submission if your instructor requires them."),
        bullet("Run scripts/build_cases.py → scripts/rule_checker.py → scripts/run_diagnosis.py → scripts/build_dashboard.py → scripts/build_html_dashboard.py in that order to fully reproduce every data file in this package from scratch."),
        bullet("Record the demo video per Section 8, using docs/demo_video_script.md as the shot list for the live-lab portion."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/claude/netsage/docs/NetSage_AI_Submission_Report.docx", buf);
  console.log("Report written.");
});

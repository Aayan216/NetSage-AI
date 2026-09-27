#!/usr/bin/env python3
"""NetSage AI deterministic rule checker.

Checks explicit network evidence using transparent regex/keyword rules.
The checker reads the actual_show_output column when evidence_capture.csv is supplied.
It never treats command names alone as command output.
"""
import csv, re, sys
from pathlib import Path

BASE=Path(__file__).resolve().parent.parent
DEFAULT_CASES=BASE/"data"/"cases.csv"
DEFAULT_EVIDENCE=BASE/"data"/"evidence_capture.csv"
OUTPUT=BASE/"data"/"rule_checker_results.csv"

def result(flag, detail=None): return {"flag": bool(flag), "detail": detail}

def duplicate_ip(t):
    m=re.search(r"DUPLICATE ADDRESS\s+([\d.]+)",t,re.I)
    if m: return result(True,f"Duplicate address detected: {m.group(1)}")
    if re.search(r"duplicate ip|ip conflict",t,re.I): return result(True,"IP conflict detected.")
    return result(False)

def wrong_mask(t):
    if re.search(r"255\.255\.255\.128|/25",t,re.I): return result(True,"Non-/24 mask found; verify against intended subnet.")
    if re.search(r"(incorrect|wrong).*?(subnet )?mask|mask.*?(incorrect|wrong)",t,re.I): return result(True,"Evidence indicates an incorrect subnet mask.")
    return result(False)

def gateway_mismatch(t):
    g=re.search(r"(?:Default Gateway|gateway)\s*:?[ \t]*([\d.]+)",t,re.I)
    ips=re.findall(r"(?:Vlan\d+|Gi\d+/\d+|G\d+/\d+|GigabitEthernet\d+/\d+)\s+([\d.]+)(?:\s+\S+){0,4}\s+up\s+up",t,re.I)
    if g and ips and g.group(1) not in ips:
        return result(True,f"Gateway {g.group(1)} does not match active interface addresses: {', '.join(ips)}.")
    return result(False)

def interface_down(t):
    m=re.findall(r"administratively down|err-disabled|down\s+down|up\s+down",t,re.I)
    return result(bool(m),"Interface/line-protocol state issue found: "+"; ".join(m) if m else None)

def missing_vlan(t):
    m=re.search(r"(?:VLAN\s*\d+).*(?:missing|not listed|absent|not configured)",t,re.I)
    return result(bool(m),m.group(0) if m else None)

def missing_route(t):
    m=re.search(r"\(no route to [\d./]+\)|Gateway of last resort is not set|\(no OSPF route to [\d./]+\)|\(no neighbors\)",t,re.I)
    return result(bool(m),f"Routing gap found: {m.group(0)}" if m else None)

CHECKS={"duplicate_ip":duplicate_ip,"wrong_mask":wrong_mask,"gateway_mismatch":gateway_mismatch,"interface_down":interface_down,"missing_vlan":missing_vlan,"missing_route":missing_route}

def run(text): return {k:f(text or "") for k,f in CHECKS.items()}

def load_evidence(path):
    with open(path,encoding='utf-8-sig',newline='') as f: return {r['case_id']:r for r in csv.DictReader(f)}

def main():
    evidence_path=Path(sys.argv[1]) if len(sys.argv)>1 else DEFAULT_EVIDENCE
    if evidence_path.name=='cases.csv':
        print('WARNING: cases.csv contains command names, not actual command output. Use data/evidence_capture.csv after capturing output from Packet Tracer.')
        evidence={r['case_id']:{'actual_show_output':''} for r in csv.DictReader(open(evidence_path,encoding='utf-8-sig'))}
    else:
        evidence=load_evidence(evidence_path)
    cases=list(csv.DictReader(open(DEFAULT_CASES,encoding='utf-8-sig')))
    out=[]
    for r in cases:
        text=evidence.get(r['case_id'],{}).get('actual_show_output','')
        rr=run(text)
        flags=[k for k,v in rr.items() if v['flag']]
        details=[v['detail'] for v in rr.values() if v['detail']]
        out.append({'case_id':r['case_id'],'category':r['category'],'expected_fault':r['expected_fault'],
                    'evidence_present': 'yes' if text.strip() else 'no',
                    'flags_raised':';'.join(flags) or 'none','flag_count':len(flags),'details':' | '.join(details)})
    with open(OUTPUT,'w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=['case_id','category','expected_fault','evidence_present','flags_raised','flag_count','details'])
        w.writeheader(); w.writerows(out)
    present=sum(x['evidence_present']=='yes' for x in out)
    flagged=sum(x['flag_count']>0 for x in out)
    print(f'Rule checker scanned {len(out)} cases.')
    print(f'Cases with actual captured output: {present}/{len(out)}')
    print(f'Cases with deterministic flags: {flagged}')
    print(f'Full results: {OUTPUT}')

if __name__=='__main__': main()

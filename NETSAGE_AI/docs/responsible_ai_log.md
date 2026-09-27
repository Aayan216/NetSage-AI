# NetSage AI — Responsible AI Review Log

This log records first-pass AI diagnoses that required human review. Human review is mandatory before accepting a fix.

## NET-006
- **Decision:** Edited
- **AI root cause:** PC0 has an incorrect default gateway
- **Expected fault:** PC0 has an incorrect default gateway
- **AI confidence:** medium
- **Next command:** `show ip route`
- **Reviewer correction:** AI identified the gateway symptom but did not explicitly distinguish the endpoint gateway from Router0's routing table. Reviewer retained the root cause, lowered confidence pending endpoint evidence, and requested show ip route as the next network-side verification.

## NET-011
- **Decision:** Rejected
- **AI root cause:** ip helper-address is missing on Router0 G0/0
- **Expected fault:** ip helper-address is missing on Router0 G0/0
- **AI confidence:** high
- **Next command:** `show ip dhcp pool`
- **Reviewer correction:** AI attributed the DHCP failure to pool configuration without using the decisive relay evidence. The actual fault is the missing ip helper-address on Router0 G0/0. Reviewer rejected the first diagnosis and required verification of the interface helper configuration.

## NET-019
- **Decision:** Rejected
- **AI root cause:** Router2 G0/0 has an incorrect subnet mask
- **Expected fault:** Router2 G0/0 has an incorrect subnet mask
- **AI confidence:** high
- **Next command:** `show ip ospf neighbor`
- **Reviewer correction:** AI treated the failure as a generic routing problem. The supplied evidence specifically shows the Router2 G0/0 /24 mask mismatch and the OSPF neighbor disappearing. Reviewer rejected and tied the diagnosis to the incorrect transit subnet mask.

## NET-021
- **Decision:** Edited
- **AI root cause:** ACL is applied in the wrong interface/direction
- **Expected fault:** ACL is applied in the wrong interface/direction
- **AI confidence:** medium
- **Next command:** `show ip interface gigabitEthernet0/1`
- **Reviewer correction:** AI correctly noticed the ACL but initially described it as blocking traffic. The ACL deny has zero matches because it is applied inbound on the wrong interface/direction. Reviewer edited the diagnosis to emphasize placement rather than the ACL rule itself.

## NET-024
- **Decision:** Rejected
- **AI root cause:** NAT ACL does not match the actual inside subnet
- **Expected fault:** NAT ACL does not match the actual inside subnet
- **AI confidence:** high
- **Next command:** `show access-lists`
- **Reviewer correction:** AI initially treated the NAT failure as missing overload. Evidence instead shows the NAT ACL permits 192.168.60.0/24 while the real inside subnet is 192.168.50.0/24. Reviewer rejected and corrected the root cause to the NAT ACL subnet mismatch.


# Proof Artifacts

Run date: 2026-02-24 21:01:28 +07:00

Fork URL: https://github.com/ste2430973-bit/intercom
Selected app profile id: lane_board
Selected app label: Intercom Delivery Lane Board
Selected naming mode: compact
Selected proof style: bootstrap_snapshot
Mutating command: sync_delivery_lane
Query command: peek_delivery_lane
Payout Trac address: trac1rf9vlnfnlqw0wmtvxsvwcn5sgfuueje7k0ueltcpz4pne6979k2s7j43e3

Rationale: This run differs by using a delivery-lane app flow with compact sync/peek commands and a bootstrap-snapshot proof artifact.

## Files
- run.log: pear runtime startup capture (sanitized).
- run-screenshot.png: visual render of run.log.
- command-mapping.log: protocol mapTxCommand output for selected command pair.
- bootstrap-head.log: first startup section proving bootstrap, channel, and sidechannel readiness.

## Commands used
- pear run . --peer-store-name proof-lane --msb-store-name proof-lane-msb --subnet-channel proof-delivery-board --dht-bootstrap 127.0.0.1:49737 --sidechannels proof-lane-room
- node inline mapping probe: `peek_delivery_lane`
- node inline mapping probe: `{"op":"sync_delivery_lane","status":"MVP ready","note":"first demo"}`

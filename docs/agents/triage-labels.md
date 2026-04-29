# Triage Labels

We use labels to manage the lifecycle of issues. Each canonical role is mapped to a GitHub label.

## Mappings

| Role | Label | Description |
|------|-------|-------------|
| `needs-triage` | `needs-triage` | Default role for new issues. Needs evaluation. |
| `needs-info` | `needs-info` | Blocked waiting on the reporter. |
| `ready-for-agent` | `ready-for-agent` | Fully specified and ready for an AI agent to implement. |
| `ready-for-human` | `ready-for-human` | Requires human implementation or complex decision making. |
| `wontfix` | `wontfix` | Decided not to implement. |

## Usage

The `/triage` skill will apply these labels to move issues through the state machine.

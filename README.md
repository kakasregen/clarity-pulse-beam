# PulseBeam
A decentralized task tracker with light and sound notification system for productivity management on the Stacks blockchain.

## Features
- Create and manage tasks with deadlines
- Set notification preferences (light/sound/both)
- Track task completion status
- View task history and productivity metrics
- Configurable notification settings

## Setup and Installation
1. Clone the repository
2. Install Clarinet
3. Run `clarinet check` to verify contracts
4. Run `clarinet test` to execute test suite

## Usage Examples
```clarity
;; Create a new task
(contract-call? .pulse-beam create-task "Complete project" u1683900000 'light)

;; Update task status
(contract-call? .pulse-beam update-task-status u1 'completed)

;; Get task details
(contract-call? .pulse-beam get-task-details u1)

;; Configure notifications
(contract-call? .pulse-beam set-notification-preferences 'both)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment

# Requirements Document

## Introduction

This feature enhances TaskClarify with three major additions:

1. **Complete Blame-Proof Docs** - Upgrade from simple templates to AI-powered document generation
2. **Meeting Minutes Tab** - Dedicated tab for voice recording → structured meeting minutes (API exists, needs UI tab)
3. **SOP Generator Tab** - New feature to generate Standard Operating Procedures with save/like functionality and step reminders

Current dashboard state:
- Clarify Tasks (✅ fully functional)
- Blame-Proof Docs (⚠️ half done - uses templates, needs AI upgrade)
- Saved (✅ functional)

New tabs to add:
- Meeting Minutes (API exists, needs dedicated tab)
- SOP Generator (new feature with reminders)

## Glossary

- **SOP**: Standard Operating Procedure - a documented process with step-by-step instructions
- **SOP_Generator**: The AI-powered system that transforms unstructured notes into structured SOPs
- **Reminder_System**: The notification system that sends alerts for SOP steps based on timeline
- **Meeting_Minutes_Processor**: The system that transforms voice recordings or text into structured meeting minutes

## Requirements

### Requirement 1

**User Story:** As a user, I want to generate SOPs from my messy notes, so that I can have clear step-by-step procedures for recurring tasks.

#### Acceptance Criteria

1. WHEN a user enters process notes in the SOP Generator tab THEN the SOP_Generator SHALL transform the notes into a structured SOP with numbered steps
2. WHEN the SOP_Generator processes notes THEN the system SHALL include step title, description, estimated duration, and tips for each step
3. WHEN the SOP is generated THEN the system SHALL display the total estimated time for the entire procedure
4. WHEN the SOP is generated THEN the system SHALL identify any unclear points or missing information in the process

### Requirement 2

**User Story:** As a user, I want to save SOPs I like, so that I can reference them later and get reminders.

#### Acceptance Criteria

1. WHEN a user clicks the "Save SOP" button THEN the system SHALL persist the SOP to local storage with a unique identifier
2. WHEN a user saves an SOP THEN the system SHALL prompt the user to set a start date/time for the procedure
3. WHEN an SOP is saved with a start time THEN the system SHALL calculate reminder times for each step based on step durations
4. WHEN viewing saved SOPs THEN the system SHALL display the SOP name, total duration, and next scheduled step

### Requirement 3

**User Story:** As a user, I want to receive reminder notifications for each step in my saved SOPs, so that I don't forget to execute the procedure.

#### Acceptance Criteria

1. WHEN a step's scheduled time arrives THEN the Reminder_System SHALL display a browser notification with the step details
2. WHEN a reminder is triggered THEN the system SHALL show the step title, description, and any tips
3. WHEN a user completes a step THEN the system SHALL mark it as complete and schedule the next step reminder
4. IF the user dismisses a reminder without completing the step THEN the system SHALL reschedule the reminder for a configurable snooze period

### Requirement 4

**User Story:** As a user, I want to process meeting recordings into structured minutes, so that I can have clear documentation of what was discussed.

#### Acceptance Criteria

1. WHEN a user records audio in the Meeting Minutes tab THEN the Meeting_Minutes_Processor SHALL transcribe the audio to text
2. WHEN transcription is complete THEN the system SHALL process the text into structured meeting minutes
3. WHEN meeting minutes are generated THEN the system SHALL include attendees, agenda items, decisions made, action items, and follow-ups
4. WHEN meeting minutes are generated THEN the system SHALL allow the user to save or export the minutes

### Requirement 5

**User Story:** As a user, I want the dashboard to have separate tabs for each feature, so that I can easily navigate between different tools.

#### Acceptance Criteria

1. WHEN the user views the dashboard THEN the system SHALL display tabs for: Clarify Tasks, Blame-Proof Docs, Meeting Minutes, SOP Generator, and Saved
2. WHEN the user clicks a tab THEN the system SHALL switch to that feature's interface
3. WHEN the user is on any tab THEN the system SHALL maintain the state of other tabs
4. WHEN the user refreshes the page THEN the system SHALL return to the last active tab

### Requirement 6

**User Story:** As a user, I want to manage my saved SOPs, so that I can edit, delete, or reschedule them.

#### Acceptance Criteria

1. WHEN viewing saved SOPs THEN the system SHALL allow the user to delete an SOP
2. WHEN viewing a saved SOP THEN the system SHALL allow the user to reschedule the start time
3. WHEN viewing a saved SOP THEN the system SHALL show progress (completed steps vs total steps)
4. WHEN all steps are completed THEN the system SHALL mark the SOP as complete and archive it


### Requirement 7

**User Story:** As a user, I want the Blame-Proof Docs to use AI for better document generation, so that I get more contextual and professional documents.

#### Acceptance Criteria

1. WHEN a user enters a situation in Blame-Proof Docs THEN the system SHALL use AI to generate contextual paper trail emails
2. WHEN generating blame-proof documents THEN the system SHALL analyze the input for urgency, stakeholders, and timeline
3. WHEN generating action plans THEN the system SHALL provide specific, actionable steps based on the situation context
4. WHEN generating meeting agendas THEN the system SHALL tailor the agenda to the specific issue being addressed

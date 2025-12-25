# Requirements Document

## Introduction

Smart Auto-Detection is an enhancement to TaskClarify that removes the manual task type selector dropdown and uses AI-powered analysis to automatically determine the appropriate task type (Personal Plan or Software Requirement) from the user's input. This simplifies the user experience by eliminating the need for users to pre-classify their notes while providing more accurate detection than the current keyword-based matching approach.

**Current State:** The system has a task type dropdown with "Auto-detect" option that uses keyword matching in `lib/taskTypeDetector.ts`. Results already display the detected type badge.

**Target State:** Remove the dropdown entirely, use AI-powered detection, and add an override option in results.

## Glossary

- **TaskClarify**: The web application system that processes unstructured notes
- **Smart Auto-Detection**: AI-powered analysis that determines task type from content context (replacing keyword matching)
- **Task Type**: The category of input (Personal Plan or Software Requirement)
- **Keyword Matching**: The current detection method using predefined word lists (to be replaced)
- **AI Classification**: Using the LLM to understand context and classify content appropriately
- **Override**: User ability to manually change the AI-detected task type after seeing results

## Requirements

### Requirement 1

**User Story:** As a user, I want a simpler input interface without a task type dropdown, so that I can quickly paste my notes and get results.

#### Acceptance Criteria

1. WHEN a user views the input panel THEN TaskClarify SHALL NOT display a task type selector dropdown
2. WHEN a user has entered notes THEN TaskClarify SHALL enable the "Format with AI" button
3. WHEN the format button is clicked THEN TaskClarify SHALL send notes to the API for AI-powered classification

### Requirement 2

**User Story:** As a user, I want the AI to automatically detect whether my notes are personal or work-related, so that I get the correct output format without manual selection.

#### Acceptance Criteria

1. WHEN the API receives notes THEN TaskClarify SHALL use the AI model to analyze content and determine task type
2. WHEN the AI analyzes input THEN TaskClarify SHALL consider context, intent, and language patterns to classify as personal or software
3. WHEN content contains mixed signals (e.g., "buy laptop for my new project") THEN TaskClarify SHALL prioritize the primary intent based on overall context
4. WHEN the AI detects a personal task THEN TaskClarify SHALL NOT generate technical requirements or system architecture

### Requirement 3

**User Story:** As a user, I want to see what task type was detected, so that I understand how my notes were interpreted.

#### Acceptance Criteria

1. WHEN results are displayed THEN TaskClarify SHALL show a badge indicating the detected task type (already implemented)
2. WHEN the detected type is "Personal Plan" THEN TaskClarify SHALL display a green badge with "Personal Plan" label (already implemented)
3. WHEN the detected type is "Software Requirement" THEN TaskClarify SHALL display a blue badge with "Software Requirement" label (already implemented)

### Requirement 4

**User Story:** As a user, I want the option to override the detected task type if the AI got it wrong, so that I can still get the correct output format.

#### Acceptance Criteria

1. WHEN results are displayed THEN TaskClarify SHALL provide a "Wrong type?" link or button near the detected type badge
2. WHEN a user clicks the override option THEN TaskClarify SHALL display task type options (Personal Plan, Software Requirement)
3. WHEN a user selects a different task type THEN TaskClarify SHALL reprocess the notes with the selected type
4. WHILE reprocessing with override THEN TaskClarify SHALL display a loading state on the results panel

</content>

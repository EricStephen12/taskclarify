# Requirements Document

## Introduction

TaskClarify is a web application that helps users transform unstructured meeting notes into clear, actionable task requirements. Users paste their meeting notes, click a button, and receive AI-formatted output containing the task name, requirements, unclear points, and suggested clarifying questions.

## Glossary

- **TaskClarify**: The web application system that processes meeting notes
- **Meeting Notes**: Unstructured text input from users containing task-related information
- **Formatted Result**: The structured JSON output containing extracted task information
- **Claude API**: The Anthropic AI service used for text processing
- **Task Name**: A concise title extracted from the meeting notes describing the main task
- **Requirements**: A list of clear, actionable items extracted from the notes
- **Unclear Points**: Ambiguous or incomplete information identified in the notes
- **Suggested Questions**: Clarifying questions to resolve unclear points

## Requirements

### Requirement 1

**User Story:** As a user, I want to input my meeting notes into a text area, so that I can have them processed by AI.

#### Acceptance Criteria

1. WHEN a user visits the landing page THEN TaskClarify SHALL display a textarea input with minimum 400px height and full width
2. WHEN a user types in the textarea THEN TaskClarify SHALL capture and store the input text
3. WHEN the textarea is empty THEN TaskClarify SHALL disable the format button

### Requirement 2

**User Story:** As a user, I want to click a "Format with AI" button to process my notes, so that I can get structured output.

#### Acceptance Criteria

1. WHEN a user clicks the "Format with AI" button THEN TaskClarify SHALL send the notes to the Claude API for processing
2. WHILE the API request is in progress THEN TaskClarify SHALL display a loading state on the button
3. IF the API request fails THEN TaskClarify SHALL display an error message to the user

### Requirement 3

**User Story:** As a user, I want to see my notes formatted into structured sections, so that I can understand the task requirements clearly.

#### Acceptance Criteria

1. WHEN the API returns a successful response THEN TaskClarify SHALL display the task name prominently
2. WHEN the API returns a successful response THEN TaskClarify SHALL display requirements as a bullet point list
3. WHEN the API returns a successful response THEN TaskClarify SHALL display unclear points as a bullet point list
4. WHEN the API returns a successful response THEN TaskClarify SHALL display suggested questions as a bullet point list

### Requirement 4

**User Story:** As a user, I want the application to have a clean, responsive design, so that I can use it on any device.

#### Acceptance Criteria

1. THE TaskClarify landing page SHALL use a centered layout with Tailwind CSS styling
2. THE TaskClarify landing page SHALL use blue-600 as the primary color for interactive elements
3. THE TaskClarify landing page SHALL be responsive and functional on mobile devices

### Requirement 5

**User Story:** As a developer, I want the API route to properly parse Claude's response, so that the frontend receives structured data.

#### Acceptance Criteria

1. WHEN the API route receives meeting notes THEN TaskClarify SHALL send a request to Claude API with model claude-sonnet-4-20250514
2. WHEN Claude API returns a response THEN TaskClarify SHALL parse the JSON containing taskName, requirements, unclearPoints, and questions
3. IF Claude API returns malformed JSON THEN TaskClarify SHALL return an error response to the client

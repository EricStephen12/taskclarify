# Requirements Document

## Introduction

TaskClarify is a web application that helps users transform unstructured notes into clear, actionable outputs. The system intelligently detects the type of task (personal execution plan, software requirement, business task, etc.) and formats the output appropriately. Users paste their notes, optionally select a task type, click a button, and receive AI-formatted output tailored to their specific context.

## Glossary

- **TaskClarify**: The web application system that processes unstructured notes
- **Task Type**: The category of input (Personal Plan, Software Requirement, Business Task, Marketing Campaign, Financial Planning)
- **Output Mode**: The format style for results (Execution Mode, PM Mode, Developer Mode, Summary Mode)
- **Meeting Notes**: Unstructured text input from users containing task-related information
- **Personal Execution Plan**: A task type for individual action items, budgets, and personal to-dos
- **Software Requirement**: A task type for product/feature specifications requiring PRD-style output
- **Context Locking**: The system behavior that prevents inventing systems/apps when task is personal
- **Formatted Result**: The structured output containing extracted task information appropriate to task type
- **AI API**: The AI service used for text processing (Groq/Claude)
- **Task Name**: A concise title extracted from the notes describing the main task
- **Requirements**: A list of clear, actionable items extracted from the notes
- **Unclear Points**: Ambiguous or incomplete information identified in the notes
- **Suggested Questions**: Clarifying questions to resolve unclear points

## Requirements

### Requirement 1

**User Story:** As a user, I want to input my notes into a text area, so that I can have them processed by AI.

#### Acceptance Criteria

1. WHEN a user visits the dashboard page THEN TaskClarify SHALL display a textarea input with minimum 400px height and full width
2. WHEN a user types in the textarea THEN TaskClarify SHALL capture and store the input text
3. WHEN the textarea is empty THEN TaskClarify SHALL disable the format button

### Requirement 2

**User Story:** As a user, I want to select a task type before processing, so that the AI understands my context correctly.

#### Acceptance Criteria

1. WHEN a user views the input panel THEN TaskClarify SHALL display a task type selector with options: Auto-detect, Personal Plan, Software Requirement, Business Task, Marketing Campaign, Financial Planning
2. WHEN a user selects "Auto-detect" THEN TaskClarify SHALL analyze the input and determine the most appropriate task type
3. WHEN a user explicitly selects a task type THEN TaskClarify SHALL use that type regardless of input content
4. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL NOT generate technical requirements, mobile app specs, or system architecture

### Requirement 3

**User Story:** As a user, I want to click a "Format with AI" button to process my notes, so that I can get structured output.

#### Acceptance Criteria

1. WHEN a user clicks the "Format with AI" button THEN TaskClarify SHALL send the notes and selected task type to the API for processing
2. WHILE the API request is in progress THEN TaskClarify SHALL display a loading state on the button
3. IF the API request fails THEN TaskClarify SHALL display an error message to the user

### Requirement 4

**User Story:** As a user with a personal execution plan, I want to see my notes formatted into actionable steps, so that I can execute my plan clearly.

#### Acceptance Criteria

1. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL display a clear budget breakdown if financial information is present
2. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL display step-by-step execution items as a checklist
3. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL display constraints and limitations
4. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL display risks and checkpoints
5. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL NOT display technical requirements or system architecture

### Requirement 5

**User Story:** As a user with a software requirement, I want to see my notes formatted into PRD-style sections, so that developers can understand the task requirements clearly.

#### Acceptance Criteria

1. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display functional requirements with acceptance criteria
2. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display technical requirements
3. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display user stories in standard format
4. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display unclear points as a bullet point list
5. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display suggested questions as a bullet point list

### Requirement 6

**User Story:** As a user, I want the application to have a clean, responsive design, so that I can use it on any device.

#### Acceptance Criteria

1. THE TaskClarify dashboard page SHALL use a centered layout with Tailwind CSS styling
2. THE TaskClarify dashboard page SHALL use blue-600 as the primary color for interactive elements
3. THE TaskClarify dashboard page SHALL be responsive and functional on mobile devices

### Requirement 7

**User Story:** As a developer, I want the API route to properly detect task type and format response accordingly, so that the frontend receives appropriately structured data.

#### Acceptance Criteria

1. WHEN the API route receives notes with task type "auto" THEN TaskClarify SHALL analyze content to detect if it's personal, software, business, marketing, or financial
2. WHEN the API route detects a personal plan THEN TaskClarify SHALL return PersonalPlanResult with budget, steps, constraints, and risks
3. WHEN the API route detects a software requirement THEN TaskClarify SHALL return SoftwareRequirementResult with functionalRequirements, technicalRequirements, and userStories
4. IF the AI API returns malformed JSON THEN TaskClarify SHALL return an error response to the client

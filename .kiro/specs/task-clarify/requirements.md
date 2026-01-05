# Requirements Document

## Introduction

TaskClarify is a web application that helps users transform unstructured notes into clear, actionable outputs. The system intelligently detects the type of task (personal execution plan, software requirement, business task, etc.) and formats the output appropriately. Users paste their notes, optionally select a task type, click a button, and receive AI-formatted output tailored to their specific context.

## Glossary

- **TaskClarify**: The web application system that processes unstructured notes
- **Task Type**: The category of input (Personal Plan, Software Requirement, Business Task, SOP, Blame Proof)
- **Output Mode**: The format style for results (Execution Mode, PM Mode, Developer Mode, Summary Mode)
- **Meeting Notes**: Unstructured text input from users containing task-related information
- **Personal Execution Plan**: A task type for individual action items, budgets, and personal to-dos
- **Software Requirement**: A task type for product/feature specifications requiring PRD-style output
- **Business Task**: A task type for business operations, metrics tracking, and process improvements
- **SOP (Standard Operating Procedure)**: A task type for step-by-step procedures with time estimates and responsible roles
- **Blame Proof**: A task type for accountability documentation, paper trails, and professional protection
- **Context Locking**: The system behavior that prevents inventing systems/apps when task is personal
- **Formatted Result**: The structured output containing extracted task information appropriate to task type
- **AI API**: The AI service used for text processing (Groq/Claude)
- **Task Name**: A concise title extracted from the notes describing the main task
- **Requirements**: A list of clear, actionable items extracted from the notes
- **Unclear Points**: Ambiguous or incomplete information identified in the notes
- **Suggested Questions**: Clarifying questions to resolve unclear points
- **Paper Trail**: Documentation that provides evidence of communications and decisions for accountability

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

1. WHEN a user views the input panel THEN TaskClarify SHALL display a task type selector with options: Auto-detect, Personal Plan, Software Requirement, Business Task, SOP, Blame Proof
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
2. WHEN the task type is "Personal Plan" AND budget is zero or unspecified THEN TaskClarify SHALL suggest free alternatives (bodyweight workouts, free apps like Strava, MyFitnessPal)
3. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL display step-by-step execution items as a checklist with "start small" recommendations
4. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL suggest tracking options (free apps like MyFitnessPal, Google Fit, Strava)
5. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL display constraints and limitations
6. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL display risks and checkpoints with motivational mitigations (buddy system, injury prevention)
7. WHEN the task type is "Personal Plan" THEN TaskClarify SHALL NOT display technical requirements or system architecture

### Requirement 5

**User Story:** As a user with a software requirement, I want to see my notes formatted into PRD-style sections, so that developers can understand the task requirements clearly.

#### Acceptance Criteria

1. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display functional requirements with acceptance criteria
2. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display technical requirements
3. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display user stories with specific personas (subscribed user, paying customer, admin) instead of generic "End-user"
4. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL include "Subscription tiers/pricing" as a common unclear point when payment-related
5. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display unclear points as a bullet point list
6. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL display suggested questions as a bullet point list
7. WHEN the task type is "Software Requirement" THEN TaskClarify SHALL suggest common out-of-scope items (multi-currency support, refunds handling) when relevant

### Requirement 6

**User Story:** As a user, I want the application to have a clean, responsive design, so that I can use it on any device.

#### Acceptance Criteria

1. THE TaskClarify dashboard page SHALL use a centered layout with Tailwind CSS styling
2. THE TaskClarify dashboard page SHALL use blue-600 as the primary color for interactive elements
3. THE TaskClarify dashboard page SHALL be responsive and functional on mobile devices

### Requirement 7

**User Story:** As a developer, I want the API route to properly detect task type and format response accordingly, so that the frontend receives appropriately structured data.

#### Acceptance Criteria

1. WHEN the API route receives notes with task type "auto" THEN TaskClarify SHALL analyze content to detect if it's personal, software, business, sop, or blameproof
2. WHEN the API route detects a personal plan THEN TaskClarify SHALL return PersonalPlanResult with budget, steps, constraints, and risks
3. WHEN the API route detects a software requirement THEN TaskClarify SHALL return SoftwareRequirementResult with functionalRequirements, technicalRequirements, and userStories
4. IF the AI API returns malformed JSON THEN TaskClarify SHALL return an error response to the client

### Requirement 8

**User Story:** As a user with a business task, I want to see my notes formatted into business-focused outputs, so that I can track metrics and improve operations.

#### Acceptance Criteria

1. WHEN the task type is "Business Task" THEN TaskClarify SHALL display functional requirements focused on business metrics (response time, satisfaction scores, NPS)
2. WHEN the task type is "Business Task" THEN TaskClarify SHALL display measurable acceptance criteria with specific targets
3. WHEN the task type is "Business Task" THEN TaskClarify SHALL display user stories from multiple perspectives (customer, support agent, manager)
4. WHEN the task type is "Business Task" THEN TaskClarify SHALL include questions for baseline metrics and target response times
5. WHEN the task type is "Business Task" THEN TaskClarify SHALL suggest additional FRs (Team Training, Knowledge Base Implementation) when relevant
6. WHEN the task type is "Business Task" AND technical requirements section is empty THEN TaskClarify SHALL suggest ticketing system upgrades or omit the section

### Requirement 9

**User Story:** As a user creating an SOP, I want to see my notes formatted into step-by-step procedures with time estimates, so that teams can follow consistent processes.

#### Acceptance Criteria

1. WHEN the task type is "SOP" THEN TaskClarify SHALL display total time estimate and numbered steps with individual time allocations
2. WHEN the task type is "SOP" THEN TaskClarify SHALL display responsible roles for each step (HR Manager, IT Support, etc.)
3. WHEN the task type is "SOP" THEN TaskClarify SHALL display practical tips under each step
4. WHEN the task type is "SOP" THEN TaskClarify SHALL include checklist format for steps with multiple sub-items (accounts: Email, Slack, GitHub)
5. WHEN the task type is "SOP" THEN TaskClarify SHALL include post-process follow-up recommendations (Day 7 check-in meeting)
6. WHEN the task type is "SOP" THEN TaskClarify SHALL flag unclear points about tools, timelines, and specific requirements

### Requirement 10

**User Story:** As a user needing documentation for accountability, I want to see my notes formatted into paper trail outputs, so that I can protect myself professionally.

#### Acceptance Criteria

1. WHEN the task type is "Blame Proof" THEN TaskClarify SHALL generate a ready-to-send email template with proper placeholders ([Name], [Date], CC line)
2. WHEN the task type is "Blame Proof" THEN TaskClarify SHALL display action plan broken into Immediate, Short-term, and Long-term sections
3. WHEN the task type is "Blame Proof" THEN TaskClarify SHALL include timeline tracker with guidance to log actual timestamps when actions occur
4. WHEN the task type is "Blame Proof" THEN TaskClarify SHALL generate meeting agenda with time allocations
5. WHEN the task type is "Blame Proof" THEN TaskClarify SHALL include "Confirmation required" notes (Reply to confirm receipt of task)
6. WHEN the task type is "Blame Proof" THEN TaskClarify SHALL identify blockers with mitigation suggestions

### Requirement 11

**User Story:** As a user, I want consistent formatting and the ability to export outputs, so that I can share and use the results effectively.

#### Acceptance Criteria

1. THE TaskClarify output SHALL use consistent bullet styles throughout all modes
2. THE TaskClarify output SHALL NOT contain typos (businessis, fit instead of could)
3. WHEN displaying any output THEN TaskClarify SHALL provide an Export or Share button option

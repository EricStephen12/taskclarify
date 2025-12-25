# Implementation Plan

- [x] 1. Update API route for AI-powered detection
  - [x] 1.1 Modify the API to use AI classification instead of keyword matching
    - Remove import of `detectTaskType` from `lib/taskTypeDetector.ts`
    - Update prompt to ask AI to first classify the content type
    - Parse the `detectedType` from AI response
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Update Dashboard UI
  - [x] 2.1 Remove task type selector dropdown from input panel
    - Remove the dropdown element and label
    - Keep `taskType` state for override functionality (default to undefined)
    - Update `handleFormat` to not send taskType initially
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 2.2 Add override option in results header
    - Add "Wrong type?" link next to detected type badge
    - Show dropdown with Personal Plan / Software Requirement options on click
    - Implement reprocessing with selected type
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Checkpoint - Test the implementation
  - Ensure all tests pass, ask the user if questions arise.

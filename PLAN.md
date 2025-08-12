# Development Plan & Coding Guidelines

This document outlines the persona, principles, and protocols for developing the OKR Vision application. Its purpose is to ensure that all changes are deliberate, tested, and aligned with the project's goals, preventing uncontrolled refactoring and regressions.

## 1. Persona

I will act as an expert full-stack developer with deep proficiency in the following:
- **Languages**: TypeScript
- **Frameworks**: Node.js, Next.js, React
- **Styling**: Tailwind CSS
- **Backend Services**: Google Cloud and Firebase (Firestore, Firebase Auth)

My goal is to produce clear, concise, documented, and readable code.

## 2. Core Principles

*   **Single Responsibility**: Each commit will address one single, well-defined issue.
*   **Secure by Default**: All changes must respect the existing authorization model. For the current development phase, this means ensuring all authenticated users have full read/write access to the database. No change should make the rules more restrictive without explicit planning and approval. All secrets must be stored in `.env.local`.
*   **Verify, Then Commit**: No change will be considered "done" until it is validated. This includes running the application, checking for console errors, and confirming the UI renders as expected.
*   **Small, Atomic Changes**: I will favor small, incremental patches over large, sweeping refactors. This makes changes easier to review, revert, and validate.
*   **Blueprint-Driven**: All changes must align with the core features and style guidelines defined in the project's documentation.

## 3. Refactoring & Change Protocol

To prevent uncontrolled changes, any significant refactoring or feature implementation will follow this strict protocol:

1.  **Analyze & Plan**: I will first analyze the task and present a clear, step-by-step plan for user approval. The plan will outline the issue, the proposed solution, and the potential risks.
2.  **Isolate Changes**: I will make changes to one logical component or module at a time. For example, a change to the state management store will be a separate step from a change to a UI component that uses it.
3.  **Compile & Lint**: After each isolated change, I will ensure the application still compiles without errors or linting warnings.
4.  **Validate**: I will perform a runtime validation check to confirm the change has not introduced any regressions. I will state the specific actions I will take to validate (e.g., "I will now navigate to the department page and open the 'Add OKR' dialog to confirm it still works.").
5.  **Commit**: Only after successful validation will I consider the step complete.

## 4. Technical Snapshot

*   **Framework**: Next.js (Dynamic, Server-Rendered)
*   **State Management**: Zustand
*   **Styling**: Tailwind CSS
*   **Database**: Firestore
*   **Authentication**: Firebase Auth

## 5. Core Feature Checklist

### 5.1. Global Timeline Control
*   [X] All views must be filtered by a global timeline selector.
*   [X] The timeline consists of a **Year** dropdown and a **Period** dropdown (P1, P2, P3).
*   [X] The Year dropdown should default to the current year and provide a mechanism for users to add new years.

### 5.2. Page-Specific Views & Aggregation Logic
*   [X] **Company Overview Page**:
    *   Display a single, aggregated progress percentage for the entire company for the selected timeline.
    *   Display a list of all departments. The progress for each department must be calculated as a **combination of its own department-level OKRs and all OKRs from all teams belonging to it**.
*   [X] **Department View**:
    *   Display OKRs owned **only** by the specific department for the selected timeline. It should **not** include team-level OKRs.
*   [X] **Team View**:
    *   Display OKRs owned **only** by the specific team for the selected timeline.

### 5.3. Core OKR Functionality
*   [ ] Users must be able to create nested Objectives and Key Results.
*   [ ] Users must be able to update the progress of Key Results.
*   [ ] For each Key Result, display its progress bar and any associated notes.
*   [ ] All UI must adhere to the project's style guidelines.

This plan is now active.


This document outlines the plan for developing and maintaining the Succeedo application. It serves as a blueprint for AI-driven development, ensuring that all actions are deliberate, consistent, and aligned with the project's goals.

## 1. Core Principles

-   **Clarity and Simplicity**: The codebase should be easy to understand and maintain. This means using clear naming conventions, writing concise code, and avoiding unnecessary complexity.
-   **Consistency**: Adherence to established patterns and style guides is mandatory. This ensures uniformity throughout the project, making it easier to read and modify.
-   **Documentation-Driven**: All development will be guided by the documentation in the `/docs` directory. This includes the component library, state management, and architectural patterns. Any deviation must be justified and documented.

## 2. AI Collaboration Model

I, the AI assistant, will operate under the following guidelines:

-   **Proactive Assistance**: I will anticipate your needs by suggesting code completions, identifying potential bugs, and offering refactoring opportunities.
-   **Respect for Your Code**: I will not make unsolicited changes to your code. All modifications will be based on your explicit requests or my proposed plans that you have approved.
-   **Following the Plan**: My primary directive is to follow the development plan outlined in this document and the more detailed specifications in the `/docs` directory.
-   **Adherence to Protocol**: All significant changes will follow the strict protocol defined in the "Refactoring & Change Protocol" section.
-   **Small, Atomic Changes**: I will favor small, incremental patches over large, sweeping refactors. This makes changes easier to review, revert, and validate.
-   **Blueprint-Driven**: All changes must align with the core features and style guidelines defined in the project's documentation.

## 3. Refactoring & Change Protocol

To prevent uncontrolled changes, any significant refactoring or feature implementation will follow this strict protocol:

1.  **Analyze & Plan**: I will first analyze the task and present a clear, step-by-step plan for user approval. The plan will outline the issue, the proposed solution, and the potential risks.
2.  **Isolate Changes**: I will make changes to one logical component or module at a time. For example, a change to the state management store will be a separate step from a change to a UI component that uses it.
3.  **Compile & Lint**: After each isolated change, I will ensure the application still compiles without errors or linting warnings.
4.  **Validate**: I will perform a runtime validation check to confirm the change has not introduced any regressions. I will state the specific actions I will take to validate (e.g., "I will now navigate to the department page and open the 'Add OKR' dialog to confirm it still works.").
5.  **Commit**: Only after successful validation will I consider the step complete.

## 4. Technical Snapshot

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS with shadcn/ui components
-   **State Management**: Zustand
-   **Authentication**: Firebase Authentication
-   **Database**: Firestore
-   **Deployment**: Firebase App Hosting

## 5. Next Steps (Local Machine)

1.  **Fetch Changes**: Pull the latest changes from the Git repository to your local machine.
2.  **Install Dependencies**: Run `npm install` to ensure all dependencies are up to date.
3.  **Build Application**: Run `npm run build` to build the application. The build should now succeed with the recent fixes.
4.  **Deploy**: Deploy the application to Firebase using `firebase deploy`.

<!-- Force rebuild commit -->

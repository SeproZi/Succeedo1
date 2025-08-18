# **App Name**: OKR Vision

## Core Features:

- Nested OKR Creation: Create nested Objectives and Key Results to establish a clear hierarchy and track dependencies.
- Key Result Progress Updates: Update the progress of Key Results with real-time tracking and visual indicators.
- Objective Progress Dashboard: View overall objective progress through an interactive dashboard, with charts.
- Automatic goal progress visualization: Visualize goal progress by automatically updating and displaying the completion percentage of a group of objectives based on underlying key results.

## Style Guidelines:

- Primary color: Deep blue (#293B5F) to convey stability, focus, and trust.
- Background color: Light, desaturated blue (#D2D9E8) for a calming and clean backdrop.
- Accent color: Bright orange (#E67700) for call-to-actions and highlights, providing contrast and energy.
- Font pairing: 'Space Grotesk' (sans-serif) for headings, paired with 'Inter' (sans-serif) for body text.
- Use modern, minimalist icons to represent different aspects of the OKRs (e.g., targets, progress, milestones).
- Employ a clean, card-based layout to organize information effectively.

# Application Summary: OKR Vision

The OKR Vision application is a Next.js project built with TypeScript, designed to help users create, track, and visualize Objectives and Key Results (OKRs). The application aims to provide a clear and intuitive platform for managing goals within organizations.

### Core Features:

- **Nested OKR Creation:** The application allows users to create a hierarchical structure of OKRs. This means Objectives can have nested Key Results, and potentially sub-objectives, to reflect the cascading nature of goals within a team or company. Components like `src/components/app/add-okr-dialog.tsx`, `src/components/app/add-department-dialog.tsx`, and `src/components/app/add-team-dialog.tsx` suggest the ability to create OKRs at different organizational levels.
- **Key Result Progress Updates:** Users can update the progress of individual Key Results. The application likely provides real-time tracking and visual indicators (e.g., progress bars, status icons) to show the current state of each Key Result. The presence of a `src/components/ui/progress.tsx` UI component supports this feature.
- **Objective Progress Dashboard:** The application includes a dashboard that provides an overview of objective progress. This dashboard likely uses charts and other visualizations to present key metrics and trends. The `src/components/app/okr-dashboard.tsx` and `src/components/app/company-overview-client-page.tsx` components, along with the `src/components/ui/chart.tsx` UI component, indicate the existence of this feature.
- **Automatic Goal Progress Visualization:** The application automatically calculates and visualizes the completion percentage of objectives based on the progress of their underlying key results. This provides users with a clear and up-to-date view of overall goal achievement without manual calculation. The `src/components/app/pillar-progress.tsx` component might be involved in this visualization.

### Style Guidelines:

The application adheres to a specific set of style guidelines to create a consistent and visually appealing user interface:

- **Color Palette:**
    - Primary: Deep blue (`#293B5F`) for stability and focus.
    - Background: Light, desaturated blue (`#D2D9E8`) for a calming backdrop.
    - Accent: Bright orange (`#E67700`) for call-to-actions and highlights.
    These colors are likely implemented through Tailwind CSS configuration and applied to the various UI components.
- **Typography:** The application uses 'Space Grotesk' for headings and 'Inter' for body text, both sans-serif fonts, to maintain a clean and modern look.
- **Icons:** Modern, minimalist icons are used to represent different aspects of OKRs, enhancing visual clarity and user experience.
- **Layout:** The application employs a clean, card-based layout to organize information effectively. This is evident in components like `src/components/app/okr-card.tsx` and the general structure of pages displaying OKRs. The use of shadcn/ui components also suggests a focus on well-structured and visually appealing elements.

### Project Structure Supporting Style:

The project structure supports these style guidelines through:

- **Tailwind CSS Configuration:** `tailwind.config.ts` is where the color palette and typography might be defined and customized.
- **shadcn/ui Components:** The `src/components/ui` directory contains a collection of reusable UI components built with shadcn/ui, which are designed to be minimalist and consistent. These components provide the building blocks for the application's interface, ensuring adherence to the style guidelines.
- **Component Organization:** The separation of application-specific components (`src/components/app`) from generic UI components (`src/components/ui` directory) promotes reusability and maintainability, making it easier to enforce consistent styling across the application.
# AI Assistant Rules for Oneida County Healthcare Directory

This document outlines the core technologies and best practices for developing and modifying the Oneida County Healthcare Directory application.

## Tech Stack Overview

*   **React**: The application is built using React for a component-based UI architecture.
*   **TypeScript**: All new and existing code should be written in TypeScript for type safety and improved developer experience.
*   **Tailwind CSS**: Styling is exclusively handled by Tailwind CSS. Utilize its utility classes for all design aspects.
*   **shadcn/ui**: A collection of beautifully designed, accessible, and customizable UI components built with Radix UI and Tailwind CSS.
*   **Wouter**: A lightweight and flexible client-side router for React, used for managing application routes.
*   **Lucide React**: Provides a set of consistent and customizable SVG icons for the application.
*   **Chart.js**: Used for rendering interactive data visualizations, specifically donut and bar charts.
*   **Sonner**: Integrated via shadcn/ui for displaying toast notifications.
*   **Custom Data Utilities**: Data fetching and processing from `data.json` are handled by custom utility functions.
*   **Mobile-First & Responsive Design**: All components and layouts must be designed with a mobile-first approach and be fully responsive.

## Library Usage Rules

To maintain consistency and efficiency, please adhere to the following guidelines when implementing features or making changes:

*   **UI Components**: Always prioritize using components from `shadcn/ui` (e.g., `Button`, `Card`, `Input`, `Badge`). If a required component doesn't exist in `shadcn/ui` or needs significant customization, create a new, small, focused component in `src/components/`.
*   **Styling**: Use Tailwind CSS classes for all styling. Avoid inline styles or separate CSS files unless absolutely necessary for global styles (like `index.css`).
*   **Icons**: Use icons from `lucide-react`.
*   **Routing**: Use `wouter` for all navigation and route management. Keep routes defined in `src/App.tsx`.
*   **State Management**: For local component state, use React's `useState` and `useReducer` hooks. For global state, leverage React's Context API (`useContext`).
*   **Data Visualization**: For charts and graphs, use `Chart.js`. Ensure charts are responsive and visually integrated with the application's theme.
*   **Notifications**: Use the `Toaster` component from `shadcn/ui/sonner` for all user notifications (e.g., success messages, errors).
*   **Data Handling**: When interacting with the `data.json` file, use or extend the existing utility functions in `src/lib/dataUtils.ts` to ensure consistent data processing.
*   **File Structure**:
    *   New pages should go into `src/pages/`.
    *   New components should go into `src/components/`.
    *   Utility functions should go into `src/lib/`.
    *   All directory names must be lowercase.
*   **No Partial Implementations**: All code changes must be complete and fully functional. Avoid placeholders or `TODO` comments for features that are not yet implemented.
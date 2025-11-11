# AI Rules for HealthDirect Application

This document outlines the core technologies and libraries used in the HealthDirect application, along with clear guidelines for their usage.

## 🛠️ Tech Stack Overview

*   **Frontend Framework**: Next.js 15 with App Router for server-side rendering and routing.
*   **Language**: TypeScript for type safety and improved code quality.
*   **Styling**: Tailwind CSS for all UI styling, ensuring a consistent and responsive design.
*   **Database & Backend**: Supabase (PostgreSQL) for database management, authentication, and real-time capabilities.
*   **Mapping**: Mapbox GL JS and `react-map-gl` for interactive maps and location-based services.
*   **AI Integration**: Open Router API (specifically Claude 3 Haiku) for the AI Concierge chat functionality.
*   **UI Components**: Shadcn/ui components (built on Radix UI) for accessible and customizable UI elements.
*   **Icons**: Heroicons and Lucide React for a wide range of vector icons.
*   **Deployment**: Vercel for seamless deployment and hosting.
*   **Utility Libraries**: `clsx` and `tailwind-merge` for efficient class management.

## 📚 Library Usage Rules

To maintain consistency and leverage the strengths of each library, please adhere to the following rules:

*   **Next.js**: Always use Next.js 15 with the App Router for page routing, API routes, and data fetching.
*   **TypeScript**: All new and modified code must be written in TypeScript. Ensure proper typing for all components, props, and data structures.
*   **Tailwind CSS**: Use Tailwind CSS classes exclusively for all styling. Avoid inline styles or custom CSS files unless absolutely necessary for specific overrides not achievable with Tailwind.
*   **Supabase**:
    *   For all database interactions (fetching, inserting, updating, deleting data), use the `@supabase/supabase-js` client.
    *   For server-side Supabase operations (e.g., in API routes), use the `SUPABASE_SERVICE_ROLE_KEY` with `supabaseAdmin`.
    *   For client-side authentication and data access, use the `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the regular `supabase` client.
*   **Mapbox**: Use `mapbox-gl` and `react-map-gl` for rendering maps and managing map interactions. Ensure `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is correctly configured.
*   **Open Router API**: All AI chat functionalities should integrate with the Open Router API using the `OPENROUTER_API_KEY` for secure server-side calls.
*   **UI Components**:
    *   Prioritize using existing shadcn/ui components for common UI patterns (e.g., buttons, dialogs, selects, sliders).
    *   If a required component is not available in shadcn/ui, create a new, small, and focused component in `src/components/` using Tailwind CSS.
    *   Do not modify shadcn/ui component files directly; create new components that wrap or extend them if customization is needed.
*   **Icons**: Use icons from `@heroicons/react` or `lucide-react`. Choose the most semantically appropriate icon for the context.
*   **Utility Functions**: Utilize `src/lib/utils.ts` for `cn` (combining `clsx` and `tailwind-merge`) to manage dynamic Tailwind classes.
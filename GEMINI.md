# Gemini Customization

This file contains instructions for Gemini to customize its behavior for this project.

## General Instructions

- Be concise and to the point.
- Always ask for clarification if a request is ambiguous.
- Prefer using the existing libraries and frameworks in the project.

## Coding Style

- Follow the existing coding style in the project.
- Use Prettier for formatting.
- Add JSDoc comments to all new functions.

## File Preferences

- Pay special attention to the `src/app` directory.
- Ignore the `node_modules` and `.next` directories.

---

## Project Concept: Domilia

### Overview
- **Product:** A SaaS platform to centralize and simplify home management (finances, tasks).
- **Target:** Families and individuals looking to organize household responsibilities.
- **Key Feature:** Centralization and future AI-powered proactive insights.

### Current Features (MVP+)
- Secure Authentication
- Financial Dashboard (balance, income, expenses)
- Transaction Management (CRUD)
- Advanced Reports with charts and CSV export
- Customizable Settings (categories, recurring transactions)
- Shared "Domus" (household) for multi-user collaboration
- Household tasks module

### Technology Stack
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend & DB:** Supabase (PostgreSQL, Auth)
- **Libraries:** Recharts, react-hook-form, Zod, date-fns
- **Hosting:** Vercel

### Next Steps (Roadmap)
- **Short-term:** Automate recurring transactions.
- **Mid-term:** Implement family budgeting tools and a PWA.
- **Long-term:** Add inventory/document modules, a native app, and AI features.
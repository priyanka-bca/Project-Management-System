# Tasknity - Admin Web Dashboard

A React-based web application for admin dashboard and system administration in the Project Management System.

## Features

- **Admin Dashboard**: Overview of all projects, groups, and team members
- **Group Management**: Create, view, and manage project groups
- **User Management**: Manage team members and their roles
- **Task Management**: Create and assign tasks to group members
- **Analytics**: View system-wide analytics and reporting
- **Role-Based Access**: Admin-only functionality protected by role verification

## Supported Role

- **Admin**: Full system administration and management (web-only)

## Tech Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context API

## Prerequisites

- Node.js 16+ and npm
- Supabase account and API keys
- Modern web browser

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── admin/          # Admin-specific components and pages
├── auth/           # Authentication screens (Login, Signup, OTP)
├── components/     # Reusable UI components
├── context/        # React Context for state management
├── layouts/        # Layout components
├── reports/        # Reporting and analytics pages
└── utils/          # Utility functions
```

## Features by Component

### Admin Pages
- **AdminDashboard**: Main dashboard with overview and statistics
- **AdminAnalytics**: Detailed analytics and reporting
- **GroupDetails**: Manage individual group members and tasks

### Protected Routes
All admin routes are protected and require admin role authentication.

## ESLint Configuration

This project includes ESLint configuration. For production applications with TypeScript, refer to the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for type-aware lint rules.

# Project-Management-System

A comprehensive Project Management System developed as a final year college project. This system helps teams and organizations plan, track, and manage projects efficiently with role-based interfaces.

## System Architecture

The project is built using a distributed architecture with three main components:

### 1. **Flutter Mobile App** (tasknity/)
- **Supported Roles**: Member, Leader
- **Purpose**: Mobile interface for task management and team collaboration
- **Features**:
  - Real-time task tracking
  - Group and project dashboards
  - Team communication and collaboration
  - Task assignment and progress monitoring

### 2. **React Web App** (tasknity-web/)
- **Supported Role**: Admin
- **Purpose**: Admin dashboard for system administration and oversight
- **Features**:
  - System user management
  - Project and team administration
  - Analytics and reporting
  - Platform configuration

### 3. **Backend** (backend/)
- **Technology**: Node.js
- **Purpose**: RESTful API and business logic
- **Database**: Supabase (PostgreSQL)

## Roles & Responsibilities

| Role | Platform | Responsibilities |
|------|----------|------------------|
| **Admin** | React Web | System administration, user management, platform oversight |
| **Leader** | Flutter Mobile | Project leadership, team management, task delegation |
| **Member** | Flutter Mobile | Task execution, collaboration, progress updates |

## Project Structure

```
.
├── tasknity/                 # Flutter mobile app (Member & Leader)
├── tasknity-web/             # React web app (Admin)
├── backend/                  # Node.js backend API
└── docs/                     # Documentation and database scripts
```

## Tech Stack

- **Frontend (Mobile)**: Flutter/Dart
- **Frontend (Web)**: React, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Hosting**: Supabase

## Getting Started

### Prerequisites
- Flutter SDK (for mobile development)
- Node.js & npm (for backend)
- Supabase account and API keys

### Installation

**Mobile App:**
```bash
cd tasknity
flutter pub get
flutter run
```

**Web App:**
```bash
cd tasknity-web
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm start
```

## Database

SQL Server database scripts are available in `docs/SQL Server Database Scripts/` for setting up the database schema.

## Documentation

See [docs/README.md](docs/README.md) for detailed documentation and figures.

# Tasknity - Flutter Mobile App

A Flutter mobile application for project management, built for **Members** and **Leaders**.

## Project Architecture

**Tasknity** uses a distributed architecture:

- **Flutter Mobile App** (tasknity/): Member and Leader interfaces for task management, collaboration, and project tracking
- **React Web App** (tasknity-web/): Admin dashboard for system administration and oversight
- **Backend** (backend/): Node.js server handling API requests and database operations
- **Database**: Supabase (PostgreSQL)

## Supported Roles

- **Member**: Team members who participate in projects and complete assigned tasks
- **Leader**: Project leads who manage teams, assign tasks, and oversee project progress
- **Admin**: System administrators managing the platform (web interface only)

## Features

- Real-time task management and updates
- Group and project dashboard
- Team collaboration tools
- Task assignment and tracking
- Role-based access control

## Getting Started

This project is a Flutter application. For help with Flutter development:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)
- [Online Documentation](https://docs.flutter.dev/)

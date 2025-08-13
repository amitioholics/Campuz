# Student Management System

A comprehensive web application built with Next.js, TypeScript, and Supabase for managing students, courses, attendance, and exams.

## Features

- **Authentication**: Secure login and signup system
- **Role-based Access**: Different dashboards for students, faculty, and administrators
- **Course Management**: Create, edit, and manage courses
- **Student Enrollment**: Enroll students in courses
- **Attendance Tracking**: Mark and view student attendance
- **Exam Management**: Create and manage exams with results
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd student-management-system
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up the database:
Run the SQL scripts in the `scripts/` directory in your Supabase SQL editor:
- `01-create-tables.sql`
- `02-seed-data.sql`
- `03-create-essential-tables.sql`
- `04-fix-profile-trigger.sql`
- `05-update-profile-trigger.sql`
- `06-simple-profile-trigger.sql`
- `08-create-profile-trigger.sql`

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── attendance/        # Attendance management pages
│   ├── auth/             # Authentication pages
│   ├── courses/          # Course management pages
│   ├── dashboard/        # Dashboard pages
│   └── exams/           # Exam management pages
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── *.tsx           # Custom components
├── lib/                 # Utility functions and configurations
│   ├── supabase/       # Supabase client configurations
│   └── actions.ts      # Server actions
├── scripts/            # Database setup scripts
└── public/            # Static assets
```

## Features Overview

### Authentication
- Secure login and signup with Supabase Auth
- Role-based access control
- Protected routes

### Dashboard
- **Student Dashboard**: View enrolled courses, attendance, and exam results
- **Faculty Dashboard**: Manage courses, mark attendance, and create exams
- **Admin Dashboard**: Full system management capabilities

### Course Management
- Create and edit courses
- Assign faculty to courses
- Enroll students in courses
- View course details and participants

### Attendance System
- Mark daily attendance for students
- View attendance reports
- Track attendance history

### Exam Management
- Create exams with multiple questions
- Assign exams to courses
- Grade and record results
- View exam performance analytics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

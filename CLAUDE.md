# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Build production application
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate              # Generate Prisma client
npx prisma migrate dev          # Run database migrations
npx prisma db push              # Push schema changes directly to database
npx prisma studio               # Open Prisma Studio database browser
```

## Architecture Overview

This is **n-GUIDES**, an image perception evaluation platform built with Next.js 15 App Router. The system allows researchers to create projects with images and questions, then collect slider-based evaluation data from participants.

### Core Data Flow
```
User → Project → Images + Questions → Evaluation Sessions → Scores
```

### Key Relationships (Prisma Schema)
- **User** (1:N) **Project**: Users own multiple projects
- **Project** (1:N) **Image** + **Question**: Projects contain images and evaluation questions
- **Score**: Links Image + Question + Session with evaluation values (-1 to 1 scale)
- **Session**: Anonymous evaluation sessions tracked by UUID

## Authentication & Authorization

### NextAuth.js Configuration
- **Strategy**: JWT-based sessions
- **Provider**: Credentials (username/email + bcrypt password)
- **Session Extension**: Custom callbacks add user data to session
- **Protection**: `getServerSession()` for server-side route protection

### Session Data Structure
```typescript
session.user = { id, email, username }
```

## Key Technical Patterns

### Database Operations
- **Centralized Queries**: Use functions in `/src/lib/db/projects.ts`
- **Prisma Client**: Singleton pattern in `/src/lib/prisma.ts`
- **Server Components**: Direct database access with `revalidate: 30`

### Image Management (AWS S3)
- **Upload Flow**: Client requests presigned URL → Direct S3 upload → Store metadata in DB
- **Security**: Presigned URLs for secure uploads, public read access
- **API Route**: `/api/upload-url` generates presigned URLs

### Evaluation System
- **Image Display**: Configurable viewing duration with Framer Motion transitions
- **Scoring**: MUI Slider components (-1 to 1 scale)
- **Randomization**: Images shuffled per session to prevent bias
- **Data Collection**: Anonymous sessions with UUID tracking

### API Route Patterns
- **REST Design**: Standard CRUD operations for projects
- **Error Handling**: Try-catch with consistent error response format
- **Authorization**: Session-based protection for user-owned resources
- **File Handling**: Multipart form data for project updates with images

## Component Architecture

### Layout Structure
```
RootLayout (Material-UI Theme + SessionProvider)
├── Header (persistent navigation)
└── Page Components
```

### State Management
- **Server State**: Initial data from Server Components
- **Client State**: React hooks + SWR for data fetching
- **URL State**: Search params for notifications and routing
- **Form State**: Controlled components with validation

### Key Components
- **EditProject**: Comprehensive project editing with image upload
- **EvaluateClient**: Main evaluation interface with timer and scoring
- **MetricsDashboard**: Charts and analytics using Recharts
- **ProjectCard**: Project listing with context menus

## Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="random-string"
NEXTAUTH_URL="http://localhost:3000"

# API
NEXT_API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# AWS S3
AWS_REGION="ap-northeast-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
S3_BUCKET_NAME="your-bucket"
```

## Development Patterns

### Type Safety
- **Strict TypeScript**: All components and functions typed
- **Prisma Types**: Auto-generated database types
- **NextAuth Extensions**: Custom session/user type definitions in `/src/types/next-auth.d.ts`

### File Organization
- **Feature-based**: Components grouped by functionality
- **API Routes**: Mirror URL structure in `/src/app/api/`
- **Types**: Centralized in `/src/types/` directory
- **Database**: Queries in `/src/lib/db/` directory

### Performance Optimizations
- **Dynamic Imports**: Code splitting for heavy components
- **Image Optimization**: Next.js Image component with S3 integration
- **Caching**: SWR for client-side data fetching with revalidation
- **Server Components**: Leverage RSC for initial data loading

## Key Implementation Details

### Project Evaluation Flow
1. **Setup Phase**: Upload images, define questions, configure parameters
2. **Evaluation Phase**: Participants view images (timed) then score using sliders
3. **Data Collection**: Scores stored with session UUID for anonymous tracking
4. **Analytics**: Real-time metrics dashboard with charts and CSV export

### Security Considerations
- **File Uploads**: Presigned URLs prevent direct server uploads
- **Session Management**: JWT tokens with secure httpOnly cookies
- **Input Validation**: Regex patterns for user input sanitization
- **Route Protection**: Server-side session validation for protected endpoints

### Database Design Philosophy
- **Normalized Relations**: Clean entity separation with proper foreign keys
- **Audit Trails**: CreatedAt/UpdatedAt timestamps on core entities
- **Session Tracking**: Anonymous evaluation sessions without user linking
- **Flexible Scoring**: Float values allow precise evaluation measurements
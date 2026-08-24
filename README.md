# ServiceOps

ServiceOps is a web-based operations management system for laundry and shoe-care businesses. It helps store staff manage orders, customers, service pricing, payment status, and revenue reports.

## Repository structure

```text
service_ops/
|-- frontend/        # Next.js application
|-- backend/         # Node.js and TypeScript API
|-- package.json     # Commands shared from the repository root
|-- .gitignore
`-- README.md
```

The frontend and backend remain independent applications. The root `package.json` provides convenient commands without introducing an additional monorepo framework.

## Tech stack

### Frontend

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS and shadcn/ui
- React Hook Form and Zod
- Supabase client

### Backend

- Node.js 20 or newer
- TypeScript
- Fastify
- Supabase database and authentication integration (planned)

## Requirements

- Node.js 20 or newer
- npm

## Setup

Install the backend dependencies from the repository root, then install the frontend dependencies:

```bash
npm install
npm --prefix frontend install
```

Create the local frontend environment file when a template is available:

```bash
cp frontend/.env.example frontend/.env
```

Environment files are ignored by Git. Files named `.env.example` can be committed as safe configuration templates and must not contain secrets.

## Development commands

Run commands from the repository root:

```bash
# Start the Next.js development server
npm run dev:frontend

# Lint the frontend
npm run lint:frontend

# Build the frontend
npm run build:frontend

# Start the backend development server on http://localhost:3001
npm run dev:backend

# Type-check the backend
npm run typecheck:backend

# Test the backend
npm run test:backend

# Build and start the compiled backend
npm run build:backend
npm run start:backend

# Check frontend formatting
npm run format:check:frontend
```

The backend health endpoint is available at `GET http://localhost:3001/health`.

## Main features

- Fast order creation
- Automatic price calculation based on service type and quantity
- Order and payment status tracking
- Customer and service pricing management
- Daily revenue summaries
- Responsive dashboard for desktop and mobile

## Planned improvements

- Connect the Node.js API to Supabase and move sensitive business operations behind the API
- AI-generated customer messages and Facebook posts
- Public receipt and order pages
- Advanced revenue reports
- Role-based access control
- Customer retention suggestions

## Status

This project is under active development. The frontend is functional, and the Node.js backend foundation is in place.

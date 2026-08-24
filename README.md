# ServiceOps

ServiceOps is a web-based operations management system for laundry and shoe-care businesses. It helps store staff manage orders, customers, service pricing, payment status, and revenue reports.

## Repository structure

```text
service_ops/
|-- frontend/        # Next.js application
|-- backend/         # Backend workspace (Node.js and TypeScript planned)
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

### Backend direction

- Node.js
- TypeScript
- Supabase database and authentication integration

The existing files in `backend/` are a legacy Go prototype. They will be replaced as the Node.js backend is implemented.

## Requirements

- Node.js 20 or newer
- npm
- Go is only required to run the legacy backend prototype

## Setup

Install the frontend dependencies:

```bash
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

# Check frontend formatting
npm run format:check:frontend
```

### Legacy backend prototype

The following commands are temporary and will be replaced during the Node.js migration:

```bash
# Start the legacy Go API on http://localhost:8080
npm run dev:backend

# Build the legacy Go API into backend/bin
npm run build:backend

# Test the legacy Go packages
npm run test:backend
```

The legacy API health endpoint is available at `GET /health`.

## Main features

- Fast order creation
- Automatic price calculation based on service type and quantity
- Order and payment status tracking
- Customer and service pricing management
- Daily revenue summaries
- Responsive dashboard for desktop and mobile

## Planned improvements

- Implement the backend with Node.js and TypeScript, then retire the legacy Go prototype
- AI-generated customer messages and Facebook posts
- Public receipt and order pages
- Advanced revenue reports
- Role-based access control
- Customer retention suggestions

## Status

This project is under active development. The frontend is functional, while the Node.js backend migration has not started yet.

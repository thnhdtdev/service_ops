# ServiceOps

ServiceOps is a web-based operations management system for laundry and shoe-care businesses. It helps store staff manage orders, customers, service pricing, payment status, and revenue reports.

## Repository structure

```text
service_ops/
|-- frontend/        # Next.js application
|-- backend/         # Go API
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

- Go

The Go backend is currently being initialized and does not contain an executable package yet.

## Requirements

- Node.js 20 or newer
- npm
- The Go version declared in `backend/go.mod`

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

# Test all Go packages
npm run test:backend
```

`test:backend` will report that no packages were found until Go source code is added to `backend/`.

## Main features

- Fast order creation
- Automatic price calculation based on service type and quantity
- Order and payment status tracking
- Customer and service pricing management
- Daily revenue summaries
- Responsive dashboard for desktop and mobile

## Planned improvements

- Go API implementation
- AI-generated customer messages and Facebook posts
- Public receipt and order pages
- Advanced revenue reports
- Role-based access control
- Customer retention suggestions

## Status

This project is under active development.

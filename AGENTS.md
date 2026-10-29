# ServiceOps Repository Instructions

## Project overview

ServiceOps is a management system for laundry stores.

The project is currently under development and contains unfinished features.

Main technologies:

- Monorepo (root `package.json` scripts, no extra monorepo framework)
- Backend: Node.js, TypeScript, Fastify, Zod (`backend/`)
- Frontend: Next.js, React, TypeScript (`frontend/`)
- Supabase database
- Supabase authentication

## Working style

The project owner is currently learning backend development with Node.js and TypeScript.

When working on this project:

- Explain changes step by step.
- Explain new TypeScript syntax before using it.
- Prefer simple and understandable code.
- Avoid unnecessary abstractions.
- Do not introduce advanced architecture unless it is clearly needed.
- Do not rewrite working code without explaining the reason.

## Before changing code

Before making any code changes:

1. Read the relevant existing files.
2. Explain how the current code works.
3. Identify the files that need to change.
4. Propose a small implementation plan.
5. Do not make large architectural changes without approval.

## Backend rules (Node.js + TypeScript)

- Follow the existing module layout in `backend/src/modules/<name>/`:
  - `*.routes.ts` for Fastify route handlers
  - `*.service.ts` for business logic and Supabase queries
  - `*.schema.ts` for Zod request validation
- Keep route handlers simple. Do not put complex business logic directly in them.
- Validate request input with Zod.
- Read environment variables only through `backend/src/config/env.ts`.
- Handle errors explicitly. Check the `error` returned by Supabase calls and do not ignore it.
- Always `await` promises or handle them explicitly.
- Avoid `any`. Prefer explicit types.
- Use descriptive file and function names.
- After backend changes, run when possible:
  - `npm run typecheck:backend`
  - `npm run test:backend`

## Authentication and security

- Authentication identifies the current user.
- Authorization determines what the user is allowed to do.
- Do not rely only on frontend permission checks.
- Never expose Supabase service-role keys to the frontend.
- Never commit secrets or `.env` files.
- Authorization should be enforced by the backend and/or Supabase RLS.

## Scope control

- Make small changes.
- Only modify files related to the current task.
- Do not add dependencies without explaining why.
- Do not create features that were not requested.
- Clearly report anything that could not be tested.

## After changing code

After completing a change:

1. Format changed files.
2. Run relevant tests.
3. List changed files.
4. Explain what changed.
5. Mention any remaining issues or unverified behavior.
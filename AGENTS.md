# ServiceOps Repository Instructions

## Project overview

ServiceOps is a management system for laundry stores.

The project is currently under development and contains unfinished features.

Main technologies:

- Monorepo
- Go backend
- Web frontend
- Supabase database
- Supabase authentication

## Working style

The project owner is currently learning Go.

When working on this project:

- Explain changes step by step.
- Explain new Go syntax before using it.
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

## Go backend rules

- Use `gofmt`.
- Handle errors explicitly.
- Do not ignore returned errors.
- Keep HTTP handlers simple.
- Do not put complex business logic directly in HTTP handlers.
- Use descriptive package and function names.
- Run `go test ./...` after backend changes when possible.

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
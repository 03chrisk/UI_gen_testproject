# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UIGen** — an AI-powered React component generator with live preview. Users describe UI components in a chat interface; Claude generates React + Tailwind code that renders in real time via a virtual file system.

The project lives in the `uigen/` subdirectory.

## Commands

Run all commands from `uigen/`:

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests with Vitest
npm run db:reset     # Reset database
```

To run a single test file:
```bash
npx vitest run src/components/chat/__tests__/chat-input.test.tsx
```

## Architecture

### Tech Stack
- **Next.js 15** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS v4**, **Shadcn/ui** (Radix UI primitives)
- **Prisma + SQLite** for persistence
- **Vercel AI SDK** + **Anthropic Claude** for AI generation
- **Vitest + React Testing Library** for tests

### Request Flow

1. User sends a message in the chat UI
2. `POST /api/chat` streams a response via Vercel AI SDK `streamText()`
3. Claude uses two tools to modify the virtual file system:
   - `str_replace_editor` — create/modify file contents
   - `file_manager` — rename/delete files
4. The `FileSystemContext` applies tool results to the in-memory `VirtualFileSystem`
5. `PreviewFrame` compiles the virtual files with Babel standalone and renders them in an iframe via a blob URL

### Key Abstractions

**Virtual File System** ([src/lib/file-system.ts](uigen/src/lib/file-system.ts))
In-memory tree of files. No files are written to disk. Serializes to/from JSON for database persistence.

**ChatContext** ([src/lib/contexts/chat-context.tsx](uigen/src/lib/contexts/chat-context.tsx))
Manages chat messages and coordinates AI API calls.

**FileSystemContext** ([src/lib/contexts/file-system-context.tsx](uigen/src/lib/contexts/file-system-context.tsx))
Manages virtual file system state; exposes file operations to components.

**AI Tools** ([src/lib/tools/](uigen/src/lib/tools/))
Zod-schema-defined tools passed to `streamText()`. Tool results are streamed back and applied to the virtual file system.

**JSX Transformer** ([src/lib/transform/jsx-transformer.ts](uigen/src/lib/transform/jsx-transformer.ts))
Uses `@babel/standalone` to compile TypeScript/JSX on the fly for iframe preview.

**Generation Prompt** ([src/lib/prompts/generation.tsx](uigen/src/lib/prompts/generation.tsx))
System prompt instructing Claude to generate React components. Key constraints: use `@/` import alias, always provide `/App.jsx` as the entry point, style with Tailwind only.

### UI Layout

Three-panel layout in `MainContent`:
- **Left**: Chat interface
- **Right-top**: Live preview iframe
- **Right-bottom**: Monaco code editor + file tree

Panels are resizable via `react-resizable-panels`.

### Auth & Persistence

- JWT auth via `jose`, stored in an HTTP-only cookie (7-day expiry)
- Anonymous use is supported; anonymous work is tracked in `localStorage`
- On each successful AI response, the project (files + messages) is saved to SQLite via Prisma

### Path Alias

`@/*` maps to `./src/*` throughout the codebase.

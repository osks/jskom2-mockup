# jskom2-mockup

A Slack/Discord-inspired web UI for a new [LysKOM](https://www.lysator.liu.se/lyskom/) client. This is a static mockup to explore interaction patterns and page structure before building the real thing.

LysKOM is a Swedish computer conferencing system from the late 1980s, developed at Linköping University. It features threaded discussions organized into conferences, sequential reading flow, and real-time presence. The goal is to bring LysKOM into the modern era with a familiar, real-time-feeling web interface — conferences as channels, threaded conversations, presence indicators — while preserving the unique aspects of LysKOM like sequential reading and comment chains.

## Tech stack

- [SvelteKit](https://svelte.dev/) — framework with file-based routing
- [Tailwind CSS v4](https://tailwindcss.com/) — utility-first styling
- [IBM Plex](https://www.ibm.com/plex/) — Sans for UI, Mono for text bodies
- [Lucide](https://lucide.dev/) — icons
- Static mock data — no backend required

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and click "Logga in" to enter the app.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login screen (mock auth, just click the button) |
| `/read` | Sequential reading view — the core LysKOM experience |
| `/conferences` | Conference list with unread badges, sorted by priority |
| `/conferences/:id` | Conference detail with description and recent texts |
| `/texts/:id` | Single text with full threaded comment tree |
| `/compose` | Write a new text or comment (`?commentTo=100` to pre-fill) |
| `/who` | Who is online — active sessions and what they're doing |
| `/users/:id` | User profile, memberships, and text count |
| `/search` | Search across texts, conferences, and users |

## Mock data

The mockup includes realistic Swedish-language data:

- **8 users** — from power users to lurkers to a brand new member
- **5 conferences** — Allmänt, Programmering, LysKOM-utveckling, Musik och Film, Systemadministration
- **20 texts** — organized into 4 threaded conversations plus standalone posts
- **4 online sessions** — using different clients (jskom2, lyskom.el, TkKOM)

All texts have proper `commentTo`/`commentedIn` cross-links forming realistic comment trees up to 3 levels deep.

## Key LysKOM concepts in the UI

- **Sequential reading** (`/read`): Conferences are visited in priority order. Within each conference, texts are read sequentially, following comment chains depth-first before continuing to the next root text.
- **Conferences**: Like forums. Users are members with a priority (0–255) that determines reading order. Unread counts are tracked per-conference.
- **Texts**: The basic content unit. Each has a subject, body, author, recipients (conferences), and optional comment references to other texts.
- **Comment threads** (`/texts/:id`): Unlike the classic Emacs client, the web mockup can display full comment trees with visual nesting — this is where a web client adds the most value.

## Deployment

The project builds as a fully static SPA using `@sveltejs/adapter-static`.

```bash
npm run build    # outputs to build/
npm run preview  # preview the production build
```

A GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys to GitHub Pages on push to `main`. To enable:

1. Go to **Settings > Pages** in the repository
2. Set source to **GitHub Actions**

## Project structure

```
src/
├── lib/
│   ├── types.ts                  # TypeScript interfaces (Person, Conference, TextInfo, etc.)
│   ├── data/                     # Static mock data + lookup helpers
│   ├── stores/                   # Svelte stores (auth, reading state, messages)
│   └── components/               # Reusable UI components
│       ├── TextCard.svelte       # Core text display (full + compact modes)
│       ├── TextThread.svelte     # Recursive threaded comment view
│       ├── ReadingPrompt.svelte  # "Next text" / "Next conference" navigation bar
│       ├── ComposeForm.svelte    # Text/comment composition form
│       ├── AppShell.svelte       # Layout wrapper (sidebar + content)
│       └── ...
└── routes/                       # SvelteKit file-based routing (one dir per page)
```

## Background

This is a UI exploration for a new LysKOM web client, inspired by the UI patterns of Slack and Discord — sidebar with channels/conferences, threaded messages, presence, and real-time feel. It aims to succeed [jskom](https://github.com/osks/jskom), the existing web-based LysKOM client.

The mockup uses static data to allow rapid iteration on layout, navigation, and interaction patterns without needing a running LysKOM server or the jskom Python backend. Domain knowledge about LysKOM concepts and display conventions comes from the [LysKOM Emacs client](https://github.com/johan/lyskom-elisp-client) (lyskom.el).

# thatblog — Plan

A serverless blogging platform on AWS. One deployment hosts **many blogs** in a single multi-tenant stack — every blog
isolated logically by a `blogId` partition dimension across DynamoDB and S3, not by separate stacks. Deployed with AWS
SAM. Optimised for a great editing experience across short-form (microblog) and long-form (essay/article) content, with
an installable theme system. The same codebase serves a **self-hosted edition** (deploy your own stack, one or a handful
of blogs) and a **hosted edition** (many paying blogs on one fleet).

---

## 1. Goals

- **Serverless & self-hostable.** A dev deploys the whole thing into their own AWS account with a single script. No
  cross-account anything.
- **One stack = many blogs (multi-tenant).** A single SAM stack hosts any number of blogs in a shared DynamoDB table and
  S3 content bucket, isolated by a `blogId` partition dimension. Self-hosted runs the same stack with one blog (or a
  few); the hosted edition packs many paying blogs per stack.
- **Great editing experience** for both short-form and long-form content.
- **Installable themes** authored in Liquid, with a local authoring kit ("theme-kit").
- **Cheap at rest.** Serverless primitives (Lambda, DynamoDB on-demand, S3, SQS) so an idle blog costs approximately
  nothing.

## 2. Non-goals (v1)

These are explicitly out of scope for the first version. Noted so we don't design ourselves into a corner, but not built
yet:

- **Newsletter / subscribers** — possible follow-on. No `Subscriber` entity in v1.
- **Replies / comments** — fast-follow, tied to a future **ActivityPub** direction (replies get hosted at that point).
  No `Reply` entity in v1.
- **Custom SSL via Let's Encrypt / ACME** — when we add custom domains we'll use **ACM** (free, auto-renewing, no worker
  cert logic). The "Let's Encrypt" label in the designs is flavour text.

## Roadmap (versions & milestones)

Two tracks. **`0.0.x`** MVP increments build to **`0.1`** (the spine works end-to-end); **`0.1.x`** feature increments
build to **`1.0`** (the feature-complete self-hosted release). Anything past `1.0` lives in section 15. "v1" elsewhere
in this doc means `1.0`. Each increment leaves the codebase in a working, deployable state. Multi-tenant plumbing
(`blogId` in keys, `BlogDomain`, `MapBlogUser`) lands from `0.0.x` — it's structural — but isn't exercised with many
blogs until late `0.1.x`.

**MVP — `0.0.x` → `0.1`** (deploy → setup → write a short post → see it live)

| Ver     | Increment        | Working state                                                                                                                                       |
| ------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.0.1   | Foundation       | Bun-workspace monorepo + SAM (table w/ full key/index topology, content bucket, HTTP API, health Lambda) + deploy script → `sam deploy`, health 200 |
| 0.0.2   | Models + harness | ElectroDB `System`/`Blog`/`BlogDomain`/`User`/`MapBlogUser`/`UserSession` + Vitest/Testcontainers → green unit tests                                |
| 0.0.3   | Setup + auth     | Setup-key first-run (`/admin/setup/{key}` → first `User`+`Blog`+`BlogDomain`), email/password login, signed-cookie sessions → log in via API        |
| 0.0.4   | Posts (backend)  | `Post` + `ContentBlock` + `backend-api` authoring (short post create/edit/publish) → create a post via API                                          |
| 0.0.5   | Public site      | `frontend-site`: `Host`→blog, timeline + post detail via one shipped theme (renderer + S3 loader) → visit blog, see post                            |
| 0.0.6   | Admin SPA        | Minimal React SPA under `/admin` (HTTP-proxy→S3): login + short composer + publish → write from the browser                                         |
| **0.1** | **MVP**          | Full loop works: deploy → setup → log in → compose a short post → see it live on the themed public site                                             |

**First release — `0.1.x` → `1.0`** (fill out the section 14 feature surface)

| Ver     | Increment              | Adds                                                                                                                                    |
| ------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.1   | Long-form              | `article` type + richer block palette (headings, blockquote, hero); rich post detail                                                    |
| 0.1.2   | Media                  | `Media` entity, S3 uploads (`uploads/{blogId}/…`), media library (upload, folders, quota), `MEDIA` block, orphan tracking               |
| 0.1.3   | Pages                  | `Page` entity + admin Pages (slug, status), drag-to-reorder nav, public page rendering                                                  |
| 0.1.4   | Worker + cron          | worker Lambda + SQS + DLQ + EventBridge Scheduler; scheduled publishing; RSS gen/caching                                                |
| 0.1.5   | Stats                  | `Counter` + view rollups (per-post + weekly); dashboard stats; orphaned-media sweep                                                     |
| 0.1.6   | Themes system          | `Theme` entity; install/activate/configure/upload; `themes/_catalog/` → per-blog; Settings › Themes                                     |
| 0.1.7   | Settings + polish      | full Settings (Profile, Blog, Domains, Publishing, Integrations); pinned, hashtags, read-time badges; subscribe/RSS on site             |
| 0.1.8   | theme-kit + multi-blog | publish `packages/renderer` theme-kit (fixtures + dev harness); exercise many blogs/stack + `POST /blogs`; Playwright integration tests |
| **1.0** | **First release**      | section 14 feature surface complete; self-hosted edition shippable                                                                      |

---

## 3. Decisions log

| #   | Decision                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | A **SAM stack is multi-tenant**: one shared DynamoDB table + one shared S3 content bucket host **many blogs**, isolated by a `blogId` partition dimension. Self-hosted = same stack, one (or few) blogs; hosted = many blogs per stack. Dev still uses PR-environment stacks.                                            |
| 2   | The front door is an **HTTP API** (API Gateway): app routes via Lambda proxy, `/admin/*` static assets via an S3 proxy (see #17). **CloudFront** is an optional add-on.                                                                                                                                                  |
| 3   | Cron is **EventBridge Scheduler → SQS → worker**; the worker can enqueue further SQS jobs (fan-out cascade).                                                                                                                                                                                                             |
| 4   | **AWS SAM** for infrastructure. The stack creates & owns the content bucket.                                                                                                                                                                                                                                             |
| 5   | Build with **Bun**, transpile to JS targeting the **`nodejs24.x`** Lambda runtime.                                                                                                                                                                                                                                       |
| 6   | Monorepo via **Bun workspaces** across `components/`, `packages/`, `themes/`.                                                                                                                                                                                                                                            |
| 7   | **Two buckets:** a SAM-managed artifact bucket (Lambda zips, account-shared, invisible) + a per-stack content bucket (`themes/` `uploads/`, owned by the stack, deleted with it).                                                                                                                                        |
| 8   | Components are **private `@thatblog/*` packages** that cross-import freely (all Lambdas share one IAM permission set).                                                                                                                                                                                                   |
| 9   | **`Post` and `Page` are the two top-level entities**, sharing one hand-rolled block model (`ContentBlock`). A `Post` carries `type` (`short \| article`); a `Page` is a standalone, nav-attached document (no `type`). "Content" names the body (blocks + the `content` object), never a top-level entity.               |
| 10  | Renderer = **LiquidJS** with a pluggable `fs` loader (S3 in prod, local FS in theme-kit).                                                                                                                                                                                                                                |
| 11  | Unit tests: **Vitest** + **Testcontainers** (local DynamoDB), files named `<name>.spec.ts`.                                                                                                                                                                                                                              |
| 12  | **`blogId` is in the `pk` of every tenant-scoped entity** (Blog, BlogDomain, MapBlogUser, Post, Page, ContentBlock, Media, Theme, Counter). Exceptions: **`System`** (stack-wide singleton) and **`User` / `UserSession`** (keyed by the global user, which spans blogs — a many-to-many map needs a global user).       |
| 13  | **`User` is a global identity** within a stack (credentials, email login); a **`MapBlogUser`** join relates users ⇄ blogs with a per-blog role. Replaces the blog-local `Author`. Powers "my blogs" and "a blog's team", and decouples authN (`User`) from authZ (membership).                                           |
| 14  | **S3 content is blogId-prefixed:** `themes/{blogId}/{themeId}/…` and `uploads/{blogId}/YYYY/MM-DD/{mediaId}.ext`. Per-blog prefixes = logical isolation + easy per-blog lifecycle/delete.                                                                                                                                |
| 15  | **Public routing is by `Host` → `blogId`.** The frontend resolves the incoming hostname via the **`BlogDomain`** entity (GSI `DOMAINS#{host}` → blog; one item per domain, so a blog holds a primary + custom/alias domains). Admin resolves its blog the same way, with a future central multi-blog admin.              |
| 16  | **ID formats:** `blogId` is a **`b`-prefixed nanoid** (e.g. `bV1StGXR8Z`); `postId` / `pageId` are **ULIDs** (lexicographically sortable by creation time); `contentId` (block `sk`) is an opaque unique id.                                                                                                             |
| 17  | **Static/admin serving.** Front door is an **HTTP API** (not REST). App routes use Lambda proxy integration; `/admin/*` uses an **HTTP-proxy integration straight to S3** (no Lambda in the asset path). CloudFront (future) can front both.                                                                             |
| 18  | **First-run setup key.** The `System` item holds a generated **`setupKey`**; first-run setup runs at **`/admin/setup/{setupKey}`** (create the first `User` + `Blog` + primary `BlogDomain` + seed the default theme), after which the key is **cleared**, permanently disabling the route. No open registration window. |

---

## 4. Architecture

```
                        ┌────────────────────────────────────────────────┐
                        │                 AWS account                    │
                        │           (one stack, many blogs)              │
                        │                                                │
   visitor ───────────▶ │  API Gateway ──┬──▶ frontend-site (Lambda)     │
                        │                │      Hono SSR + LiquidJS      │
   admin  ────/admin──▶ │                ├──▶ backend-api (Lambda)       │
                        │                │      Hono JSON API            │
                        │                └──▶ /admin ──▶ SPA (S3 assets) │
                        │                                                │
   EventBridge ─cron──▶ │  SQS ──────────────▶ thatblog-worker (Lambda)  │
   Scheduler            │   ▲                     │                      │
                        │   └──── enqueue ────────┘  (fan-out cascade)   │
                        │                                                │
                        │  DynamoDB (single table, ElectroDB)            │
                        │  S3 content bucket:  themes/  uploads/         │
                        └────────────────────────────────────────────────┘

   SAM-managed artifact bucket (account-shared) holds the Lambda code zips.
```

- **DynamoDB** — one shared table per stack, one-table multi-tenant design via ElectroDB; every tenant-scoped item
  carries `blogId` in its `pk`.
- **S3 content bucket** — created & owned by the stack; holds `themes/{blogId}/` and `uploads/{blogId}/`. Per-blog
  prefixes give logical isolation and easy per-blog delete.
- **SAM-managed artifact bucket** — account-level, holds Lambda code zips. Handled transparently by
  `sam deploy --resolve-s3`; not something we manage.
- **API Gateway** — single HTTP front door, Lambda proxy integration.
- **SQS** — buffers cron jobs, gives retries + DLQ.
- **EventBridge Scheduler** — the actual cron; drops payloads onto SQS.
- **Lambdas** — `backend-api`, `frontend-site`, `thatblog-worker`.

## 5. Repository layout

```
components/
  backend-api/          @thatblog/backend-api
    models/               ElectroDB entities (single-table)
    loaders/              DataLoader setup fns (take models as args)
    lambda.ts             Hono app + Lambda adapter
  backend-worker/       @thatblog/backend-worker
    lambda.ts             SQS consumer; cron job handlers
  frontend-admin/       @thatblog/frontend-admin
    <React + Vite SPA>    synced to S3, served under /admin
  frontend-site/        @thatblog/frontend-site
    pages/                route handlers
    lambda.ts             Hono SSR + LiquidJS renderer
packages/
  renderer/             @thatblog/renderer  (LiquidJS + pluggable fs loader; basis of theme-kit)
  <other shared>
themes/
  <initial themes>        Liquid templates (first: Twitter-like microblog)
integration-tests/        (later)
  backend/                Vitest
  frontend/               Playwright + Vitest
infra/                    SAM template(s) + deploy script
docs/
  PLAN.md
  architecture.png
```

Bun workspaces span `components/`, `packages/`, and `themes/`.

## 6. Components & workspaces

- Every component is a **private `@thatblog/*` package**, never published.
- Components **cross-import directly**, e.g. `frontend-site` may
  `import { Post } from '@thatblog/backend-api/models/post'`. This is deliberate: all Lambdas run with the **same IAM
  permission set**, so there's no security boundary between them to respect — sharing code is free.
- `packages/renderer` is the one piece intended to be genuinely standalone (it's the core of the theme-kit), so keep its
  dependencies minimal and its interface clean.

## 7. Dependencies

| Dependency         | Location                       | Purpose                                                                     |
| ------------------ | ------------------------------ | --------------------------------------------------------------------------- |
| **ElectroDB**      | `backend-api/models`           | Single-table DynamoDB modelling                                             |
| **DataLoader**     | `backend-api/loaders`          | Batch/dedupe DB reads; setup fns take models as args                        |
| **Hono**           | `backend-api`, `frontend-site` | Routing + AWS Lambda adapter                                                |
| **LiquidJS**       | `packages/renderer`            | Theme rendering (Liquid is the theme-ecosystem lingua franca)               |
| **React + Vite**   | `frontend-admin`               | Admin SPA                                                                   |
| **Zod v4**         | `backend-api`, content blocks  | Discriminated-union validation for content blocks + API endpoint validation |
| **bcryptjs**       | `backend-api`                  | Password hashing for email/password auth (pure JS — no native build)        |
| **Vitest**         | all                            | Unit tests (`<name>.spec.ts`)                                               |
| **Testcontainers** | test setup                     | Local DynamoDB for fast unit tests                                          |
| **Playwright**     | `integration-tests`            | Integration tests (later)                                                   |

## 8. Data model (ElectroDB, single table)

v1 entities:

| Entity          | Managed by      | Notes                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `System`        | ElectroDB       | **Stack-wide singleton** `pk=SYSTEM` / `sk=SYSTEM` (no `blogId`). Session signing secrets (list, for rotation) + a one-time **`setupKey`** (see #18); encrypted at rest, IAM-gated                                                                                                                                                                                       |
| `Blog`          | ElectroDB       | The **tenant root**, one per blog: `pk: BLOGS#{blogId}`. Config: profile, publishing, active theme, navigation order, integrations, plan/entitlements. Domains live in `BlogDomain`, not inline                                                                                                                                                                          |
| `BlogDomain`    | ElectroDB       | One item **per domain** a blog answers to: `pk: BLOGS#{blogId}` / `sk: DOMAINS#{host}` (lists a blog's domains). `host`, `type` (`primary \| alias` — an alias 301s to primary), plus custom-domain state (`status: pending \| active`, `acmCertArn?`, `verifiedAt?`). GSI `DOMAINS#{host}` (**unique**) → blog is the public-routing lookup                             |
| `User`          | ElectroDB       | **Global identity** within the stack (spans blogs, **no `blogId`**): `pk: USERS#{userId}`. `email`, `passwordHash` (bcryptjs), `displayName`. Looked up by email via GSI. Credentials only — role lives on `MapBlogUser`                                                                                                                                                 |
| `MapBlogUser`   | ElectroDB       | **User ⇄ Blog join** carrying the per-blog `role` (and optional per-blog display name/bio). Bidirectional: `pk: BLOGS#{blogId}` / `sk: USERS#{userId}` lists a blog's team; GSI `USERS#{userId}` → `BLOGS#{blogId}` lists "my blogs". Replaces `Author`                                                                                                                  |
| `UserSession`   | ElectroDB       | `pk: USERS#{userId}` / `sk: SESSIONS#{sessionId}` (global user, **no `blogId`** — a session spans all the user's blogs), `expiresAt` (DynamoDB TTL). Referenced by the signed session cookie                                                                                                                                                                             |
| `Post` / `Page` | ElectroDB       | `pk: BLOGS#{blogId}#…`. Top-level metadata: `type: short \| article` (`Page` has none — it's nav-attached), slug, status (`draft \| scheduled \| published`), publishedAt, `scheduledAt?` (set when `status: scheduled`; drives the publish cron), tags[], pinned, plus a `content` object (`values: string[]` ordered contentIds, `excerpt?: string`) — see section 8.2 |
| `ContentBlock`  | **hand-rolled** | The post/page body, discriminated-union blocks, partitioned under the blog (see section 8.2)                                                                                                                                                                                                                                                                             |
| `Media`         | ElectroDB       | `pk: BLOGS#{blogId}#…`. key, filename, contentType, size, folder, `references[]` (drives in-use vs orphaned), dimensions. S3 at `uploads/{blogId}/…`                                                                                                                                                                                                                     |
| `Theme`         | ElectroDB       | `pk: BLOGS#{blogId}#…`. Metadata + config; template files live in S3 `themes/{blogId}/{themeId}/`                                                                                                                                                                                                                                                                        |
| `Counter`       | ElectroDB       | `pk: BLOGS#{blogId}#…`. View/stat rollups (per-post + weekly "views this week"), written by the worker                                                                                                                                                                                                                                                                   |

The table is **hybrid**: ElectroDB-managed items and hand-rolled block items coexist. ElectroDB's key namespacing must
stay distinct from the hand-rolled `BLOGS#{blogId}#POSTS#…` / `…#PAGES#…` block prefixes.

### 8.1 Physical table schema

Single table, one-table design. Fixed key/index topology:

| Field             | Role                                                         |
| ----------------- | ------------------------------------------------------------ |
| `pk`              | Table partition key (ElectroDB-composed)                     |
| `sk`              | Table sort key (ElectroDB-composed)                          |
| `ls1sk` … `ls5sk` | 5 Local Secondary Indexes — share `pk`, alternate sort keys  |
| `gs1pk` / `gs1sk` | Global Secondary Index #1 — independent partition + sort key |

Rules:

- **ElectroDB composes and owns `pk`/`sk`** (with per-entity namespacing) and does **not** expose them on returned
  models — models return their own attributes, never the raw key fields.
- Each entity declares only the indexes it uses. LSI = a secondary index whose `pk.field` is the same `pk` as the
  primary with a distinct `sk.field` (`ls1sk`…); GSI = `pk.field: gs1pk`, `sk.field: gs1sk`, `index: gs1`. Entities that
  need no LSI/GSI leave those columns empty.
- **LSIs are fixed at table creation** and cannot be added/removed later, so the SAM template must define **all 5**
  (`ls1sk`–`ls5sk`) up front, even if unused in v1. (Tables with LSIs cap each item collection at 10 GB per `pk` —
  irrelevant at per-blog scale.)
- **GSIs can be added later** via online backfill. v1 defines **`gs1`**, **multiplexed** across entities (distinct
  `gs1pk` prefixes) for the cross-partition lookups multi-tenancy needs: `EMAILS#{email}` → `User` (login),
  `USERS#{userId}` → `MapBlogUser` ("my blogs"), `DOMAINS#{host}` → `BlogDomain` (public routing; the host is unique
  across the GSI). Add `gs2`+ only if a new pattern demands it.
- **Index projection is `KEYS_ONLY`** on every LSI/GSI, to keep indexes lean (minimal storage + write amplification).
  Implications:
  - **GSI (`gs1`) queries return key fields only.** ElectroDB does not auto-hydrate — the read shape is **query `gs1` →
    collect keys → `BatchGetItem` the base table**. Route this hydration through a **DataLoader** so N index hits
    collapse into one batched round-trip.
  - **LSI queries** can still request non-projected attributes; DynamoDB auto-fetches them from the base table at extra
    RCU (no second round-trip). So LSIs cost RCU where GSIs cost a hydration call.

### 8.2 Content blocks (hand-rolled)

A post/page body is **not** a single item — it's a set of individually-addressable **content blocks**, each its own
DynamoDB item sharing a partition. Deliberately **not** ElectroDB: raw `pk`/`sk` access keeps blocks flexible and lets
new block types be added without schema changes.

```
pk:    BLOGS#{blogId}#POSTS#{postId}#CONTENTS   # one query returns all blocks for the post, in sk order
sk:    {contentId}                              # opaque unique id (ULID/nanoid)
type:  PLAIN_TEXT                     # discriminated union tag
value: Hello world
```

- **Discriminated union on `type`**, validated with **Zod v4**. Examples:
  - `PLAIN_TEXT` → `{ value }`
  - `MEDIA` → `{ values: [...images/videos], layout: grid-2x2, ... }`
  - `LINK` → `{ href, title, ... }`
  - …open-ended; the block type controls the structure, and the Liquid renderer renders per `type`.
- **Efficiency:** cheap to append a block, one read hydrates a whole body, and the block palette grows by adding union
  members. Maps directly onto the admin composer and per-block theme rendering.

**Ordering & excerpt (live on the parent, not the block):** the `Post`/`Page` entity carries a `content` object:

- `values: string[]` — ordered list of contentIds. **Order is the array order**, so reordering is a single write to the
  parent (no per-block position keys). `contentId` (the block `sk`) is therefore just an **opaque unique id**
  (ULID/nanoid).
- `excerpt?: string` — a contentId marking where the excerpt ends. List/timeline endpoints hydrate the `Post` + only the
  blocks **up to this boundary**, never the full body — so a long post still lists cheaply (metadata + a small
  `BatchGet`). The full body loads only on the post page.

**Pages reuse the same block model** via `pk: BLOGS#{blogId}#PAGES#{pageId}#CONTENTS`, with their own `content` object.

## 9. Rendering & themes

- **One renderer, swappable loaders.** `packages/renderer` wraps LiquidJS and abstracts the template source behind
  LiquidJS's pluggable `fs` interface (`readFile` / `exists` / `resolve` / …):
  - **Prod (Lambda):** S3-backed loader, fetching partials on demand with in-memory caching keyed to the warm Lambda
    container (LiquidJS's built-in template cache does the heavy lifting — partials fetch from S3 once per container,
    then serve from memory).
  - **theme-kit (local authoring):** filesystem loader + sample blog data + a watch/dev server.
- Same render path in both, so "works in theme-kit" implies "works in prod".
- **theme-kit** = `packages/renderer` + sample blog-data fixtures + local dev harness, published as a kit for people
  building themes (they can use the samples or their own data).
- **First theme:** a Twitter-like microblog theme (profile header + cover, timeline, pinned posts, short + essay post
  types, hashtags, post detail with hero image / headings / blockquotes).

## 10. Compute detail

- **backend-api** — Hono JSON API, ElectroDB models + DataLoader loaders. Powers the admin SPA and any dynamic site
  data.
- **frontend-site** — Hono SSR rendering the active theme via `@thatblog/renderer`. **Resolves the blog from the
  incoming `Host`** (domain → `blogId` via `BlogDomain`), then serves that blog's public pages (timeline, posts, pages,
  RSS).
- **frontend-admin** — React + Vite SPA, a **single global build** serving every blog. Static assets synced once to the
  content bucket and served under **`/admin`** via an **HTTP-API HTTP-proxy integration straight to S3** (no Lambda in
  the asset path); `/admin/*` returns `index.html` (client-side routing), hashed assets served directly. The SPA scopes
  to a blog by the admin domain today; a central multi-blog picker is a future add.
- **thatblog-worker** — SQS consumer running cron jobs.

## 10.1 Authentication

- **v1: email + password.** Passwords hashed with **bcryptjs**. `backend-api` exposes login; the admin SPA authenticates
  against it.
- **Sessions (no JWTs).** A `UserSession` entity in DynamoDB keyed `USERS#{userId}#SESSIONS#{sessionId}`, with an
  `expiresAt` **DynamoDB TTL**. A **signed cookie** (HMAC) carries `userId`/`sessionId`; httpOnly, Secure, SameSite.
  **3-day expiry**, matched by the TTL so records self-clean. A session belongs to the **global user** and spans all
  their blogs. Per request: verify signature → build key → look up session → check TTL → **resolve the target `blogId`**
  (from `Host` on the public site, from route/context in admin) → **check the user's `MapBlogUser` role for that blog**.
  Revocable (delete the item).
- **Cookie signing secret:** stored in the singleton **`System`** item (`pk=SYSTEM`/`sk=SYSTEM`, stack-wide across all
  blogs) as a **list of secrets** — sign with the newest, verify against all valid, so rotation is add-new / retire-old
  with no forced logouts. Bootstrapped with a generated secret on first deploy; encrypted at rest by DynamoDB, access
  gated by the shared Lambda IAM role. (Rotation can become a worker cron.)
- **First-run setup.** On first deploy the `System` item is seeded with a generated **`setupKey`**. Setup completes at
  **`/admin/setup/{setupKey}`** — creating the first `User` (owner), first `Blog`, its primary `BlogDomain`, and a
  default theme — after which the key is **cleared**, permanently disabling the route. No open registration window.
- **Future:** social logins via a centralised auth service, and a programmatic API — see section 15.

## 11. Cron / worker jobs

Driven by **EventBridge Scheduler → SQS → worker**, with the worker able to enqueue follow-on SQS jobs (fan-out
cascade). v1 jobs:

- Publish **scheduled** `Post` / `Page` at its `scheduledAt`.
- Roll up **view counters** (per-post + weekly).
- Sweep **orphaned media** (media with no `references[]`).
- Regenerate / cache the **RSS feed**.

## 12. Build & deploy

Bun builds and transpiles to Node; SAM packages and deploys; a final sync pushes assets.

```bash
# 1. Build each Lambda to a single index.js (+ sourcemap), targeting Node 24
bun build ./components/backend-api/lambda.ts   --target=node --outdir=...
bun build ./components/frontend-site/lambda.ts --target=node --outdir=...
bun build ./components/backend-worker/lambda.ts --target=node --outdir=...
# build the admin SPA
bun run --cwd components/frontend-admin build

# 2. Package + deploy infra (SAM uploads code to its managed bucket, rewrites CodeUri, deploys)
sam build
sam deploy --stack-name <blog> --resolve-s3

# 3. Sync global static assets to the stack-owned content bucket (name read from a stack Output):
#    - the admin SPA (one build serves every blog)
#    - the theme catalog (install source; copied into a blog's prefix on install)
aws s3 sync ./dist/admin/  "s3://$(... AssetsBucket output ...)/admin/"
aws s3 sync ./themes/      "s3://$(... AssetsBucket output ...)/themes/_catalog/"
# Per-blog theme files (themes/{blogId}/…) and uploads/{blogId}/… are written at runtime — blog
# creation seeds a default theme, theme install copies from _catalog — never at deploy.
```

- The SAM template defines the **content bucket** and **exports its name as an Output**; the deploy script reads that
  Output and syncs to it.
- The chicken-and-egg (CloudFormation needs the Lambda zip in S3 before it creates the bucket) is solved by SAM's
  managed artifact bucket — the content bucket never needs to hold code.
- Target runtime: **`nodejs24.x`**.

## 13. Testing

- **Unit:** Vitest, files `<name>.spec.ts`, run against a **local DynamoDB via Testcontainers** for fast, realistic
  model/loader tests. (Testcontainers setup: James to help wire.)
- **Integration (later):** `integration-tests/backend` (Vitest) and `integration-tests/frontend` (Playwright + Vitest).

## 14. Feature surface (from designs)

**Public site** — author profile (avatar, cover, bio, location, website, joined, post count), subscribe + RSS, timeline,
pinned posts, hashtags, per-post read-time/type badges, rich post detail.

**Admin** — Dashboard (stats: posts / drafts / scheduled / views-this-week; inline short composer, 300-char limit),
Posts, Pages (slug, status, drag-to-reorder nav), Media (quota, in-use/orphaned filters, folders, upload), Themes
(installable, activate / configure / upload), Settings (Profile, Blog, **Domains**, Publishing, Integrations). The
**Domains** screen manages the blog's `BlogDomain` items: add a custom domain (shows DNS/ACM verification `status`), set
which host is `primary` vs an `alias` (aliases 301 to primary), and remove a domain.

## 15. Future milestones (post-v1)

- **Hosted edition** — signup, Stripe billing, and plan entitlements pushed onto the `Blog` item, plus a central
  multi-blog admin (picker + SSO). Blog creation is already an **in-stack runtime op** (write `Blog` + owner
  `MapBlogUser` + primary `BlogDomain` + seed a default theme from `themes/_catalog/`), so hosting adds billing and a
  picker — **not** per-blog infrastructure provisioning.
- **Custom domains** via API Gateway custom domain + **ACM**, tracked per host on **`BlogDomain`** (verification
  `status` + `acmCertArn`); the `DOMAINS#{host}` GSI already resolves them at request time.
- **Replies / comments**, hosted alongside an **ActivityPub** integration.
- **Newsletter** / subscribers.
- **Social logins** via a centralised auth service (v1 is email/password only).
- **API support** — a programmatic API (tokens) for third-party/automation access.
- **CloudFront** as an optional caching/CDN layer in front of API Gateway.

---

## Open actions

- [ ] Wire Testcontainers + local DynamoDB for unit tests (with James).
- [ ] Detail the SAM template resources (single table + all 5 LSIs + `gs1`, content bucket, SQS + DLQ, EventBridge
      Scheduler, Lambda functions, the HTTP API with Lambda-proxy routes + the `/admin/*` S3 proxy, stack outputs).

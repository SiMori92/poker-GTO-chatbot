# GTO Poker Trainer — work in progress

This app is not a finished trainer. The local calculation tools and knowledge viewer work; hand analysis, batch processing, a general retrieval engine and cloud storage for hands/runs have not been implemented. The existing retrieval adapter only covers the registered preflop lone-open frequency table. Publishing a Bible release does not automatically add support for new nodes or prove its contents suitable for advice.

## Local setup

Install Node.js 22 or later and pnpm 10.20.0. From this directory run:

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

By default `BIBLE_DIR=../../GTO Bible`, relative to this directory. Point it to the actual local folder containing `BIBLE-INDEX.md`; it and its library are read-only. Without an Anthropic key the local tools remain available. The app creates local temporary data under `data/`. Do not commit `.env.local`, `data/`, hand histories or your Bible source files to a public repository.

## Vercel setup

1. Import the GitHub repository into Vercel. Set the project **Root Directory** to `app` and select Next.js. Use Node 22 or newer. The build command is `pnpm build`.
2. Create or connect a Neon PostgreSQL database through the Vercel Marketplace, or add its connection string manually as the server-only `DATABASE_URL` environment variable. Use separate databases or branches for preview and production. Do not expose the connection string to the browser or commit it.
3. Set `APP_PASSWORD` for each deployed environment to an independently generated random password of at least 8 characters. For example, generate one with `openssl rand -base64 36`. Save it in your password manager and Vercel environment settings; never commit it. The login username is `trainer`. Vercel deployments fail closed with HTTP 503 if the password is missing or too short. Rotate it by changing the environment variable and redeploying.
4. Set `NEXT_TELEMETRY_DISABLED=1`. `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` are not currently used for model calls because that feature is unfinished. If you add the key later, it belongs in Vercel server environment variables, never in client code.
5. Use Vercel Deployment Protection for production as an additional access layer when your plan supports it. Vercel's standard Hobby protection does not protect the production domain. The app's password check is a basic single-user gate; configure platform-level rate limiting and monitoring before exposing sensitive information.
6. Deploy the commit containing these changes. An empty database is expected to show a knowledge-unavailable state until the first release is published. Check the home page and `/api/knowledge` in a private browser session: without credentials they must ask for a password; with credentials, knowledge must remain unavailable until publication.

The original local-only network rule and JSON-file persistence do not apply to this hosted design: the server reads Neon. The current app does **not** store hands, screenshots, batches or runs in Neon; those features are unfinished and must not be assumed durable.

## Publish or update the Bible reference

Do this from your computer, not a hosted route. You need the Neon `DATABASE_URL` for the **target environment**. Never share or commit it. Use `vercel env pull .env.local` for a linked project's Development environment, or set the target environment's connection string explicitly; alternatively set `DATABASE_URL` and `BIBLE_DIR` in your shell or `.env.local`. The connection role needs permission to create the knowledge tables and read/write their rows. Confirm the database and environment before running commands.

1. Run `pnpm knowledge:init` once against the target Neon database to create the two knowledge tables. This command does not delete existing data.
2. Complete the existing Bible amendment and approval process locally. Update `BIBLE-INDEX.md` to name the current version and register current capture-derived library documents in `library/INDEX.md`. Do not edit released Bible versions or use hand records as clause evidence.
3. From `app`, run `pnpm test` and review changes to the Bible and library. Update the ingestion tests if the ratified Bible version or coverage intentionally changes; tests currently assert the v8 fixture. Passing tests checks structure, not the poker accuracy of a new clause.
4. Run `pnpm knowledge:publish`. The command reads the local Bible and registered `.docx` files, validates and builds an index, stores the release by content hash, switches the active version in a PostgreSQL transaction, and reads it back. Keep both the printed **previous release** and newly activated release hashes in your change record.
5. Open the hosted app's **Knowledge** page after authenticating and check the Bible version, clause count, registered documents and boundaries. Then check the relevant node coverage in code and tests before relying on any new evidence. The publisher indexes the Bible and text/table sections; it does not upload the original `.docx` files or the source folder.

The active pointer and release rows are private and must not be edited manually. Concurrent publications are serialized by PostgreSQL; the last completed activation becomes active, so coordinate publishers. To roll back to a previously printed release hash, run:

```sh
pnpm knowledge:activate <previous-release-sha256>
```

The command validates the stored release before switching the pointer and verifies the resulting active version. Rollback changes the hosted index only; it does not modify the Bible or its governing registry. Reconcile that choice with the Bible's amendment process before using the older version for advice.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The knowledge tests use the local Bible and real hand-history files outside this repository. They require those fixtures at the paths used in `tests/`; a standalone GitHub clone or Vercel build does not contain them. Tests use an in-memory knowledge-store implementation and do not require Neon credentials; a real Neon initialization, publication, rollback and deployed authentication check must be verified in your own projects. No screenshot or file storage has been implemented; choose a private object store when that feature is built.

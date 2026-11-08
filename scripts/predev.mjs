import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { z } from 'zod';
import { resolve } from 'node:path';
const envPath = resolve('.env.local');
if (existsSync(envPath)) for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) { const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/); if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); }
const env = z.object({ ANTHROPIC_API_KEY: z.string().optional(), ANTHROPIC_MODEL: z.string().min(1).default('claude-sonnet-5-5'), BIBLE_DIR: z.string().min(1).default('../GTO Bible'), BATCH_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(3), BATCH_MAX_CALLS: z.coerce.number().int().min(1).default(100) }).safeParse(process.env);
if (!env.success) { console.error('Invalid environment:', z.prettifyError(env.error)); process.exit(1); }
for (const dir of ['uploads', 'runs', 'batches', 'knowledge']) mkdirSync(resolve('data', dir), { recursive: true });
if (!env.data.ANTHROPIC_API_KEY) console.log('No Anthropic API key: local tools remain available.');
if (!existsSync(resolve(env.data.BIBLE_DIR, 'BIBLE-INDEX.md'))) console.warn('Bible not found at BIBLE_DIR:', resolve(env.data.BIBLE_DIR));

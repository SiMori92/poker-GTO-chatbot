import {neon} from '@neondatabase/serverless';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {KnowledgeIndex,type KnowledgeIndex as Index} from '../knowledge/ingest';
const Hash=z.string().regex(/^[a-f0-9]{64}$/);
const Release=z.object({sha256:Hash,bibleVersion:z.string().regex(/^GTO_Bible_v\d+\.md$/),body:z.string()});
export type Release=z.infer<typeof Release>;
export type KnowledgeStore={active():Promise<Release|null>;get(hash:string):Promise<Release|null>;publish(release:Release):Promise<void>};
function database(){const url=process.env.DATABASE_URL;if(!url)throw new Error('DATABASE_URL is not configured.');return neon(url)}
export const neonStore:KnowledgeStore={
 async active(){const sql=database();const rows=await sql`SELECT r.sha256,r.bible_version AS "bibleVersion",r.body FROM gto_knowledge_active a JOIN gto_knowledge_releases r ON r.sha256=a.sha256 WHERE a.singleton=TRUE`;return rows.length?Release.parse(rows[0]):null},
 async get(hash){const sql=database();const rows=await sql`SELECT sha256,bible_version AS "bibleVersion",body FROM gto_knowledge_releases WHERE sha256=${hash}`;return rows.length?Release.parse(rows[0]):null},
 async publish(release){const sql=database();await sql.transaction([sql`INSERT INTO gto_knowledge_releases (sha256,bible_version,body) VALUES (${release.sha256},${release.bibleVersion},${release.body}) ON CONFLICT (sha256) DO NOTHING`,sql`INSERT INTO gto_knowledge_active (singleton,sha256) VALUES (TRUE,${release.sha256}) ON CONFLICT (singleton) DO UPDATE SET sha256=EXCLUDED.sha256`])}
};
export async function initializeKnowledgeDatabase(){const sql=database();await sql.transaction([sql`CREATE TABLE IF NOT EXISTS gto_knowledge_releases (sha256 TEXT PRIMARY KEY CHECK (sha256 ~ '^[a-f0-9]{64}$'), bible_version TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,sql`CREATE TABLE IF NOT EXISTS gto_knowledge_active (singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton), sha256 TEXT NOT NULL REFERENCES gto_knowledge_releases(sha256))`])}
function validate(release:Release):Index{const r=Release.parse(release);if(createHash('sha256').update(r.body).digest('hex')!==r.sha256)throw new Error('Bible release integrity check failed.');const index=KnowledgeIndex.parse(JSON.parse(r.body));if(index.bibleVersion!==r.bibleVersion)throw new Error('Bible version mismatch in release.');return index}
export async function getActiveRelease(store:KnowledgeStore=neonStore){const r=await store.active();if(!r)return null;validate(r);return {sha256:r.sha256,bibleVersion:r.bibleVersion}}
export async function readCloudIndex(store:KnowledgeStore=neonStore):Promise<Index>{const r=await store.active();if(!r)throw new Error('No Bible release is active. Publish an index from your local machine.');return validate(r)}
export async function publishCloudIndex(index:Index,store:KnowledgeStore=neonStore){const safe=KnowledgeIndex.parse(index);const body=JSON.stringify(safe),sha256=createHash('sha256').update(body).digest('hex');const release=Release.parse({sha256,bibleVersion:safe.bibleVersion,body});const existing=await store.get(sha256);if(existing&&(existing.body!==body||existing.bibleVersion!==safe.bibleVersion))throw new Error('Existing release does not match its hash.');await store.publish(release);return {sha256,bibleVersion:safe.bibleVersion}}
export async function activateCloudRelease(hash:string,store:KnowledgeStore=neonStore){const sha256=Hash.parse(hash);const release=await store.get(sha256);if(!release)throw new Error('Release missing.');validate(release);await store.publish(release);return {sha256,bibleVersion:release.bibleVersion}}

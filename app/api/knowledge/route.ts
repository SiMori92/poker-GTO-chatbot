import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {buildKnowledgeIndex,KnowledgeIndex,writeKnowledgeIndex} from '../../../lib/knowledge/ingest';
import {readCloudIndex} from '../../../lib/cloud/knowledge';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{if(process.env.VERCEL==='1'||process.env.KNOWLEDGE_STORE==='neon')return Response.json(await readCloudIndex(),{headers:{'Cache-Control':'private, no-store'}});const fresh=await buildKnowledgeIndex();let index;try{index=KnowledgeIndex.parse(JSON.parse(await readFile(resolve('data/knowledge/index.json'),'utf8')))}catch{index=null}if(!index||index.contentHash!==fresh.contentHash){index=fresh;await writeKnowledgeIndex(index)}return Response.json(index,{headers:{'Cache-Control':'private, no-store'}})}catch(e){console.error('Knowledge unavailable:',e);return Response.json({error:'Knowledge unavailable. Check server configuration and publish a validated Bible release.'},{status:503,headers:{'Cache-Control':'no-store'}})}}

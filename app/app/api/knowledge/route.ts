import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {buildKnowledgeIndex,KnowledgeIndex,writeKnowledgeIndex} from '../../../lib/knowledge/ingest';
export const runtime='nodejs';
export async function GET(){try{const fresh=await buildKnowledgeIndex();let index;try{index=KnowledgeIndex.parse(JSON.parse(await readFile(resolve('data/knowledge/index.json'),'utf8')))}catch{index=null}if(!index||index.contentHash!==fresh.contentHash){index=fresh;await writeKnowledgeIndex(index)}return Response.json(index)}catch(e){return Response.json({error:e instanceof Error?e.message:'Knowledge unavailable'},{status:500})}}

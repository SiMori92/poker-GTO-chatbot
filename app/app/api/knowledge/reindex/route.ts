import {buildKnowledgeIndex,writeKnowledgeIndex} from '../../../../lib/knowledge/ingest';
export const runtime='nodejs';
export async function POST(){try{const index=await buildKnowledgeIndex();await writeKnowledgeIndex(index);return Response.json({bibleVersion:index.bibleVersion,clauses:index.clauses.length,sections:index.sections.length,contentHash:index.contentHash})}catch(e){return Response.json({error:e instanceof Error?e.message:'Knowledge indexing failed'},{status:500})}}

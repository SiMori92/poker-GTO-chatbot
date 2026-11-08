export async function register(){
 if(process.env.NEXT_RUNTIME!=='nodejs'||process.env.VERCEL==='1'||process.env.KNOWLEDGE_STORE==='neon')return;
 try{const {buildKnowledgeIndex,writeKnowledgeIndex}=await import('./lib/knowledge/ingest');await writeKnowledgeIndex(await buildKnowledgeIndex())}
 catch(error){console.error('Knowledge index unavailable:',error instanceof Error?error.message:error)}
}

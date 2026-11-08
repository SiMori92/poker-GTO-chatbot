export async function register(){
 if(process.env.NEXT_RUNTIME!=='nodejs')return;
 try{const {buildKnowledgeIndex,writeKnowledgeIndex}=await import('./lib/knowledge/ingest');await writeKnowledgeIndex(await buildKnowledgeIndex())}
 catch(error){console.error('Knowledge index unavailable:',error instanceof Error?error.message:error)}
}

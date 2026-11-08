import {initializeKnowledgeDatabase} from '../lib/cloud/knowledge';
async function main(){try{process.loadEnvFile('.env.local')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}await initializeKnowledgeDatabase();console.log('Neon knowledge tables are ready.')}
main().catch(error=>{console.error('Database initialization failed:',error instanceof Error?error.message:error);process.exitCode=1});

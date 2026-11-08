import {existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const args=process.argv.slice(2);const rootArg=args.indexOf('--root');
if(rootArg!==-1&&!args[rootArg+1]){console.error('Pass a directory after --root.');process.exit(2)}
const root=resolve(rootArg===-1?process.cwd():args[rootArg+1]);
const contract=[['package.json','Next.js project manifest'],['pnpm-lock.yaml','pnpm lockfile'],['app/layout.tsx','Next.js App Router layout'],['app/page.tsx','Next.js App Router page']];
if(args.includes('--contract')){for(const [path,description] of contract)console.log(`${path}: ${description}`);console.log('app/package.json: prohibited; the project manifest belongs at the repository root.');process.exit(0)}
let failed=false;
for(const [path,description] of contract)if(!existsSync(join(root,path))){console.error(`Missing ${description}: put it at ${path}.`);failed=true}
if(existsSync(join(root,'app/package.json'))){console.error('Nested app/package.json found: put the project manifest at the repository root.');failed=true}
if(failed)process.exit(1);console.log('Repository layout OK.');

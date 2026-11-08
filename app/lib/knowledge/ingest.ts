import {readFile, mkdir, rename, writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import mammoth from 'mammoth';
import {Parser} from 'htmlparser2';
import {z} from 'zod';
const Clause=z.object({id:z.string().regex(/^C-\d+\.\d+$/),title:z.string(),text:z.string(),numeric:z.boolean(),fields:z.record(z.string(),z.string())});
const Section=z.object({id:z.string(),document:z.string(),heading:z.string(),text:z.string()});
export const KnowledgeIndex=z.object({schemaVersion:z.literal(1),bibleVersion:z.string(),contentHash:z.string(),clauses:z.array(Clause),sections:z.array(Section),registry:z.string()});
export type KnowledgeIndex=z.infer<typeof KnowledgeIndex>;
function sectionsFromHtml(doc:string,html:string){let heading='',text='',current='',sectionNo=0;const out:z.infer<typeof Section>[]=[];let headingTag=false;const flush=()=>{if(heading&&text.trim())out.push({id:`${doc}#${sectionNo++}`,document:doc,heading,text:text.trim()});text=''};const parser=new Parser({onopentag(name){if(/^h[1-6]$/.test(name)){flush();headingTag=true;current=''}else if(name==='tr')text+='\n| ';else if(name==='td'||name==='th')text+=' | ';else if(name==='p'||name==='li')text+='\n'},ontext(value){if(headingTag)current+=value;else text+=value},onclosetag(name){if(/^h[1-6]$/.test(name)){heading=current.trim();headingTag=false}else if(name==='tr')text+=' |\n'}},{decodeEntities:true});parser.write(html);parser.end();flush();return out}
export async function buildKnowledgeIndex(bibleDir=process.env.BIBLE_DIR||'../../GTO Bible') {
 const dir=resolve(bibleDir); const registry=await readFile(join(dir,'BIBLE-INDEX.md'),'utf8');
 const version=registry.match(/\*\*Current Bible\*\*\s*\|\s*`(GTO_Bible_v\d+\.md)`/)?.[1];if(!version)throw new Error('Cannot resolve current Bible from registry');
 const bible=await readFile(join(dir,version),'utf8');const libraryIndex=await readFile(join(dir,'library','INDEX.md'),'utf8');
 const numeric=new Map<string,boolean>();for(const row of registry.split('\n')){const cells=row.split('|').map(x=>x.trim());const id=cells[1], value=cells[5]?.replaceAll('*','').match(/^(yes|no)\b/i)?.[1];if(/^C-\d+\.\d+$/.test(id??'')&&value&&!/withdrawn|waived/i.test(cells[6]??''))numeric.set(id,value.toLowerCase()==='yes')}
 const matches=Array.from(bible.matchAll(/^### (C-\d+\.\d+)\s*·\s*(.+)$/gm));const clauses=[];
 for(let i=0;i<matches.length;i++){
  const m=matches[i];if(!numeric.has(m[1]))continue;
  const tail=bible.slice(m.index!,matches[i+1]?.index??bible.length);const nextPart=tail.search(/^#{1,2} /m);const text=(nextPart<0?tail:tail.slice(0,nextPart)).trim();
  const fields:Record<string,string>={};const fieldMarkers=Array.from(text.matchAll(/^\*\*(Ruling|Why|Evidence|Boundary|Verified)(?:[^*]*)\*\*/gim));
  for(let j=0;j<fieldMarkers.length;j++){const f=fieldMarkers[j];fields[f[1].toLowerCase()]=text.slice(f.index!+f[0].length,fieldMarkers[j+1]?.index??text.length).replace(/^[\s:—.-]+/,'').trim()}
  clauses.push({id:m[1],title:m[2],text,numeric:numeric.get(m[1])!,fields})
 }
 if(clauses.length!==numeric.size)throw new Error(`Clause registry mismatch: expected ${numeric.size}, found ${clauses.length}`);
 const docs=Array.from(libraryIndex.matchAll(/^\|\s*`([^`]+\.docx)`\s*\|.*$/gm)).filter(m=>/current/i.test(m[0])).map(m=>m[1]);if(!docs.length)throw new Error('No current registered solver documents found');
 const hash=createHash('sha256').update(registry).update(bible).update(libraryIndex);const sections=[];
 for(const doc of docs){if(doc.includes('/')||doc.includes('\\\\'))throw new Error('Invalid document name');const bytes=await readFile(join(dir,'library',doc));hash.update(bytes);const converted=await mammoth.convertToHtml({buffer:bytes});sections.push(...sectionsFromHtml(doc,converted.value))}
 return KnowledgeIndex.parse({schemaVersion:1,bibleVersion:version,contentHash:hash.digest('hex'),clauses,sections,registry:libraryIndex});
}
export async function writeKnowledgeIndex(index:KnowledgeIndex, path=resolve('data/knowledge/index.json')){KnowledgeIndex.parse(index);await mkdir(resolve(path,'..'),{recursive:true});const temp=`${path}.${randomUUID()}.tmp`;await writeFile(temp,JSON.stringify(index,null,2));await rename(temp,path)}

import type {Spot,Boundary} from '../schemas';
import type {KnowledgeIndex} from './ingest';
import {matchesBoundary} from './boundary';
type Match={tier:'SOLVER';doc:string;section:string;node:string;tableCell:string;reason:string}|{tier:'SEND TO WIZARD';node:string;reason:string};
/** Narrow initial adapter: this frequency table is only valid for its explicitly registered configuration. */
export function retrieve(index:KnowledgeIndex,spot:Spot):Match {
 const node=`${spot.heroPosition??'?'} vs ${spot.openerPosition??'?'} open`;
 const filename='GTO_Wizard_Solver_Output_Analysis.docx';
 const row=index.registry.split('\n').find(line=>line.startsWith(`| \`${filename}\``));
 const established=!!row&&/current and sole source for the aggregate frequency tables/i.test(row)&&/100bb/i.test(row)&&/NL25/i.test(row)&&/cold calls 2\.5x/i.test(row)&&/Preflop only/i.test(row);
 const boundary:Boundary={street:['preflop'],stake:['NL25'],stackBb:[100],sizeTree:['2.5x'],solutionFamily:['with-cold-calls']};
 if(!established||!matchesBoundary(spot,boundary)||spot.nodeClass!=='vs-RFI'||!spot.heroPosition||!spot.openerPosition)return {tier:'SEND TO WIZARD',node,reason:'The exact configuration or node is not registered by this adapter.'};
 const section=index.sections.find(s=>s.document===filename&&/^4\.2\s/.test(s.heading));
 if(!section)return {tier:'SEND TO WIZARD',node,reason:'The registered frequency section was not found.'};
 const rows=section.text.split(/\|\s*\n\s*\|/).map(row=>row.split('|').map(c=>c.replace(/\s+/g,' ').trim()).filter(Boolean));
 const headers=['Opener','HJ','CO','BTN','SB','BB']; const head=rows.find(r=>{const start=r.indexOf('Opener');return start>=0&&headers.every((h,i)=>r[start+i]===h)});
 const data=rows.find(r=>r[0]===spot.openerPosition || (spot.openerPosition==='SB'&&/^SB \(3\.5x\)/.test(r[0]??'')));const column=headers.indexOf(spot.heroPosition);const cell=column>=1?data?.[column]:undefined;
 if(!head||!cell||!/^\d+(?:\.\d+)? \/ \d+(?:\.\d+)? \/ \d+(?:\.\d+)?$/.test(cell))return {tier:'SEND TO WIZARD',node,reason:'The exact opener and defender pair is not captured in the table.'};
 return {tier:'SOLVER',doc:filename,section:'4.2',node,tableCell:cell,reason:'Exact registered preflop configuration and opener/defender pair.'};
}

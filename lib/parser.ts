import { HandRecord, type HandRecord as Hand } from './schemas/hand';
type Street = 'preflop'|'flop'|'turn'|'river';
export function parseGG(text:string): Hand[] {
 const blocks=text.split(/(?=Poker Hand #)/).filter(x=>x.trim().startsWith('Poker Hand #'));
 return blocks.map(block=>{
  const header=block.match(/Poker Hand #([^:]+):.*?\(\$([\d.]+)\/\$([\d.]+)\)/); const table=block.match(/Table '([^']+)'.*?Seat #(\d+) is the button/);
  if(!header || !table) throw new Error('Unsupported or incomplete GG hand header');
  const players=Array.from(block.matchAll(/^Seat (\d+): (.+?) \(\$([\d.]+) in chips\)/gm),m=>({seat:+m[1],name:m[2],stack:+m[3],position:null as Hand['players'][number]['position']}));
  const clockwise=[...players].sort((a,b)=>((a.seat-Number(table[2])+10)%10)-((b.seat-Number(table[2])+10)%10));
  const positions: Record<number,Hand['players'][number]['position'][]>={2:['BTN','BB'],3:['BTN','SB','BB'],4:['BTN','SB','BB','CO'],5:['BTN','SB','BB','HJ','CO'],6:['BTN','SB','BB','UTG','HJ','CO']};
  if(clockwise[0]?.seat===+table[2] && positions[players.length]) clockwise.forEach((p,i)=>{p.position=positions[players.length][i]});
  const cards=block.match(/^Dealt to Hero \[([^\]]+)\]/m)?.[1].split(/\s+/) ?? [];
  const actions:Hand['actions']=[]; const boards:Hand['boards']=[]; const warnings:string[]=[]; let street:Street='preflop';
  for(const line of block.split(/\r?\n/)) {
   const st=line.match(/^\*\*\* (?:FIRST |SECOND )?(FLOP|TURN|RIVER) \*\*\* (.*)/); if(st){street=st[1].toLowerCase() as Street; boards.push({street,cards:Array.from(st[2].matchAll(/\[([^\]]+)\]/g)).flatMap(m=>m[1].split(/\s+/))});continue}
   if(/^\*\*\* (SHOWDOWN|SUMMARY)/.test(line)) break;
   const ret=line.match(/^Uncalled bet \(\$([\d.]+)\) returned to (.+)$/); if(ret){actions.push({player:ret[2],street,kind:'returned',amount:+ret[1],allIn:false});continue}
   const m=line.match(/^(.+?): (?:posts (small blind|big blind|missed blind|ante|straddle)|(folds|checks|calls|bets|raises))(?: \$([\d.]+))?(?: to \$([\d.]+))?(.*)$/);
   if(m){const kind=(m[2]||m[3]) as Hand['actions'][number]['kind'];actions.push({player:m[1],street,kind,amount:m[4]?+m[4]:undefined,to:m[5]?+m[5]:undefined,allIn:/all.in/i.test(m[6])});}
   else if(/^[^:]+: (posts|calls|bets|raises|folds|checks)/.test(line)) warnings.push(`Unparsed action: ${line}`);
  }
  if(!cards.length) warnings.push('Hero cards unavailable');
  if(/Hand was run (?:two|three) times/i.test(block)) warnings.push('Multiple runouts require review; boards may share earlier cards');
  if(players.some(p=>p.position===null)) warnings.push('Seat positions could not be assigned reliably');
  const bb=+header[3];return HandRecord.parse({id:header[1],table:table[1],smallBlind:+header[2],bigBlind:bb,stake:`NL${Math.round(bb*10000)/100}`,buttonSeat:+table[2],players,heroCards:cards,boards,actions,warnings});
 });
}

import type { HandRecord } from './schemas/hand';
/** Pot immediately before and after each recorded action, in the source currency.
 * A raise's "to" is a street total, not the amount added to the pot. */
export function potTimeline(hand:HandRecord) {
 let pot=0; let street='preflop'; const streetContributions=new Map<string,number>();
 return hand.actions.map(action=>{
  if(action.street!==street){street=action.street;streetContributions.clear()}
  const before=pot; const previous=streetContributions.get(action.player)??0;
  if(action.kind==='returned') { if(action.amount===undefined||action.amount>previous+1e-8)throw new Error('Invalid returned bet');pot-=action.amount;streetContributions.set(action.player,previous-action.amount) }
  else if(action.kind==='raises') {if(action.to===undefined||action.to<previous)throw new Error('Invalid raise total');pot+=action.to-previous;streetContributions.set(action.player,action.to)}
  else if(['small blind','big blind','straddle','calls','bets'].includes(action.kind)) {if(action.amount===undefined)throw new Error('Missing action amount');pot+=action.amount;streetContributions.set(action.player,previous+action.amount)}
  else if(action.kind==='ante'||action.kind==='missed blind') {if(action.amount===undefined)throw new Error('Missing ante');pot+=action.amount}
  return {action,before,after:pot};
 });
}

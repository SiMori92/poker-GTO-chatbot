function valid(pot:number, bet:number) { if (!Number.isFinite(pot) || !Number.isFinite(bet) || pot <= 0 || bet < 0) throw new Error('Pot must be positive and bet non-negative'); }
export function mdf(pot:number, bet:number) {valid(pot,bet);return pot/(pot+bet)}
export function alpha(pot:number, bet:number) {valid(pot,bet);return bet/(pot+bet)}
// Calling a bet B to win the existing pot P plus B risks B for P + 2B.
export function potOdds(potBeforeBet:number, bet:number) {valid(potBeforeBet,bet);return bet/(potBeforeBet+2*bet)}
export function bluffEv(pot:number, bet:number, fold:number) {valid(pot,bet);if(!Number.isFinite(fold)||fold<0||fold>1) throw new Error('Fold probability must be between 0 and 1');return fold*pot-(1-fold)*bet}

export function spr(stack:number,pot:number) { if(!Number.isFinite(stack)||stack<0||!Number.isFinite(pot)||pot<=0)throw new Error('Stack must be non-negative and pot positive');return stack/pot }

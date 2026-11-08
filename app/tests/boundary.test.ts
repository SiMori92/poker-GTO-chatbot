import {describe,it,expect} from 'vitest';
import {matchesBoundary} from '../lib/knowledge/boundary';
import type {Spot,Boundary} from '../lib/schemas';
const boundary:Boundary={street:['preflop'],stake:['NL25'],stackBb:[100],sizeTree:['2.5x'],solutionFamily:['with-cold-calls']};
const spot:Spot={street:'preflop',stake:'NL25',stackBb:100,sizeTree:'2.5x',solutionFamily:'with-cold-calls',nodeClass:'vs-RFI'};
describe('five-axis boundary',()=>{it('matches an exact configuration',()=>expect(matchesBoundary(spot,boundary)).toBe(true));it('refuses each mismatch or unknown',()=>{for(const diff of [{street:'flop'}, {stake:'NL5'}, {stackBb:40}, {sizeTree:'2x'}, {solutionFamily:'raise-or-fold'}, {stake:null}] as Partial<Spot>[])expect(matchesBoundary({...spot,...diff},boundary)).toBe(false)})});

import { describe,it,expect } from 'vitest';
import {mdf,alpha,potOdds,bluffEv} from '../lib/calc';
describe('price math',()=>{it('calculates a half-pot bet',()=>{expect(mdf(10,5)).toBeCloseTo(2/3);expect(alpha(10,5)).toBeCloseTo(1/3);expect(potOdds(10,5)).toBeCloseTo(.25);expect(bluffEv(10,5,1/3)).toBeCloseTo(0)});it('rejects invalid prices',()=>{expect(()=>mdf(0,1)).toThrow();expect(()=>bluffEv(10,5,2)).toThrow()})});

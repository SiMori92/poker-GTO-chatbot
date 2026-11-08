import {it,expect} from 'vitest';
import {TaggedValue} from '../lib/schemas';
it('rejects untagged numeric chart data',()=>{expect(TaggedValue.safeParse({value:42}).success).toBe(false);expect(TaggedValue.safeParse({value:42,provenance:{kind:'CALC'}}).success).toBe(true)});

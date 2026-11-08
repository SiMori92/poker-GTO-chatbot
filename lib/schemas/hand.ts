import { z } from 'zod';
export const Street = z.enum(['preflop','flop','turn','river']);
export const Action = z.object({ player:z.string(), street:Street, kind:z.enum(['small blind','big blind','missed blind','ante','straddle','folds','checks','calls','bets','raises','returned']), amount:z.number().nonnegative().optional(), to:z.number().nonnegative().optional(), allIn:z.boolean() });
export const HandRecord = z.object({ id:z.string(), table:z.string(), smallBlind:z.number().positive(), bigBlind:z.number().positive(), stake:z.string(), buttonSeat:z.number().int().positive(), players:z.array(z.object({seat:z.number().int().positive(),name:z.string(),stack:z.number().nonnegative(),position:z.enum(['UTG','HJ','CO','BTN','SB','BB']).nullable()})), heroCards:z.array(z.string()), boards:z.array(z.object({street:Street,cards:z.array(z.string())})), actions:z.array(Action), warnings:z.array(z.string()) });
export type HandRecord = z.infer<typeof HandRecord>;

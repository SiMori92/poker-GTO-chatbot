import {afterEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
import {proxy} from '../proxy';
afterEach(()=>vi.unstubAllEnvs());
describe('hosted access',()=>{it('fails closed if the password is missing',()=>{vi.stubEnv('VERCEL','1');vi.stubEnv('APP_PASSWORD','');expect(proxy(new NextRequest('https://example.test/api/knowledge')).status).toBe(503)});it('challenges strangers and accepts the configured user',()=>{vi.stubEnv('VERCEL','1');const pass='this-is-a-long-test-password';vi.stubEnv('APP_PASSWORD',pass);expect(proxy(new NextRequest('https://example.test/api/knowledge')).status).toBe(401);const authorization='Basic '+Buffer.from(`trainer:${pass}`).toString('base64');const res=proxy(new NextRequest('https://example.test/api/knowledge',{headers:{authorization}}));expect(res.status).toBe(200);expect(res.headers.get('cache-control')).toContain('no-store')})});

it('enforces the eight-character minimum',()=>{vi.stubEnv('VERCEL','1');vi.stubEnv('APP_PASSWORD','1234567');expect(proxy(new NextRequest('https://example.test/')).status).toBe(503);vi.stubEnv('APP_PASSWORD','12345678');const authorization='Basic '+Buffer.from('trainer:12345678').toString('base64');expect(proxy(new NextRequest('https://example.test/',{headers:{authorization}})).status).toBe(200)});

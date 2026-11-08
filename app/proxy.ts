import {createHash,timingSafeEqual} from 'node:crypto';
import {NextResponse,type NextRequest} from 'next/server';
function digest(value:string){return createHash('sha256').update(value).digest()}
export function proxy(request:NextRequest){
 const password=process.env.APP_PASSWORD;
 const needsProtection=process.env.VERCEL==='1'||process.env.NODE_ENV==='production'||process.env.KNOWLEDGE_STORE==='neon'||Boolean(password);
 if(!needsProtection)return NextResponse.next();
 if(!password || Array.from(password).length<8)return new NextResponse('Application access is not configured.',{status:503,headers:{'Cache-Control':'no-store'}});
 const header=request.headers.get('authorization')??'';let supplied='';
 if(header.length<=2048&&/^Basic /i.test(header)){try{supplied=Buffer.from(header.slice(6),'base64').toString('utf8')}catch{supplied=''}}
 if(!timingSafeEqual(digest(supplied),digest(`trainer:${password}`)))return new NextResponse('Authentication required.',{status:401,headers:{'WWW-Authenticate':'Basic realm="GTO Trainer", charset="UTF-8"','Cache-Control':'no-store'}});
 const response=NextResponse.next();response.headers.set('Cache-Control','private, no-store');return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};

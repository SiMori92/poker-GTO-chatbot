import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'GTO Poker Trainer', description: 'A source-grounded poker study workspace' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

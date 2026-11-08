import Workspace from './workspace';
export default function Home() { return <Workspace hasKey={Boolean(process.env.ANTHROPIC_API_KEY)} />; }

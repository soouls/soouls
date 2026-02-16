import { GalaxyView } from './components';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-aura-focus/30">
      <main id="main-content">
        <GalaxyView />
      </main>
    </div>
  );
}

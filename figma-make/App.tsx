// Process Investigation Workspace — Reactor-02 (Figma Make entry)
// Files: App.tsx · engine.ts · data.ts · styles.ts  (put all four in the same folder as App.tsx)
import { useEffect, useRef } from 'react';
import { mount } from './engine';
import { css } from './styles';

export default function App() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    return mount(root.current); // returns cleanup (resize / keyboard listeners)
  }, []);

  return (
    <div ref={root} style={{ position: 'fixed', inset: 0, background: '#0B0D0F' }}>
      <style>{css}</style>
      <nav className="deck" aria-label="Screens">
        <div className="seg" id="frameSeg">
          <button data-f="A" className="on"><span>A</span>Default · last 24 h</button>
          <button data-f="B"><span>B</span>Zoomed &amp; compared · 09:00–09:25</button>
          <button data-f="C"><span>C</span>Stress case · 33 signals</button>
        </div>
      </nav>
      <div className="stage">
        <div className="frame" id="frame" />
      </div>
    </div>
  );
}

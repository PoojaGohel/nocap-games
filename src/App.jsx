import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, ALL_GAMES } from './games.js';

const WIDE = '(min-width: 761px)';
const gameUrl = id => `games/${id}/index.html`;
const idFromHash = () => {
  const id = window.location.hash.slice(1);
  return ALL_GAMES.some(g => g.id === id) ? id : ALL_GAMES[0].id;
};

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}

export default function App() {
  const wide = useWide();
  const [current, setCurrent] = useState(idFromHash);
  const [query, setQuery] = useState('');
  const frame = useRef(null);

  // the selected game lives in the URL (#snake) so it can be bookmarked or shared
  useEffect(() => {
    const onHash = () => setCurrent(idFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function pick(e, id) {
    // on phones, let the link open the game page itself
    if (!wide) return;
    e.preventDefault();
    setCurrent(id);
    window.history.replaceState(null, '', '#' + id);
    frame.current?.focus();
  }

  function onFrameLoad() {
    // Hide the game's own "All games" link and make taps inside the frame take keyboard focus
    // (the game screen cancels pointerdown, which otherwise stops focus moving into the frame).
    // Only possible when served over http(s); skip quietly otherwise.
    try {
      const doc = frame.current.contentDocument;
      const style = doc.createElement('style');
      style.textContent = '.back { display: none !important; }';
      doc.head.appendChild(style);
      doc.addEventListener('pointerdown', () => frame.current.contentWindow.focus(), true);
    } catch {
      /* cross-origin frame */
    }
  }

  const q = query.trim().toLowerCase();
  const sections = CATEGORIES.map(c => ({
    ...c,
    shown: c.games.filter(g => !q || `${g.name} ${g.desc}`.toLowerCase().includes(q)),
  })).filter(c => c.shown.length > 0);

  return (
    <>
      <nav className="side" aria-label="Games">
        <header>
          <h1>NoCap <span>Games</span></h1>
          <p className="tag">
            {ALL_GAMES.length} free games for everyone. No download, no sign-up. Pick one and play!
          </p>
        </header>
        <input
          className="filter"
          type="search"
          placeholder="Find a game…"
          aria-label="Find a game"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {sections.length === 0 && <p className="empty">No game matches that.</p>}
        {sections.map(c => (
          <section key={c.title}>
            <h2>{c.title} · {c.games.length}</h2>
            <div className="list">
              {c.shown.map(g => (
                <a
                  key={g.id}
                  className={'card' + (wide && g.id === current ? ' active' : '')}
                  href={gameUrl(g.id)}
                  onClick={e => pick(e, g.id)}
                  aria-current={wide && g.id === current ? 'page' : undefined}
                >
                  <b>{g.name}</b>
                  <span>{g.desc}</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </nav>
      {wide && (
        <main className="play">
          <iframe
            ref={frame}
            key={current}
            src={gameUrl(current)}
            title={ALL_GAMES.find(g => g.id === current).name}
            onLoad={onFrameLoad}
          />
        </main>
      )}
    </>
  );
}

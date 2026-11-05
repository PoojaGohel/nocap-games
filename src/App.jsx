import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, ALL_GAMES } from './games.js';

const gameUrl = id => `games/${id}/index.html`;
const byId = id => ALL_GAMES.find(g => g.id === id);
const currentId = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return byId(id) ? id : null;
};

// the page shows the home grid at "#" and a game at "#<id>", so the browser back button works
function useRoute() {
  const [id, setId] = useState(currentId);
  useEffect(() => {
    const onHash = () => setId(currentId());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return id;
}

function matches(game, q) {
  return !q || `${game.name} ${game.desc} ${game.catTitle}`.toLowerCase().includes(q);
}

function Logo() {
  return (
    <a className="logo" href="#" aria-label="NoCap Games home">
      <span className="logo-mark" aria-hidden="true">🎮</span>
      <span>NoCap <b>Games</b></span>
    </a>
  );
}

function Search({ value, onChange }) {
  return (
    <label className="search">
      <span aria-hidden="true">🔍</span>
      <input
        type="search"
        placeholder="Search games…"
        aria-label="Search games"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}

const NEW_COUNT = ALL_GAMES.filter(g => g.isNew).length;

function NewTag() {
  return <span className="new-tag">New</span>;
}

// soft moving color blobs, a dot pattern and floating game icons behind everything.
// the icons drift with the mouse (see usePointerGlow) for a bit of depth
const FLOATERS = ['🎮', '🧩', '🎯', '🏓', '🐍', '🧠', '🚀', '🎲', '⭐', '🏆', '🍉', '👾'];

function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="dots" />
      {FLOATERS.map((e, i) => (
        <span
          key={i}
          className="floater"
          style={{ '--i': i, left: `${(i * 37 + 6) % 94}%`, top: `${(i * 53 + 9) % 90}%` }}
        >
          {e}
        </span>
      ))}
    </div>
  );
}

// tracks the pointer: the whole page gets --px/--py (-1..1) for parallax,
// and the card under the pointer gets --x/--y for its spotlight glow
function usePointerGlow() {
  useEffect(() => {
    let frame = 0;
    let last = null;
    const root = document.documentElement;
    function apply() {
      frame = 0;
      const e = last;
      root.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      root.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      const card = e.target instanceof Element ? e.target.closest('.card') : null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - r.left}px`);
        card.style.setProperty('--y', `${e.clientY - r.top}px`);
      }
    }
    function onMove(e) {
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
}

const HERO_TILES = [
  { icon: '🐍', cat: 'arcade' }, { icon: '🧩', cat: 'puzzle' }, { icon: '🏓', cat: 'players' },
  { icon: '🧠', cat: 'brain' }, { icon: '🤖', cat: 'bot' }, { icon: '🎯', cat: 'arcade' },
];

function GameCard({ game, index = 0 }) {
  return (
    <a className="card" href={'#' + game.id} data-cat={game.cat} style={{ '--i': Math.min(index, 12) }}>
      <span className="card-icon" aria-hidden="true">{game.icon}</span>
      <span className="card-text">
        <b>{game.name}{game.isNew && <NewTag />}</b>
        <span>{game.desc}</span>
      </span>
    </a>
  );
}

function Home({ query, setQuery }) {
  const [cat, setCat] = useState('all');
  const q = query.trim().toLowerCase();
  const sections = CATEGORIES
    .filter(c => cat === 'all' || cat === 'new' || c.key === cat)
    .map(c => ({
      ...c,
      shown: c.games.filter(g => (cat !== 'new' || g.isNew) && matches({ ...g, catTitle: c.title }, q)),
    }))
    .filter(c => c.shown.length > 0);

  function surprise() {
    const pick = ALL_GAMES[Math.floor(Math.random() * ALL_GAMES.length)];
    window.location.hash = pick.id;
  }

  return (
    <div className="home">
      <header className="topbar">
        <Logo />
        <Search value={query} onChange={setQuery} />
      </header>

      <section className="hero">
        <div className="hero-tiles" aria-hidden="true">
          {HERO_TILES.map((t, i) => (
            <span key={i} className="hero-tile" data-cat={t.cat} style={{ '--i': i }}>{t.icon}</span>
          ))}
        </div>
        <h1>{ALL_GAMES.length} free games for everyone.</h1>
        <p>No download, no sign-up. Pick one and play!</p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={surprise}>🎲 Surprise me</button>
          <button type="button" className="btn" onClick={() => setCat('players')}>👯 Play with a friend</button>
        </div>
      </section>

      <nav className="chips" aria-label="Categories">
        <button type="button" className={'chip' + (cat === 'all' ? ' on' : '')} onClick={() => setCat('all')}>
          All <small>{ALL_GAMES.length}</small>
        </button>
        {NEW_COUNT > 0 && (
          <button type="button" data-cat="new" className={'chip' + (cat === 'new' ? ' on' : '')} onClick={() => setCat('new')}>
            ✨ New <small>{NEW_COUNT}</small>
          </button>
        )}
        {CATEGORIES.map(c => (
          <button
            type="button"
            key={c.key}
            data-cat={c.key}
            className={'chip' + (cat === c.key ? ' on' : '')}
            onClick={() => setCat(c.key)}
          >
            {c.title} <small>{c.games.length}</small>
          </button>
        ))}
      </nav>

      <main className="sections">
        {sections.length === 0 && (
          <p className="empty">No game matches “{query}”. Try another word.</p>
        )}
        {sections.map(c => (
          <section key={c.key} className="section" data-cat={c.key}>
            <div className="section-head">
              <h2>{c.title}</h2>
              <p>{c.blurb}</p>
            </div>
            <div className="grid">
              {c.shown.map((g, i) => <GameCard key={g.id} game={{ ...g, cat: c.key }} index={i} />)}
            </div>
          </section>
        ))}
      </main>

      <footer className="footer">
        Made for fun · works on phones, tablets and computers
      </footer>
    </div>
  );
}

function Player({ id, query, setQuery }) {
  const game = byId(id);
  const frame = useRef(null);
  const activeLink = useRef(null);
  const q = query.trim().toLowerCase();
  const index = ALL_GAMES.findIndex(g => g.id === id);
  const next = ALL_GAMES[(index + 1) % ALL_GAMES.length];

  useEffect(() => {
    document.title = `${game.name} · NoCap Games`;
    activeLink.current?.scrollIntoView({ block: 'nearest' });
    return () => { document.title = 'NoCap Games'; };
  }, [game]);

  function onFrameLoad() {
    // Tidy the game page for this view: its title and "All games" link are in our bar already.
    // Also let taps inside the frame take keyboard focus (the game screen cancels pointerdown,
    // which otherwise stops focus moving into the frame). Only possible over http(s).
    try {
      const win = frame.current.contentWindow;
      const doc = frame.current.contentDocument;
      const style = doc.createElement('style');
      style.textContent = '.wrap > header { display: none !important; } .wrap { padding-top: 16px !important; }';
      doc.head.appendChild(style);
      doc.addEventListener('pointerdown', () => win.focus(), true);
      win.focus();
    } catch {
      /* cross-origin frame: leave the page as it is */
    }
  }

  const sections = useMemo(() => CATEGORIES
    .map(c => ({ ...c, shown: c.games.filter(g => matches({ ...g, catTitle: c.title }, q)) }))
    .filter(c => c.shown.length > 0), [q]);

  return (
    <div className="player">
      <header className="topbar">
        <a className="btn btn-ghost back" href="#">← <span>All games</span></a>
        <Logo />
        <Search value={query} onChange={setQuery} />
      </header>

      <div className="player-body">
        <aside className="side" aria-label="Games">
          {sections.length === 0 && <p className="empty">No game matches.</p>}
          {sections.map(c => (
            <section key={c.key} data-cat={c.key}>
              <h2>{c.title}</h2>
              {c.shown.map(g => (
                <a
                  key={g.id}
                  ref={g.id === id ? activeLink : null}
                  className={'item' + (g.id === id ? ' on' : '')}
                  href={'#' + g.id}
                  aria-current={g.id === id ? 'page' : undefined}
                >
                  <span className="item-icon" aria-hidden="true">{g.icon}</span>
                  <span>{g.name}</span>
                  {g.isNew && <NewTag />}
                </a>
              ))}
            </section>
          ))}
        </aside>

        <main className="stage" data-cat={game.cat}>
          <div className="stage-bar">
            <span className="stage-icon" aria-hidden="true">{game.icon}</span>
            <div className="stage-title">
              <h1>{game.name} <span className="badge">{game.catTitle}</span>{game.isNew && <NewTag />}</h1>
              <p>{game.desc}</p>
            </div>
            <div className="stage-actions">
              <button type="button" className="btn" onClick={() => frame.current?.requestFullscreen?.()}>
                ⛶ <span>Full screen</span>
              </button>
              <a className="btn" href={'#' + next.id} title={`Next: ${next.name}`}>
                <span>Next</span> →
              </a>
            </div>
          </div>
          <iframe
            ref={frame}
            key={id}
            src={gameUrl(id)}
            title={game.name}
            onLoad={onFrameLoad}
            allow="fullscreen"
          />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const id = useRoute();
  const [query, setQuery] = useState('');

  usePointerGlow();
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  return (
    <>
      <Backdrop />
      {id
        ? <Player id={id} query={query} setQuery={setQuery} />
        : <Home query={query} setQuery={setQuery} />}
    </>
  );
}

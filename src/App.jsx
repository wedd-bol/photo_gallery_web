import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import useReducedMotion from './useMotionPreference.js';
import useSmoothScroll from './useSmoothScroll.js';
import { createWheelIntent, wheelPixels } from './wheelIntent.js';
import { album, photos, volumes } from '../photos.js';
import EntryTransition, { ENTRY_DURATION, ENTRY_SWITCH } from './EntryTransition.jsx';

const ease = [.2, .65, .3, 1];
const photoById = new Map(photos.map(photo => [photo.id, photo]));
const pad = value => String(value).padStart(2, '0');
const keyFor = route => `${route.page}/${route.volume?.id || ''}`;

function readRoute() {
  const parts = location.hash.slice(1).split('/');
  if (parts[0] === 'archive') return { page: 'archive' };
  if (parts[0] === 'daybook') {
    const volume = volumes.find(item => item.id === parts[1]) || volumes[0];
    const entry = parts[2] === 'photo' ? volume.entries.find(item => item.photo === parts[3] && photoById.get(item.photo)?.src) : null;
    return { page: 'daybook', volume, entry };
  }
  return { page: 'home' };
}

function Photo({ id, className = '', eager = false }) {
  const photo = photoById.get(id);
  const [failed, setFailed] = useState(false);
  if (!photo?.src || failed) return <span className={`image-placeholder ${className}`}>YOUR PHOTOGRAPH HERE</span>;
  return <img className={className} src={photo.src} alt={photo.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} style={{ '--photo-position': photo.position || '50% 50%', '--photo-mobile-position': photo.mobilePosition || photo.position || '50% 50%' }} />;
}

function Home({ onEnter, onDaybook, transitioning }) {
  const reduced = useReducedMotion();
  const container = useRef(null);
  const video = useRef(null);
  const touchY = useRef(0);
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => {
    const element = container.current;
    const intent = createWheelIntent();
    const wheel = event => {
      const { x, y } = wheelPixels(event, innerHeight);
      if (event.ctrlKey || y <= 0 || Math.abs(x) > Math.abs(y)) return;
      event.preventDefault();
      if (intent.push(y, performance.now()) > 0) onEnter();
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [onEnter]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const sync = () => {
      if (reduced || transitioning || document.hidden) element.pause();
      else element.play().catch(() => {});
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { document.removeEventListener('visibilitychange', sync); element.pause(); };
  }, [reduced, transitioning, videoFailed]);
  return (
    <section ref={container} className="home-page" aria-labelledby="home-title"
      onTouchStart={event => { touchY.current = event.touches[0].clientY; }}
      onTouchEnd={event => { if (touchY.current - event.changedTouches[0].clientY > 55) onEnter(); }}>
      <header className="home-header page-margin flex justify-between">
        <span className="home-brand">LIGHT INDEX <span>— VISUAL MEMORIES</span></span>
        <nav aria-label="首页导航" className="home-links flex flex-col items-end"><button onClick={onEnter}>journeys ↗</button><button onClick={onEnter}>volumes ↗</button><button onClick={onDaybook}>daybook ↗</button></nav>
      </header>
      <div className="home-heading page-margin"><p className="micro-label">A PERSONAL COLLECTION OF PASSING MOMENTS</p><h1 id="home-title">{album.homeTitle[0]}<br />{album.homeTitle[1]}</h1></div>
      <button className="hero-film relative block w-full overflow-hidden" aria-label="进入影像档案，播放胶片转场" onClick={onEnter}>
        {album.video && !videoFailed ? <video ref={video} src={album.video} poster={album.videoPoster} muted loop playsInline autoPlay={!reduced && !transitioning} preload={reduced ? 'none' : 'auto'} onError={() => setVideoFailed(true)} aria-label="雪山徒步示例短片" /> : <img src={album.videoPoster} alt="雪山徒步影像封面" />}
        <span className="film-divider film-divider-left" aria-hidden="true" /><span className="film-divider film-divider-right" aria-hidden="true" />
        <span className="film-edge film-edge-top" aria-hidden="true" /><span className="film-edge film-edge-bottom" aria-hidden="true" />
        <span className="film-frame-code" aria-hidden="true">LI / MOTION PICTURE 001</span>
      </button>
      <div className="home-bottom page-margin grid">
        <div><h2>{album.recallTitle[0]}<br />{album.recallTitle[1]}</h2><p>{album.note[0]}<br />{album.note[1]}</p></div>
        <button className="enter-cue" onClick={onEnter} aria-label="向下进入影像档案"><span aria-hidden="true">↓</span><span>SCROLL TO ENTER</span></button>
        <div className="home-motto"><p>{album.motto[0]}<br />{album.motto[1]}</p><span>THE JOURNEY IS STILL UNFOLDING</span></div>
      </div>
      <footer className="home-footer page-margin flex justify-between"><span>光的索引 / A LIVING ARCHIVE</span><span>FILM 01 — 05</span></footer>
    </section>
  );
}

function ArchiveCard({ item, index, active, progress, arriving, onHover, onOpen }) {
  const reduced = useReducedMotion();
  const focus = useTransform(progress, value => Math.max(0, 1 - Math.abs(value - index)));
  return <motion.button className={`archive-card ${active ? 'is-active' : ''}`} data-volume={item.id} style={{ '--card-focus': focus }}
    initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .7, delay: reduced ? 0 : index * .06, ease }}
    onPointerMove={event => onHover(event, index)} onFocus={() => { if (!arriving) onHover(null, index); }}
    onClick={() => { if (!arriving) onOpen(item.id); }} aria-label={`打开${item.chinese}，${item.title}`} aria-pressed={active}>
    <Photo id={item.cover} eager /><span className="archive-card-shade" /><span className="archive-card-title"><small>VOL. {pad(index + 1)}</small>{item.title}</span>
  </motion.button>;
}

function Archive({ active, setActive, onOpen, onHome, arriving }) {
  const reduced = useReducedMotion();
  const container = useRef(null);
  const strip = useRef(null);
  const lastWheel = useRef(-Infinity);
  const pointer = useRef(null);
  // Critically damped: retain velocity when redirected, without a bounce.
  const progress = useSpring(active, { stiffness: 225, damping: 30, mass: 1, restDelta: .001, restSpeed: .01 });
  const volume = volumes[active];
  useLayoutEffect(() => {
    if (reduced) progress.jump(active);
    else progress.set(active);
  }, [active, reduced, progress]);
  useEffect(() => {
    const element = container.current;
    const intent = createWheelIntent();
    const wheel = event => {
      if (event.ctrlKey) return;
      const { x, y } = wheelPixels(event, innerHeight);
      const delta = Math.abs(x) > Math.abs(y) ? x : y;
      if (!delta) return;
      event.preventDefault();
      lastWheel.current = performance.now();
      if (arriving) return;
      const step = intent.push(delta, lastWheel.current);
      if (step) setActive(previous => Math.max(0, Math.min(volumes.length - 1, previous + step)));
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [arriving, setActive]);
  useEffect(() => {
    const key = event => {
      const direction = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if ((!direction && event.key !== 'Home' && event.key !== 'End') || arriving || event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? volumes.length - 1 : Math.max(0, Math.min(volumes.length - 1, active + direction));
      setActive(next);
      strip.current.children[next].focus({ preventScroll: true });
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [active, arriving, setActive]);
  const hover = (event, index) => {
    if (arriving) return;
    if (event) {
      if (event.pointerType !== 'mouse') return;
      const previous = pointer.current;
      pointer.current = { x: event.clientX, y: event.clientY };
      const moved = previous ? Math.hypot(event.clientX - previous.x, event.clientY - previous.y) : Math.hypot(event.movementX, event.movementY);
      if (moved < 2 || performance.now() - lastWheel.current < 220) return;
    }
    setActive(index);
  };
  return (
    <motion.section ref={container} className="archive-page" aria-labelledby="archive-title" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .65, ease }}>
      <header className="archive-header page-margin flex justify-between">
        <div><button className="archive-wordmark" onClick={onHome} aria-label="返回视频首页" id="archive-title">FILM ARCHIVE</button><p>A PERSONAL COLLECTION<br />05 VOLUMES · WORDS AND PICTURES</p></div>
        <p className="archive-header-note">影像，是时间留下的回声。<br /><span>THE DAYS WE KEEP, THE LIGHT WE FIND.</span></p>
      </header>
      <motion.div className="archive-center" style={{ '--archive-position': progress, '--archive-count': volumes.length }}>
        <div ref={strip} className="archive-strip flex" aria-label="影像系列，上下滚轮、悬停或方向键浏览">
          {volumes.map((item, index) => <ArchiveCard key={item.id} item={item} index={index} active={active === index} progress={progress} arriving={arriving} onHover={hover} onOpen={onOpen} />)}
        </div>
        <div className="archive-register" aria-hidden="true"><span /></div>
        <div className="archive-caption" aria-live="polite" aria-atomic="true"><AnimatePresence mode="wait" initial={false}><motion.p key={volume.id} className="archive-current" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .18, ease }}><span>{pad(active + 1)}</span><i>/</i>{volume.title}<small>{volume.chinese}</small></motion.p></AnimatePresence></div>
      </motion.div>
      <footer className="archive-footer page-margin flex items-end justify-between"><button className="quiet-back" onClick={onHome} aria-label="返回视频首页">← <span>BACK TO THE JOURNEY</span></button><p>SCROLL TO BROWSE · CLICK TO READ<br /><span>{pad(active + 1)} / {pad(volumes.length)} VOLUMES</span></p></footer>
    </motion.section>
  );
}

function Daybook({ volume, onArchive, onOpen, detailOpen }) {
  const reduced = useReducedMotion();
  const container = useRef(null);
  useSmoothScroll(container, !reduced && !detailOpen);
  return (
    <section ref={container} className="daybook-page" aria-labelledby="daybook-title">
      <header className="daybook-header flex items-center justify-between"><div className="flex items-center"><button className="round-control" aria-label="返回胶片档案" onClick={onArchive}>←</button><span className="daybook-wordmark">LIGHT INDEX / DAYBOOK</span></div><p id="daybook-title">{volume.title}<span>{pad(volume.entries.length)} FRAMES</span></p></header>
      <div className="daybook-layout page-margin">
        <aside className="daybook-intro"><span className="micro-label">WORDS & PICTURES</span><h1>{volume.chinese}</h1><p>{volume.note}</p><span className="daybook-intro-en">I kept a diary in words and pixels,<br />a record of everything that glowed.</span></aside>
        <div className="daybook-spine" aria-hidden="true" />
        <div className="daybook-entries">
          {volume.entries.map((entry, index) => <motion.article key={entry.photo} className="diary-entry" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reduced ? 0 : .65, ease }}>
            <span className="diary-frame-mark" aria-hidden="true">{pad(index + 1)}</span>
            <button className="diary-photo block w-full overflow-hidden" data-photo={entry.photo} disabled={!photoById.get(entry.photo)?.src} onClick={event => onOpen(entry.photo, event.currentTarget)} aria-label={`展开日记：${entry.title}`}><Photo id={entry.photo} eager={index < 2} /></button>
            <div className="diary-caption flex justify-between"><span>{entry.title}</span><span>{entry.category}</span></div>
          </motion.article>)}
        </div>
        <div className="daybook-edge-index" aria-hidden="true">{volume.entries.map((entry, index) => <span key={entry.photo}>{pad(index + 1)} / {entry.category}</span>)}</div>
      </div>
      <footer className="daybook-footer page-margin flex justify-between"><span>THE ORDINARY, KEPT A LITTLE LONGER.</span><button onClick={onArchive}>BACK TO THE ARCHIVE ↗</button></footer>
    </section>
  );
}

function Detail({ volume, entry, onClose, onChange, opener }) {
  const dialog = useRef(null);
  const close = useRef(null);
  const [closing, setClosing] = useState(false);
  const reduced = useReducedMotion();
  const available = volume.entries.filter(item => photoById.get(item.photo)?.src);
  const index = available.findIndex(item => item.photo === entry.photo);
  useLayoutEffect(() => {
    const element = dialog.current;
    const y = scrollY;
    const original = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow };
    Object.assign(document.body.style, { position: 'fixed', top: `-${y}px`, width: '100%', overflow: 'hidden' });
    element.showModal();
    close.current.focus({ preventScroll: true });
    return () => {
      if (element.open) element.close();
      Object.assign(document.body.style, original);
      window.scrollTo({ top: y, behavior: 'instant' });
      opener?.focus({ preventScroll: true });
    };
  }, [opener]);
  const step = direction => { const next = available[index + direction]; if (next && !closing) onChange(next.photo); };
  return (
    <motion.dialog ref={dialog} className="detail-dialog" aria-labelledby="detail-title" aria-describedby="detail-story" initial={{ opacity: 0 }} animate={{ opacity: closing ? 0 : 1 }} transition={{ duration: reduced ? 0 : .35, ease }}
      onAnimationComplete={() => { if (closing) onClose(); }} onCancel={event => { event.preventDefault(); setClosing(true); }}
      onKeyDown={event => {
        if (event.key === 'Tab') {
          const controls = [...dialog.current.querySelectorAll('button:not(:disabled)')];
          const first = controls[0], last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1); }
      }}>
      <div className="detail-header flex items-center justify-between"><span className="daybook-wordmark">LIGHT INDEX / DAYBOOK</span><button ref={close} className="round-control" aria-label="关闭日记详情" onClick={() => setClosing(true)}>×</button></div>
      <div className="detail-layout grid items-center">
        <aside className="detail-note"><p className="micro-label">{pad(index + 1)} / {entry.category}</p><h2 id="detail-title">{entry.title}</h2><p id="detail-story">{entry.text}</p></aside>
        <div className="detail-visual"><AnimatePresence mode="wait" initial={false}><motion.div key={entry.photo} className="detail-image" initial={{ opacity: 0, scale: reduced ? 1 : .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .35, ease }}><Photo id={entry.photo} eager /></motion.div></AnimatePresence></div>
      </div>
      <div className="detail-bottom flex items-center justify-between"><span>{pad(index + 1)} / {pad(available.length)}</span><div className="flex"><button className="round-control" aria-label="上一篇日记" disabled={index <= 0 || closing} onClick={() => step(-1)}>←</button><button className="round-control" aria-label="下一篇日记" disabled={index >= available.length - 1 || closing} onClick={() => step(1)}>→</button></div></div>
    </motion.dialog>
  );
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [activeVolume, setActiveVolume] = useState(3);
  const [entering, setEntering] = useState(false);
  const enteringRef = useRef(false);
  const timers = useRef([]);
  const positions = useRef(new Map());
  const opener = useRef(null);
  const photoFromBook = useRef(false);
  const main = useRef(null);
  const reduced = useReducedMotion();
  const pageKey = keyFor(route);
  const go = useCallback((hash, replace = false) => {
    const previous = readRoute();
    if (!previous.entry) positions.current.set(keyFor(previous), scrollY);
    history[replace ? 'replaceState' : 'pushState']({}, '', hash);
    setRoute(readRoute());
  }, []);
  useEffect(() => {
    const sync = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      enteringRef.current = false;
      setEntering(false);
      setRoute(readRoute());
    };
    addEventListener('popstate', sync); addEventListener('hashchange', sync);
    const old = history.scrollRestoration; history.scrollRestoration = 'manual';
    return () => { removeEventListener('popstate', sync); removeEventListener('hashchange', sync); history.scrollRestoration = old; timers.current.forEach(clearTimeout); };
  }, []);
  useLayoutEffect(() => {
    window.scrollTo({ top: positions.current.get(pageKey) || 0, behavior: 'instant' });
    main.current?.focus({ preventScroll: true });
  }, [pageKey]);
  useEffect(() => { if (!entering) main.current?.focus({ preventScroll: true }); }, [entering]);
  useEffect(() => { if (route.volume) setActiveVolume(volumes.indexOf(route.volume)); }, [route.volume]);
  useEffect(() => {
    if (!reduced || !enteringRef.current) return;
    timers.current.forEach(clearTimeout);
    go('#archive');
    timers.current = [setTimeout(() => { setEntering(false); enteringRef.current = false; }, 480)];
  }, [reduced, go]);
  const enter = useCallback(() => {
    if (enteringRef.current) return;
    enteringRef.current = true; setEntering(true);
    const duration = reduced ? 480 : ENTRY_DURATION;
    timers.current = [
      setTimeout(() => go('#archive'), reduced ? 190 : ENTRY_SWITCH),
      setTimeout(() => { setEntering(false); enteringRef.current = false; }, duration),
    ];
  }, [go, reduced]);
  const openBook = id => { setActiveVolume(Math.max(0, volumes.findIndex(volume => volume.id === id))); go(`#daybook/${id}`); };
  const openPhoto = (photo, trigger) => { opener.current = trigger; photoFromBook.current = true; go(`#daybook/${route.volume.id}/photo/${photo}`); };
  const closePhoto = () => {
    if (photoFromBook.current) { photoFromBook.current = false; history.back(); }
    else go(`#daybook/${route.volume.id}`, true);
  };
  return (
    <>
      <main ref={main} tabIndex={-1} className="app-main" data-page={route.page} aria-busy={entering} inert={entering} onKeyDown={event => {
        if (route.page === 'home' && ['ArrowDown', 'PageDown'].includes(event.key)) { event.preventDefault(); enter(); }
      }}>
        {route.page === 'home' && <Home onEnter={enter} onDaybook={() => openBook('woodlands')} transitioning={entering} />}
        {route.page === 'archive' && <Archive active={activeVolume} setActive={setActiveVolume} onOpen={openBook} onHome={() => go('#home')} arriving={entering} />}
        {route.page === 'daybook' && <Daybook key={route.volume.id} volume={route.volume} onArchive={() => go('#archive')} onOpen={openPhoto} detailOpen={Boolean(route.entry)} />}
      </main>
      {route.entry && <Detail volume={route.volume} entry={route.entry} onClose={closePhoto} onChange={photo => go(`#daybook/${route.volume.id}/photo/${photo}`, true)} opener={opener.current} />}
      {entering && <EntryTransition reduced={reduced} />}
    </>
  );
}

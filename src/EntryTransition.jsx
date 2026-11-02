import React from 'react';

export const ENTRY_DURATION = 3200;
export const ENTRY_SWITCH = 2430;

// A self-contained graphic film leader. No images, videos, URLs or album data.
export default function EntryTransition({ reduced }) {
  return (
    <div className={`entry-transition ${reduced ? 'is-reduced' : ''}`} aria-hidden="true" style={{ '--entry-duration': `${reduced ? 480 : ENTRY_DURATION}ms` }}>
      <div className="projector-veil" />
      {!reduced && <>
        <div className="projector-alignment">
          <span>FRAME / ALIGNMENT</span><div className="projector-alignment-box" /><i>35 : 24</i>
        </div>
        <div className="projector-perforations projector-perforations-left" />
        <div className="projector-perforations projector-perforations-right" />
        <div className="projector-calibration">
          <div className="projector-corner projector-corner-tl" /><div className="projector-corner projector-corner-tr" />
          <div className="projector-corner projector-corner-bl" /><div className="projector-corner projector-corner-br" />
          <span className="projector-code">LIGHT INDEX <i>PICTURE START</i></span>
          <span className="projector-side-code">35 MM / ORIGINAL NEGATIVE / 001</span>
          <svg className="projector-reticle" viewBox="0 0 1000 1000" fill="none">
            <circle cx="500" cy="500" r="420" /><circle cx="500" cy="500" r="365" />
            <circle className="projector-inner-ring" cx="500" cy="500" r="312" />
            <path d="M0 500h1000M500 0v1000M74 490v20M926 490v20M490 74h20M490 926h20" />
            <g className="projector-ticks">{Array.from({ length: 24 }, (_, index) => <path key={index} d={index % 3 === 0 ? 'M500 40v25' : 'M500 40v10'} transform={`rotate(${index * 15} 500 500)`} />)}</g>
          </svg>
          <div className="projector-counter">{['03', '02', '01'].map((number, index) => <span key={number} data-count={number} className={`projector-count projector-count-${index + 1}`}>{number}</span>)}</div>
          <div className="projector-measure" />
          <div className="projector-density">{Array.from({ length: 10 }, (_, index) => <span key={index} style={{ backgroundColor: `rgb(${24 + index * 20}, ${28 + index * 20}, ${24 + index * 20})` }} />)}</div>
          <span className="projector-density-caption">DENSITY / 00 — 09</span>
        </div>
        <div className="projector-type projector-type-recall"><span className="projector-type-echo">RECALL</span><span>RECALL</span><small>THE MOMENTS THAT REMAIN.</small></div>
        <div className="projector-type projector-type-memory"><span className="projector-type-echo">MEMORY</span><span>MEMORY</span><small>WHAT WE KEEP / WHAT WE BECOME</small>
          <div className="projector-memory-grid">{Array.from({ length: 12 }, (_, index) => <div key={index}><span>{String(index + 1).padStart(3, '0')}</span><i>+</i></div>)}</div>
        </div>
        <div className="projector-type projector-type-archive"><span className="projector-type-echo">ARCHIVE</span><span>ARCHIVE</span><small>WORDS / LIGHT / TIME</small></div>
        <div className="projector-slits">{Array.from({ length: 9 }, (_, index) => <span key={index} style={{ '--slit': index }} />)}</div>
        <div className="projector-exposure" />
        <div className="projector-grain" />
        <div className="projector-top-shutter" /><div className="projector-bottom-shutter" />
        <div className="projector-registration"><span>FROM THE JOURNEY</span><span>INTO THE ARCHIVE</span></div>
      </>}
    </div>
  );
}

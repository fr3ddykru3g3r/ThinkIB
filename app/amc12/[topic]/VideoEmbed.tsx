'use client';

import WebEmbed from '../../components/WebEmbed';
import { useState } from 'react';
import type { Video } from '@/lib/amc12-core';
import { card } from '../styles';

/** Click-to-load: no YouTube scripts or cookies until the student presses play. */
export default function VideoEmbed({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure style={{ ...card, padding: '0.75rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
        {playing ? (
          <WebEmbed video src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`} title={video.title}/>

        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${video.title}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, padding: 0, cursor: 'pointer', background: 'none' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            <span
              aria-hidden
              style={{
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff',
                display: 'grid', placeItems: 'center', fontSize: '1.3rem', paddingLeft: 4,
              }}
            >
              ▶
            </span>
          </button>
        )}
      </div>
      <figcaption style={{ padding: '0 0.25rem 0.25rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.35 }}>{video.title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '2px 0 6px' }}>{video.channel}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{video.why}</div>
      </figcaption>
    </figure>
  );
}

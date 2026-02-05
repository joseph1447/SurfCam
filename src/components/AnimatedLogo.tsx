"use client";

import { Player } from '@remotion/player';
import { SurferSnapLogo } from '@/remotion/SurferSnapLogo';
import Link from 'next/link';

export default function AnimatedLogo() {
  return (
    <Link
      href="/"
      className="block hover:opacity-90 transition-opacity"
      style={{ width: '400px', height: '100px' }}
    >
      <Player
        component={SurferSnapLogo}
        durationInFrames={90}
        compositionWidth={500}
        compositionHeight={150}
        fps={30}
        style={{
          width: '100%',
          height: '100%',
        }}
        autoPlay
        loop
        controls={false}
        clickToPlay={false}
      />
    </Link>
  );
}

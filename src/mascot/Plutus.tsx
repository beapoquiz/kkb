import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion';
import { Body } from './parts/Body';
import { Bubbles } from './parts/Bubbles';
import { Coin } from './parts/Coin';
import { Face } from './parts/Eyes';
import { Celebration, Pebble, QuestionBubble, Zzz } from './parts/Extras';
import { SideFin, TopFin } from './parts/Fins';
import { Tail } from './parts/Tail';

export type PlutusMood = 'happy' | 'thinking' | 'celebrating' | 'sleepy';

export interface PlutusProps {
  mood?: PlutusMood;
  size?: number;
  /** Idle animation. Always off when the user prefers reduced motion. */
  animated?: boolean;
  /** Set when nearby text already says what Plutus is doing. */
  decorative?: boolean;
  className?: string;
}

const MOTION: Record<PlutusMood, { animate: TargetAndTransition; transition: Transition }> = {
  happy: {
    animate: { y: [0, -4, 0] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  thinking: {
    animate: { rotate: [-4, 4, -4] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  celebrating: {
    animate: { y: [0, -18, 0, 0], rotate: [0, -6, 6, 0] },
    transition: { duration: 1.4, repeat: Infinity, times: [0, 0.3, 0.6, 1], ease: 'easeOut' },
  },
  sleepy: {
    animate: { scale: [1, 1.03, 1] },
    transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Plutus, the chubby blue fish with one gold coin scale. An original drawing. */
export function Plutus({
  mood = 'happy',
  size = 120,
  animated = true,
  decorative = false,
  className,
}: PlutusProps) {
  const reduceMotion = useReducedMotion();
  const live = animated && !reduceMotion;
  const m = MOTION[mood];

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      data-mood={mood}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': `Plutus the fish, ${mood}` })}
    >
      {mood === 'sleepy' && <Pebble />}
      <motion.g
        style={{ originX: 0.5, originY: 0.5 }}
        animate={live ? m.animate : undefined}
        transition={m.transition}
      >
        <g
          transform={
            mood === 'sleepy'
              ? 'translate(0 8)'
              : mood === 'thinking'
                ? 'rotate(-6 104 108)'
                : undefined
          }
        >
          <Tail animated={live} />
          <TopFin />
          <Body />
          <Coin />
          <Face mood={mood} />
          <SideFin
            animated={live && mood !== 'sleepy'}
            holding={mood === 'thinking' ? <Coin cx={132} cy={152} r={8} /> : undefined}
          />
        </g>
      </motion.g>
      {mood === 'happy' && <Bubbles animated={live} count={2} />}
      {mood === 'thinking' && <QuestionBubble />}
      {mood === 'celebrating' && (
        <>
          <Celebration animated={live} />
          <Bubbles animated={live} />
        </>
      )}
      {mood === 'sleepy' && <Zzz animated={live} />}
    </svg>
  );
}

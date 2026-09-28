import type { PlutusMood } from '../Plutus';
import { P } from './palette';

const LEFT = { x: 118, y: 98 };
const RIGHT = { x: 150, y: 98 };

function DotEye({
  x,
  y,
  look = { dx: 0, dy: 0 },
}: {
  x: number;
  y: number;
  look?: { dx: number; dy: number };
}) {
  return (
    <g>
      <circle cx={x + look.dx} cy={y + look.dy} r="9" fill={P.ink} />
      <circle cx={x + look.dx + 3} cy={y + look.dy - 3.5} r="3" fill={P.white} />
      <circle cx={x + look.dx - 3} cy={y + look.dy + 3} r="1.3" fill={P.white} opacity="0.8" />
    </g>
  );
}

const lineProps = {
  fill: 'none',
  stroke: P.ink,
  strokeWidth: 4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Eyes, blush and mouth for each mood. */
export function Face({ mood }: { mood: PlutusMood }) {
  return (
    <g>
      <ellipse cx="110" cy="116" rx="9" ry="5.5" fill={P.blush} opacity="0.9" />
      <ellipse cx="160" cy="116" rx="8" ry="5.5" fill={P.blush} opacity="0.9" />
      {mood === 'happy' && (
        <>
          <DotEye {...LEFT} />
          <DotEye {...RIGHT} />
          <path d="M129 112 q4 5 8 0 q4 5 8 0" {...lineProps} strokeWidth={3} />
        </>
      )}
      {mood === 'thinking' && (
        <>
          <DotEye {...LEFT} look={{ dx: 3, dy: -3 }} />
          <DotEye {...RIGHT} look={{ dx: 3, dy: -3 }} />
          <path d="M131 116 h11" {...lineProps} strokeWidth={3} />
        </>
      )}
      {mood === 'celebrating' && (
        <>
          <path d={`M${LEFT.x - 8} ${LEFT.y + 3} l8 -8 l8 8`} {...lineProps} />
          <path d={`M${RIGHT.x - 8} ${RIGHT.y + 3} l8 -8 l8 8`} {...lineProps} />
          <path
            d="M125 110 q12 16 24 0 z"
            fill={P.ink}
            stroke={P.ink}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M130 116 q7 5 14 0 q-7 -3 -14 0z" fill={P.blush} />
        </>
      )}
      {mood === 'sleepy' && (
        <>
          <path d={`M${LEFT.x - 8} ${LEFT.y} q8 7 16 0`} {...lineProps} />
          <path d={`M${RIGHT.x - 8} ${RIGHT.y} q8 7 16 0`} {...lineProps} />
          <ellipse cx="137" cy="116" rx="3.5" ry="4" fill={P.ink} />
        </>
      )}
    </g>
  );
}

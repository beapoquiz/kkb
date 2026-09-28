import { P } from './palette';

/** Plutus's gold coin-shaped scale: his "wealth" mark, present in every mood. */
export function Coin({ cx = 76, cy = 118, r = 12 }: { cx?: number; cy?: number; r?: number }) {
  const s = r / 12;
  return (
    <g data-part="coin">
      <circle cx={cx} cy={cy} r={r} fill={P.gold} stroke={P.goldDeep} strokeWidth={2.5 * s} />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.62}
        fill="none"
        stroke={P.goldDeep}
        strokeWidth={1.5 * s}
        opacity="0.6"
      />
      {/* tiny star shine */}
      <path
        d={`M${cx - 4 * s} ${cy - 5 * s} l${1.2 * s} ${2.4 * s} l${2.4 * s} ${1.2 * s} l${-2.4 * s} ${1.2 * s} l${-1.2 * s} ${2.4 * s} l${-1.2 * s} ${-2.4 * s} l${-2.4 * s} ${-1.2 * s} l${2.4 * s} ${-1.2 * s} Z`}
        fill={P.white}
      />
    </g>
  );
}

import { motion } from 'framer-motion';
import { P } from './palette';

const BUBBLES = [
  { cx: 176, cy: 70, r: 6, delay: 0 },
  { cx: 186, cy: 46, r: 4, delay: 1.1 },
  { cx: 170, cy: 30, r: 3, delay: 2.2 },
];

/** A few small bubbles. When animated they rise and fade now and then. */
export function Bubbles({ animated, count = 3 }: { animated: boolean; count?: number }) {
  return (
    <g>
      {BUBBLES.slice(0, count).map((b) => (
        <motion.circle
          key={b.cx}
          cx={b.cx}
          cy={b.cy}
          r={b.r}
          fill={P.white}
          stroke={P.outline}
          strokeOpacity="0.5"
          strokeWidth="2"
          animate={animated ? { y: [0, -24], opacity: [0, 1, 0] } : undefined}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            delay: b.delay,
            ease: 'easeOut',
            repeatDelay: 1,
          }}
        />
      ))}
    </g>
  );
}

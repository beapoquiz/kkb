import { motion } from 'framer-motion';
import { Coin } from './Coin';
import { P } from './palette';

/** "?" thought bubble for the thinking mood. */
export function QuestionBubble() {
  return (
    <g>
      <circle
        cx="160"
        cy="58"
        r="3"
        fill={P.white}
        stroke={P.outline}
        strokeOpacity="0.5"
        strokeWidth="2"
      />
      <circle
        cx="168"
        cy="46"
        r="4.5"
        fill={P.white}
        stroke={P.outline}
        strokeOpacity="0.5"
        strokeWidth="2"
      />
      <circle
        cx="178"
        cy="24"
        r="16"
        fill={P.white}
        stroke={P.outline}
        strokeOpacity="0.5"
        strokeWidth="2"
      />
      <text
        x="178"
        y="31"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fontFamily="Fredoka, sans-serif"
        fill={P.outline}
      >
        ?
      </text>
    </g>
  );
}

function Sparkle({
  x,
  y,
  size,
  delay,
  animated,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  animated: boolean;
}) {
  const s = size;
  return (
    <motion.path
      d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`}
      fill={P.gold}
      stroke={P.goldDeep}
      strokeWidth="1"
      animate={animated ? { scale: [0.6, 1.15, 0.6], opacity: [0.6, 1, 0.6] } : undefined}
      transition={{ duration: 1.4, repeat: Infinity, delay }}
      style={{ originX: 0.5, originY: 0.5 }}
    />
  );
}

/** Sparkles and little coins popping around Plutus when everything is settled. */
export function Celebration({ animated }: { animated: boolean }) {
  return (
    <g>
      <Sparkle x={34} y={40} size={10} delay={0} animated={animated} />
      <Sparkle x={176} y={36} size={12} delay={0.4} animated={animated} />
      <Sparkle x={184} y={140} size={8} delay={0.8} animated={animated} />
      <Sparkle x={20} y={160} size={7} delay={1.1} animated={animated} />
      <motion.g
        animate={animated ? { y: [0, -8, 0], rotate: [0, 12, 0] } : undefined}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <Coin cx={60} cy={30} r={8} />
      </motion.g>
      <motion.g
        animate={animated ? { y: [0, -6, 0], rotate: [0, -12, 0] } : undefined}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
      >
        <Coin cx={150} cy={22} r={7} />
      </motion.g>
    </g>
  );
}

/** "z z" bubbles for the sleepy mood. */
export function Zzz({ animated }: { animated: boolean }) {
  const letter = (x: number, y: number, size: number, delay: number) => (
    <motion.text
      x={x}
      y={y}
      fontSize={size}
      fontWeight="700"
      fontFamily="Fredoka, sans-serif"
      fill={P.outline}
      animate={animated ? { opacity: [0, 1, 0], y: [0, -8] } : undefined}
      transition={{ duration: 2.6, repeat: Infinity, delay }}
    >
      z
    </motion.text>
  );
  return (
    <g>
      <circle
        cx="172"
        cy="44"
        r="20"
        fill={P.white}
        stroke={P.outline}
        strokeOpacity="0.4"
        strokeWidth="2"
      />
      {letter(162, 52, 16, 0)}
      {letter(174, 42, 12, 0.8)}
    </g>
  );
}

/** The little sand mound and pebble he naps on. */
export function Pebble() {
  return (
    <g>
      <ellipse
        cx="100"
        cy="176"
        rx="78"
        ry="14"
        fill={P.sand}
        stroke={P.goldDeep}
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <ellipse
        cx="150"
        cy="172"
        rx="12"
        ry="7"
        fill="#E3DCD2"
        stroke={P.outline}
        strokeOpacity="0.3"
        strokeWidth="2"
      />
    </g>
  );
}

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { P, outline } from './palette';

/** A small rounded top fin. */
export function TopFin() {
  return <path d="M78 62 C80 44 96 36 110 42 C104 48 102 54 104 60" fill={P.body} {...outline} />;
}

/** The side fin flutters. `holding` is drawn at its tip (the coin in the thinking mood). */
export function SideFin({ animated, holding }: { animated: boolean; holding?: ReactNode }) {
  return (
    <motion.g
      style={{ originX: 0.1, originY: 0.2 }}
      animate={animated ? { rotate: [0, -14, 0] } : undefined}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path
        d="M104 131 C98 146 108 159 122 158 C131 157 129 146 120 137 C114 131 108 128 104 131 Z"
        fill={P.body}
        {...outline}
      />
      {holding}
    </motion.g>
  );
}

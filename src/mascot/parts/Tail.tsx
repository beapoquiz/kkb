import { motion } from 'framer-motion';
import { P, outline } from './palette';

/** Soft two-lobed tail that sways from where it meets the body. */
export function Tail({ animated }: { animated: boolean }) {
  return (
    <motion.g
      style={{ originX: 1, originY: 0.5 }}
      animate={animated ? { rotate: [-6, 6, -6] } : undefined}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path
        d="M52 108 C40 96 30 80 18 78 C8 77 6 92 14 102 C18 106 18 110 14 114 C6 124 8 139 18 138 C30 136 40 120 52 108 Z"
        fill={P.body}
        {...outline}
      />
      <path
        d="M22 90 C28 96 34 102 40 106"
        fill="none"
        stroke={P.outline}
        strokeOpacity="0.25"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 126 C28 120 34 114 40 110"
        fill="none"
        stroke={P.outline}
        strokeOpacity="0.25"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.g>
  );
}

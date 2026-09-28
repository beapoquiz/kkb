import { useId } from 'react';
import { P, outline } from './palette';

/** Chubby round body (about 1.2 : 1) with a lighter belly. Faces right. */
export function Body() {
  const clipId = `plutus-body-${useId().replace(/:/g, '')}`;
  return (
    <g>
      <ellipse cx="104" cy="108" rx="62" ry="52" fill={P.body} {...outline} />
      <clipPath id={clipId}>
        <ellipse cx="104" cy="108" rx="60" ry="50" />
      </clipPath>
      <ellipse cx="112" cy="140" rx="54" ry="30" fill={P.belly} clipPath={`url(#${clipId})`} />
      {/* soft shine on the forehead */}
      <ellipse
        cx="128"
        cy="72"
        rx="14"
        ry="6"
        fill={P.white}
        opacity="0.45"
        transform="rotate(-12 128 72)"
      />
    </g>
  );
}

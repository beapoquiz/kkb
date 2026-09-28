/** Plutus colors. They mirror the tokens in src/styles/tokens.css (SVG needs literal values). */
export const P = {
  body: '#7CC4F5',
  belly: '#CDE9FF',
  outline: '#2B6FA8',
  ink: '#3B3350',
  blush: '#FFC8DD',
  gold: '#F5C542',
  goldDeep: '#D9A21B',
  sand: '#FFF1B8',
  white: '#FFFFFF',
} as const;

export const outline = {
  stroke: P.outline,
  strokeOpacity: 0.4,
  strokeWidth: 3,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;

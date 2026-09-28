import { qrSvgDataUrl, slugify } from './qr';

describe('qr helpers', () => {
  it('slugifies event names for file names', () => {
    expect(slugify('Baguio Barkada Trip')).toBe('baguio-barkada-trip');
    expect(slugify('  Samgyup Friday!! 🍻 ')).toBe('samgyup-friday');
    expect(slugify('🎉🎉')).toBe('split');
  });

  it('renders a QR code as an SVG data URL', async () => {
    const url = await qrSvgDataUrl('https://beapoquiz.github.io/kkb/#/s/abc');
    expect(url.startsWith('data:image/svg+xml')).toBe(true);
    expect(decodeURIComponent(url)).toContain('<svg');
  });
});

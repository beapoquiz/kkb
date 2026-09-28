import QRCode from 'qrcode';

const INK = '#3B3350';

/** QR code as an SVG data URL (error correction M). */
export async function qrSvgDataUrl(text: string): Promise<string> {
  const svg = await QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: INK, light: '#FFFFFF' },
  });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'split';
}

/** A PNG with the QR code and the event name printed under it. */
export async function qrPngBlob(text: string, caption: string): Promise<Blob | null> {
  const size = 720;
  const pad = 48;
  const captionHeight = 110;
  const qr = document.createElement('canvas');
  await QRCode.toCanvas(qr, text, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: size - pad * 2,
    color: { dark: INK, light: '#FFFFFF' },
  });

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size + captionHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(qr, pad, pad);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = '600 40px Fredoka, Nunito, system-ui, sans-serif';
  ctx.fillText(caption, size / 2, size + 30, size - pad * 2);
  ctx.fillStyle = '#6B6280';
  ctx.font = '600 26px Nunito, system-ui, sans-serif';
  ctx.fillText('Scan to see who owes what · KKB', size / 2, size + 76, size - pad * 2);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** Saves a blob as a file via a temporary link. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

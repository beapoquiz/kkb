import { toast } from '../store/toast';

/** Copies text, falling back to a hidden textarea where the async clipboard API is missing. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path (e.g. an insecure context).
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Copies and confirms with a 'Copied!' toast. */
export async function copyWithToast(text: string) {
  const ok = await copyText(text);
  toast(ok ? 'Copied!' : "Couldn't copy. Try selecting the text instead.");
}

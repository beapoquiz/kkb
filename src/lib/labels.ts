import type { AvatarColor, AvatarEmoji, EventEmoji } from './schema';

/** Spoken names for emoji and colors, so emoji-only buttons always have a text label. */

export const EVENT_EMOJI_LABELS: Record<EventEmoji, string> = {
  '🏖️': 'Beach',
  '🍜': 'Noodles',
  '🎉': 'Party',
  '🏔️': 'Mountains',
  '✈️': 'Plane',
  '🍻': 'Drinks',
  '🎤': 'Karaoke',
  '🛒': 'Groceries',
  '🏠': 'House',
  '🎂': 'Birthday',
  '🚗': 'Road trip',
  '💼': 'Work',
};

export const AVATAR_EMOJI_LABELS: Record<AvatarEmoji, string> = {
  '🐱': 'Cat',
  '🐶': 'Dog',
  '🐰': 'Bunny',
  '🐻': 'Bear',
  '🐼': 'Panda',
  '🐨': 'Koala',
  '🦊': 'Fox',
  '🐸': 'Frog',
  '🐧': 'Penguin',
  '🐹': 'Hamster',
  '🦄': 'Unicorn',
  '🐙': 'Octopus',
};

export const AVATAR_COLOR_LABELS: Record<AvatarColor, string> = {
  '#FFC8DD': 'Pink',
  '#BDF0D8': 'Mint',
  '#D9CCFF': 'Lavender',
  '#FFF1B8': 'Butter',
  '#CDE9FF': 'Baby blue',
  '#FFD6C2': 'Peach',
  '#E3F5B8': 'Pistachio',
  '#F9D5F5': 'Lilac',
};

export const CURRENCY_LABELS = {
  PHP: 'PHP · Philippine peso',
  USD: 'USD · US dollar',
  EUR: 'EUR · Euro',
  JPY: 'JPY · Japanese yen',
  SGD: 'SGD · Singapore dollar',
  KRW: 'KRW · Korean won',
} as const;

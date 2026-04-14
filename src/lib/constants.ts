export const PAIRING_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const EMOJI_CATEGORIES = {
  hearts: ['🧡', '💛', '💚', '💙', '💜'],
  positive: ['😊', '🤗', '😌', '🤩', '🥰', '😎'],
  negative: ['😔', '😤', '🥺', '😬', '😢', '😡'],
  states: ['😴', '😂', '🥱', '😶', '🤔', '🫠'],
  vibes: ['✨', '🌙', '⚡', '🌊', '🔥', '🌿', '🌈', '❄️', '🍂', '🌸', '💫'],
  activities: ['🎶', '☕', '🍷', '💤', '💪', '🫶', '🎉', '😇', '🤒', '😵‍💫', '🙏', '💔', '🤤', '🍔'],
  body: ['🩸', '😣', '🫃', '💊', '🥵', '😮‍💨'],
  safety: ['🆘', '📍', '🚨', '😰', '🏠', '🚗'],
};

export const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat();

export const REPLY_EMOJIS = ['🤗', '💙', '✨', '🫶', '🙏'];

export const KISS_EMOJIS = ['😘', '💋', '😗', '😙', '😚'];

export const LOCATION_EMOJIS = ['📍'];

export function generatePairingCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += PAIRING_CHARSET[Math.floor(Math.random() * PAIRING_CHARSET.length)];
  }
  return code;
}

/**
 * Utility functions for social media text formatting.
 * Uses Mathematical Alphanumeric Symbols to simulate Bold and Italic on plain text platforms.
 */

// Offset calculations for Mathematical Sans-Serif Bold
const BOLD_UPPER_START = 0x1D5D4; // 𝗔
const BOLD_LOWER_START = 0x1D5EE; // 𝗮
const BOLD_DIGIT_START = 0x1D7E2; // 𝟬

// Offset calculations for Mathematical Sans-Serif Italic
const ITALIC_UPPER_START = 0x1D608; // 𝘈
const ITALIC_LOWER_START = 0x1D634; // 𝘢

export const toSocialBold = (text: string): string => {
  return text.split('').map(char => {
    const code = char.codePointAt(0);
    if (!code) return char;

    if (code >= 65 && code <= 90) { // A-Z
      return String.fromCodePoint(BOLD_UPPER_START + (code - 65));
    }
    if (code >= 97 && code <= 122) { // a-z
      return String.fromCodePoint(BOLD_LOWER_START + (code - 97));
    }
    if (code >= 48 && code <= 57) { // 0-9
      return String.fromCodePoint(BOLD_DIGIT_START + (code - 48));
    }
    return char;
  }).join('');
};

export const toSocialItalic = (text: string): string => {
  return text.split('').map(char => {
    const code = char.codePointAt(0);
    if (!code) return char;

    if (code >= 65 && code <= 90) { // A-Z
      return String.fromCodePoint(ITALIC_UPPER_START + (code - 65));
    }
    if (code >= 97 && code <= 122) { // a-z
      return String.fromCodePoint(ITALIC_LOWER_START + (code - 97));
    }
    return char;
  }).join('');
};

export const HEALTHCARE_EMOJIS = [
  '🏥', '🩺', '💊', '💉', '🧬', '🔬', '🩸', '🩻', '🧠', '🫀', '🚑', '👩‍⚕️', '👨‍⚕️', '🦠', '🧪', '📈', '🤝', '💡'
];
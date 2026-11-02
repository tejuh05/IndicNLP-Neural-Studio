/**
 * Bidirectional Transliterator for Kannada Unicode <-> Latin Romanized (ISO 15919 / Kanglish standard)
 */

// Independent Vowels
const VOWELS_TO_KANNADA: Record<string, string> = {
  'aa': 'ಆ', 'a': 'ಅ', 'ee': 'ಈ', 'ii': 'ಈ', 'i': 'ಇ',
  'oo': 'ಊ', 'uu': 'ಊ', 'u': 'ಉ', 'ru': 'ಋ',
  'ae': 'ಏ', 'e': 'ಎ', 'ai': 'ಐ',
  'oe': 'ಓ', 'o': 'ಒ', 'au': 'ಔ',
  'am': 'ಅಂ', 'aha': 'ಅಃ'
};

// Dependent Vowel Signs (Matras)
const MATRAS_TO_KANNADA: Record<string, string> = {
  'aa': 'ಾ', 'a': '', 'ee': 'ೀ', 'ii': 'ೀ', 'i': 'ಿ',
  'oo': 'ೂ', 'uu': 'ೂ', 'u': 'ು', 'ru': 'ೃ',
  'ae': 'ೇ', 'e': 'ೆ', 'ai': 'ೈ',
  'oe': 'ೋ', 'o': 'ೊ', 'au': 'ೌ',
  'am': 'ಂ', 'aha': 'ಃ'
};

// Consonants
const CONSONANTS_TO_KANNADA: Record<string, string> = {
  'kh': 'ಖ', 'k': 'ಕ',
  'gh': 'ಘ', 'g': 'ಗ',
  'ng': 'ಙ',
  'chh': 'ಛ', 'ch': 'ಚ',
  'jh': 'ಝ', 'j': 'ಜ',
  'ny': 'ಞ',
  'thh': 'ಥ', 'th': 'ತ',
  'dh': 'ಧ', 'd': 'ದ',
  't': 'ಟ', 'th_retro': 'ಠ',
  'd_retro': 'ಡ', 'dh_retro': 'ಢ',
  'n': 'ನ', 'N': 'ಣ',
  'ph': 'ಫ', 'p': 'ಪ',
  'bh': 'ಭ', 'b': 'ಬ',
  'm': 'ಮ',
  'y': 'ಯ', 'r': 'ರ', 'l': 'ಲ', 'v': 'ವ', 'w': 'ವ',
  'sh': 'ಶ', 'shh': 'ಷ', 's': 'ಸ', 'h': 'ಹ', 'L': 'ಳ'
};

// Reverse mappings
const KANNADA_TO_LATIN: Record<string, string> = {
  'ಅ': 'a', 'ಆ': 'aa', 'ಇ': 'i', 'ಈ': 'ee', 'ಉ': 'u', 'ಊ': 'oo', 'ಋ': 'ru',
  'ಎ': 'e', 'ಏ': 'ee', 'ಐ': 'ai', 'ಒ': 'o', 'ಓ': 'oo', 'ಔ': 'au',
  'ಕ': 'ka', 'ಖ': 'kha', 'ಗ': 'ga', 'ಘ': 'gha', 'ಙ': 'nga',
  'ಚ': 'cha', 'ಛ': 'chha', 'ಜ': 'ja', 'ಝ': 'jha', 'ಞ': 'nya',
  'ಟ': 'ta', 'ಠ': 'tha', 'ಡ': 'da', 'ಢ': 'dha', 'ಣ': 'na',
  'ತ': 'tha', 'ಥ': 'thha', 'ದ': 'da', 'ಧ': 'dha', 'ನ': 'na',
  'ಪ': 'pa', 'ಫ': 'pha', 'ಬ': 'ba', 'ಭ': 'bha', 'ಮ': 'ma',
  'ಯ': 'ya', 'ರ': 'ra', 'ಲ': 'la', 'ವ': 'va', 'ಶ': 'sha', 'ಷ': 'sha', 'ಸ': 'sa', 'ಹ': 'ha', 'ಳ': 'la',
  // Matras
  'ಾ': 'aa', 'ಿ': 'i', 'ೀ': 'ee', 'ು': 'u', 'ೂ': 'oo', 'ೃ': 'ru',
  'ೆ': 'e', 'ೇ': 'ee', 'ೈ': 'ai', 'ೊ': 'o', 'ೋ': 'oo', 'ೌ': 'au',
  'ಂ': 'm', 'ಃ': 'h', '್': ''
};

// Curated dictionary for common Kanglish vocabulary transliteration
const COMMON_KANGLISH_WORDS: Record<string, string> = {
  'college-ge': 'ಕಾಲೇಜಿಗೆ',
  'collegege': 'ಕಾಲೇಜಿಗೆ',
  'meeting-alli': 'ಮೀಟಿಂಗ್ನಲ್ಲಿ',
  'meetingalli': 'ಮೀಟಿಂಗ್ನಲ್ಲಿ',
  'open-maadi': 'ಓಪನ್ ಮಾಡಿ',
  'openmaadi': 'ಓಪನ್ ಮಾಡಿ',
  'finish-aagide': 'ಫಿನಿಶ್ ಆಗಿದೆ',
  'finishaagide': 'ಫಿನಿಶ್ ಆಗಿದೆ',
  'complete-aagidya': 'ಕಂಪ್ಲೀಟ್ ಆಗಿದ್ಯಾ',
  'completeaagidya': 'ಕಂಪ್ಲೀಟ್ ಆಗಿದ್ಯಾ',
  'send-maadbeku': 'ಸೆಂಡ್ ಮಾಡ್ಬೇಕು',
  'sendmaadbeku': 'ಸೆಂಡ್ ಮಾಡ್ಬೇಕು',
  'bus-inda': 'ಬಸ್ನಿಂದ',
  'businda': 'ಬಸ್ನಿಂದ',
  'file-annu': 'ಫೈಲನ್ನು',
  'fileannu': 'ಫೈಲನ್ನು',
  'link-annu': 'ಲಿಂಕ್ಅನ್ನು',
  'linkannu': 'ಲಿಂಕ್ಅನ್ನು',
  'attend-aagthini': 'ಅಟೆಂಡ್ ಆಗ್ತೀನಿ',
  'attendaagthini': 'ಅಟೆಂಡ್ ಆಗ್ತೀನಿ',
  'bengaluru-ge': 'ಬೆಂಗಳೂರಿಗೆ',
  'bengaluruge': 'ಬೆಂಗಳೂರಿಗೆ',
  'office-alli': 'ಆಫೀಸ್ನಲ್ಲಿ',
  'officealli': 'ಆಫೀಸ್ನಲ್ಲಿ',
  'chennagi': 'ಚೆನ್ನಾಗಿ',
  'namaskara': 'ನಮಸ್ಕಾರ',
  'hegiddira': 'ಹೇಗಿದ್ದೀರಾ',
  'hege': 'ಹೇಗೆ',
  'idira': 'ಇದ್ದೀರಾ',
  'beku': 'ಬೇಕು',
  'illa': 'ಇಲ್ಲ',
  'aagide': 'ಆಗಿದೆ',
  'maadi': 'ಮಾಡಿ',
  'maadona': 'ಮಾಡೋಣ',
  'hogona': 'ಹೋಗೋಣ',
  'eevatthu': 'ಈವತ್ತು',
  'naale': 'ನಾಳೆ',
  'ninne': 'ನಿನ್ನೆ',
  'oota': 'ಊಟ',
  'kelsa': 'ಕೆಲಸ',
  'mane': 'ಮನೆ',
  'yavaga': 'ಯಾವಾಗ',
  'yaake': 'ಯಾಕೆ',
  'enu': 'ಏನು',
  'nange': 'ನಂಗೆ',
  'nimge': 'ನಿಮ್ಗೆ',
  'haudu': 'ಹೌದು'
};

/**
 * Transliterates Latin Romanized text to Kannada script
 */
export function transliterateToKannada(text: string): string {
  if (!text) return '';
  const lower = text.toLowerCase().trim();

  // Check common code-mixed dictionary first
  if (COMMON_KANGLISH_WORDS[lower]) {
    return COMMON_KANGLISH_WORDS[lower];
  }

  // Handle hyphenated compound like "College-ge"
  if (lower.includes('-')) {
    const parts = lower.split('-');
    return parts.map(p => transliterateWordToKannada(p)).join('-');
  }

  return transliterateWordToKannada(lower);
}

function transliterateWordToKannada(word: string): string {
  let result = '';
  let i = 0;

  while (i < word.length) {
    // Check 3-char sequences (e.g. 'aha', 'chh', 'shh', 'thh')
    const three = word.substring(i, i + 3);
    const two = word.substring(i, i + 2);
    const one = word.substring(i, i + 1);

    if (i === 0 && VOWELS_TO_KANNADA[three]) {
      result += VOWELS_TO_KANNADA[three];
      i += 3;
      continue;
    }
    if (i === 0 && VOWELS_TO_KANNADA[two]) {
      result += VOWELS_TO_KANNADA[two];
      i += 2;
      continue;
    }
    if (i === 0 && VOWELS_TO_KANNADA[one]) {
      result += VOWELS_TO_KANNADA[one];
      i += 1;
      continue;
    }

    // Check consonant
    let matchedConsonant = '';
    let consLen = 0;
    if (CONSONANTS_TO_KANNADA[three]) {
      matchedConsonant = CONSONANTS_TO_KANNADA[three];
      consLen = 3;
    } else if (CONSONANTS_TO_KANNADA[two]) {
      matchedConsonant = CONSONANTS_TO_KANNADA[two];
      consLen = 2;
    } else if (CONSONANTS_TO_KANNADA[one]) {
      matchedConsonant = CONSONANTS_TO_KANNADA[one];
      consLen = 1;
    }

    if (matchedConsonant) {
      i += consLen;
      // Look ahead for vowel sign
      const vTwo = word.substring(i, i + 2);
      const vOne = word.substring(i, i + 1);

      if (MATRAS_TO_KANNADA[vTwo] !== undefined) {
        result += matchedConsonant + MATRAS_TO_KANNADA[vTwo];
        i += 2;
      } else if (MATRAS_TO_KANNADA[vOne] !== undefined) {
        result += matchedConsonant + MATRAS_TO_KANNADA[vOne];
        i += 1;
      } else {
        // Halant (pure consonant) if followed by another consonant or end of word
        result += matchedConsonant + '್';
      }
      continue;
    }

    // Pass through unmapped characters
    result += word[i];
    i++;
  }

  // Clean trailing halant for informal vocalic endings
  return result.replace(/್$/, '');
}

/**
 * Transliterates Kannada Unicode text to Latin Romanized string
 */
export function transliterateToLatin(kannadaText: string): string {
  if (!kannadaText) return '';
  let result = '';

  for (let i = 0; i < kannadaText.length; i++) {
    const char = kannadaText[i];
    if (KANNADA_TO_LATIN[char] !== undefined) {
      result += KANNADA_TO_LATIN[char];
    } else {
      result += char;
    }
  }

  return result;
}

// Load language preference safely
const basics = JSON.parse(localStorage.getItem('basics')) || {};
const { language } = basics || {};

// Helper: Convert Bengali/Arabic digits to English
const digits = (str) => {
  const conversionMap = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
  };

  return str
    .split('')
    .map((char) => conversionMap[char] || char)
    .join('');
};

// Convert Bengali/Arabic digits inside a string → English number
export const convertDigit = (str) => {
  if (!str) return null;

  // Matches Bengali, Arabic, or English digits
  const combinedRegex = /[০-৯٠-٩0-9]/gu;
  const matchedDigits = str.match(combinedRegex);

  if (!matchedDigits) return null;

  const combinedNumber = matchedDigits.join('');
  return digits(combinedNumber);
};

// Convert numbers → localized digits (Bengali / Arabic / English)
export const convertToBengaliDigits = (input) => {
  if (input == null) return '';

  let map;

  switch (language) {
    case 'bn':
      map = {
        0: '০',
        1: '১',
        2: '২',
        3: '৩',
        4: '৪',
        5: '৫',
        6: '৬',
        7: '৭',
        8: '৮',
        9: '৯',
      };
      break;

    case 'ar':
      map = {
        0: '٠',
        1: '١',
        2: '٢',
        3: '٣',
        4: '٤',
        5: '٥',
        6: '٦',
        7: '٧',
        8: '٨',
        9: '٩',
      };
      break;

    default:
      map = {
        0: '0',
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
        9: '9',
      };
  }

  return input.toString().replace(/\d/g, (digit) => map[digit]);
};

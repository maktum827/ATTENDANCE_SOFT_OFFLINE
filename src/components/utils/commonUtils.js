import axios from 'axios';
import { BASE_URL_FLASK } from '../../constants/othersConstants';

// Get past ten years as an array
export const getPastTenYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear - i);
};

// Check if a string contains non-ASCII characters (e.g., Bengali, Arabic)
export const containsNonLanguageLetter = (text) => {
  // Matches any character that is NOT in the Latin script
  const nonLatinRegex = /[^\p{Script=Latin}]/u;
  return nonLatinRegex.test(text);
};

export const calculateSMSCount = (text) => {
  const batchSize = containsNonLanguageLetter(text) ? 60 : 150;
  const messageCount = Math.ceil(text.length / batchSize) || 1;
  return messageCount;
};

export const stripHtmlTags = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import bnTranslations from '../locales/bn.json';
import arTranslations from '../locales/ar.json';

// Retrieve the saved language from local storage
const { language } = JSON.parse(localStorage.getItem('basics')) || {};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    bn: { translation: bnTranslations },
    ar: { translation: arTranslations },
  },
  lng: language, // Default language
  fallbackLng: 'bn',
  interpolation: {
    escapeValue: false,
  },
});

// Function to change the language
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);

  // Set the lang cookie
  document.cookie = `lang=${lng}; path=/`;

  const basics = JSON.parse(localStorage.getItem('basics')) || {};
  basics.language = lng;
  localStorage.setItem('basics', JSON.stringify(basics));
};

export default i18n;

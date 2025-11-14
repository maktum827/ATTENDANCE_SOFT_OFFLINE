// Retrieve the data
const basics = JSON.parse(localStorage.getItem('basics')) || {};
const { language } = basics;

export const getFontFamily = () => {
  switch (language) {
    case 'bn':
      return 'SolaimanLipi, sans-serif';
    case 'en':
      return 'Inter, sans-serif';
    default:
      return 'SolaimanLipi, sans-serif';
  }
};

export const fontFamily = getFontFamily(language);

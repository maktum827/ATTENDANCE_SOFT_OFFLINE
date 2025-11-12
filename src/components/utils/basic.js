// Retrieve the data
const basics = JSON.parse(localStorage.getItem('basics')) || {};
const { language } = basics;

export const getFontFamily = () => {
  switch (language) {
    case 'bn':
      return 'SolaimanLipi_font, sans-serif';
    case 'en':
      return 'Inter_font, sans-serif';
    default:
      return 'SolaimanLipi_font, sans-serif';
  }
};

export const fontFamily = getFontFamily(language);

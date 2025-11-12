const basics = JSON.parse(localStorage.getItem('basics')) || {};
const { language, academyType } = basics;

// Function to convert Western numerals to Bengali numerals
const convertToBengaliNumerals = (num) => {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((digit) => bengaliNumerals[digit] || digit)
    .join('');
};

const MONTHS_BENGALI = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];
const MONTHS_ENGLISH = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Just years
const formatDateYear = (year, language) => {
  if (language === 'bn') {
    const bengaliYear = convertToBengaliNumerals(year);
    return `${bengaliYear}`;
  } else {
    return `${year}`;
  }
};

const generateFormattedDatesYear = (language) => {
  const dates = [];
  const currentDate = new Date();
  let currentYear = currentDate.getFullYear();

  for (let i = 0; i < 10; i++) {
    // Generate previous 10 years
    const formattedDate = formatDateYear(currentYear, language);
    dates.push(formattedDate);

    // Move to the previous year
    currentYear--;
  }

  return dates;
};
// Example usage
const formattedDatesYear = generateFormattedDatesYear(language);

// month-year
const formatDate = (month, year, language) => {
  if (language === 'bn') {
    const bengaliYear = convertToBengaliNumerals(year);
    return `${MONTHS_BENGALI[month]}-${bengaliYear}`;
  } else {
    return `${MONTHS_ENGLISH[month]}-${year}`;
  }
};

const generateFormattedDates = (language) => {
  const dates = {};
  const currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  for (let i = 0; i < 24; i++) {
    const formattedDate = formatDate(currentMonth, currentYear, language);
    dates[`${currentMonth + 1}-${currentYear}`] = formattedDate;

    // Move to the previous month
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11; // December
      currentYear--; // Move to the previous year
    }
  }

  return dates;
};

// Generate the formatted dates object
const formattedDates = generateFormattedDates(language);

const shifts = [
  'সকালের শিফট',
  'দিনের শিফট',
  'দুপুরের শিফট',
  'সন্ধ্যার শিফট',
  'রাতের শিফট',
  'মধ্যরাতের শিফট',
  'গভীর রাতের শিফট',
  'ভোরের শিফট',
  'বিভক্ত শিফট',
  'পালাক্রমে পরিবর্তনশীল শিফট',
  'পূর্ণদিবস শিফট',
  'অর্ধদিবস শিফট',
  'সপ্তাহান্তের শিফট',
  'কাস্টম শিফট',
];

// Define months with label and value
const months_values = (t) => [
  { label: t('January'), value: 'January' },
  { label: t('February'), value: 'February' },
  { label: t('March'), value: 'March' },
  { label: t('April'), value: 'April' },
  { label: t('May'), value: 'May' },
  { label: t('June'), value: 'June' },
  { label: t('July'), value: 'July' },
  { label: t('August'), value: 'August' },
  { label: t('September'), value: 'September' },
  { label: t('October'), value: 'October' },
  { label: t('November'), value: 'November' },
  { label: t('December'), value: 'December' },
];

// Export the objects
export { formattedDates, formattedDatesYear, months_values, shifts };

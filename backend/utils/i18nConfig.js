import path from 'path';
import i18n from 'i18n';
import { fileURLToPath } from 'url';
import { locales } from './helper';

i18n.configure({
  locales: ['bn', 'bn_g', 'en', 'ar'],
  directory: locales, // Adjust the path to your locale files
  defaultLocale: 'bn',
  autoReload: false,
  updateFiles: false,
  syncFiles: true,
  cookie: 'i18n',
});

export { i18n };

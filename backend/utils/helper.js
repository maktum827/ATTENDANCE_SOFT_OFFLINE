import fs from 'fs';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { app } from 'electron';
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const locales =
  process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../assets/locales')
    : path.join(process.resourcesPath, 'assets/locales');

export const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://tanzimit.com';

export const public_path =
  process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../assets')
    : path.join(process.resourcesPath, 'assets');
export function getSamplePath(relativePath) {
  const url = relativePath.replace('static://', '');
  const filepath = path.join(public_path, url);
  return filepath;
}

// pdf path
export const pdfPath =
  process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, 'output.pdf')
    : path.resolve(process.resourcesPath, 'output.pdf');

// Helper: Convert file to Base64
export function getBase64(filePath) {
  try {
    return fs.existsSync(filePath)
      ? fs.readFileSync(filePath).toString('base64')
      : '';
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    return '';
  }
}

function getChromePath() {
  const possiblePaths = [
    configData.chrome_path,
    configData.chrome_path2,
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  ];

  return possiblePaths.find((path) => fs.existsSync(path)) || null;
}

// Helper: Launch Puppeteer with environment-based configuration
export async function launchBrowser() {
  if (process.env.NODE_ENV === 'development') {
    return puppeteer.launch();
  } else {
    const chromiumPath = puppeteer.executablePath();
    return puppeteer.launch({
      executablePath: getChromePath(),
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
  }
}

// Helper: Get current date in YYYY-MM-DD format
export const today = new Date().toISOString().split('T')[0];
export const currentYear = new Date().getFullYear();

// static files path
export const static_path = app.getPath('userData');

// static path
const static_folder = path.join(static_path, 'uploads');
// Check if the folder exists, if not, create it
if (!fs.existsSync(static_folder)) {
  fs.mkdirSync(static_folder, { recursive: true });
}

export function getFilePath(relativePath) {
  const filepath = path.join(static_folder, relativePath);
  return filepath;
}

const configFilePath = path.join(static_path, 'uploads/config_tm.json');

// Default configuration object
const defaultConfig = {
  user_info: {
    code: '',
    name: '',
    address: '',
    english_name: '',
    english_address: '',
    academy_type: '',
    number_of_students: '',
    mobile: '',
    email: '',
    logo_url: '',
    calligraphy_url: '',
    academy_photo_url: '',
  },
  chrome_path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  chrome_path2:
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
};

// Check if the config file exists
if (!fs.existsSync(configFilePath)) {
  // Create a new file with default content if it doesn't exist
  fs.writeFileSync(
    configFilePath,
    JSON.stringify(defaultConfig, null, 2),
    'utf8',
  );
}

// Read the existing config file
export const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

// Encrypt for activation
export function encrypt(text, key) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

export function decrypt(text, key) {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(text, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function getGraceEndTime(rule) {
  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(`${today}T${rule.start_time}`);
  return new Date(start.getTime() + rule.grace_period * 60 * 1000);
}

export function getAbsentStudents(rule, attendances, students) {
  const present = new Set(
    attendances
      .filter(
        (a) =>
          a.code === rule.code &&
          a.condition === rule.condition &&
          a.shift === rule.shift_name &&
          rule.users.includes(a.class_designation),
      )
      .map((a) => `${a.class_designation}_${a.id_no}`),
  );

  return students
    .filter((s) => rule.users.includes(s.class_designation))
    .filter((s) => !present.has(`${s.class_designation}_${s.id_no}`));
}

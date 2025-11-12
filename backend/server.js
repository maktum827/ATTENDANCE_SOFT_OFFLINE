import path from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import { i18n } from './utils/i18nConfig.js';
import errorMiddleware from './middlewares/errors.js';
import pdfRoutes from './routes/pdfRoutes.js';
import { __dirname, static_path } from './utils/helper.js';
dotenv.config();

export default () => {
  const app = express();
  const port = 4009;

  // can load files in the same directory as server.js
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:1212'
          : 'file://',
      credentials: true,
    }),
  );

  // Register modules
  app.use(cookieParser());

  app.use(bodyParser.json());
  app.use(express.json()); // For parsing application/json
  app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

  // static path
  const static_folder = path.join(static_path, 'uploads');
  app.use('/uploads', express.static(static_folder));

  // Define Middleware to handle Errors
  app.use(errorMiddleware);

  // // Define middleware to handle localization
  app.use(i18n.init);

  app.listen(port, () =>
    console.log(`server.js app listening on port ${port}!`),
  );

  const configFilePath = path.resolve(static_folder, 'config_tm.json');
  const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

  // const localDb = path.resolve(static_folder, 'local_db.db');

  app.get('/api/load_user', async (req, res) => {
    try {
      // get local machine ip
      const interfaces = os.networkInterfaces();
      let localIP = '';

      for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
          if (alias.family === 'IPv4' && !alias.internal) {
            localIP = alias.address;
            break;
          }
        }
      }

      // get the user information
      const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

      const data = {
        localIP: localIP,
        ...configData.user_info,
      };

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error('Error loading configuration:', error);
      return res.status(500).json({ message: 'Failed to load configuration.' });
    }
  });

  app.use('/api/pdf', pdfRoutes);

  app.post('/api/connect_user', async (req, res) => {
    const {
      code,
      name,
      address,
      english_name,
      english_address,
      academy_type,
      number_of_students,
      mobile,
      email,
      logo_url,
      calligraphy_url,
      academy_photo_url,
    } = req.body;

    try {
      const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

      // Update the configuration object
      configData.user_info = {
        code: code,
        name: name,
        address: address,
        english_name: english_name,
        english_address: english_address,
        academy_type: academy_type,
        number_of_students: number_of_students,
        mobile: mobile,
        email: email,
        logo_url: logo_url,
        calligraphy_url: calligraphy_url,
        academy_photo_url: academy_photo_url,
      };

      // Write the updated config back to the file
      fs.writeFileSync(
        configFilePath,
        JSON.stringify(configData, null, 2),
        'utf8',
      );

      res.status(200).json({
        success: true,
        message: 'Software connected successfully.',
      });
    } catch (error) {
      console.log(error);

      console.error('Error updating configuration file:', error);
      return res
        .status(500)
        .json({ message: 'Failed to update configuration.' });
    }
  });

  // // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.log(`ERROR: ${err.stack}`);
    console.log(`Shutting down the server due to uncaught exceptions`);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(`ERROR: ${err.stack}`);
    console.log(`Shutting down the server due to unhandled Promise Rejection`);
    server.close(() => {
      process.exit(1);
    });
  });
};

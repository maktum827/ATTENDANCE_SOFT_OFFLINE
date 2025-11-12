import { i18n } from '../utils/i18nConfig.js';
import path from 'path';
import fs from 'fs';
import {
  convertDigits,
  convertToEnglishDigits,
} from '../utils/digitConverter.js';
import {
  __dirname,
  __filename,
  BASE_URL,
  getFilePath,
} from '../utils/helper.js';

export const PadHeader = (info, locale) => {
  return `
            <html>
                <head>
                    <style>
                        .header {
                            text-align: center;
                            margin-bottom: 10px;
                            width: 100%;
                        }

                        .header-content {
                            border-bottom: 1.5px dotted black;
                            padding-bottom: 5px;
                        }

                        .flex-container {
                            margin-top: 2px;
                            width: 100%;
                            display: flex;
                            justify-content: space-between;
                        }

                        .header-text {
                            font-family: 'SolaimanLipi', sans-serif;
                        }

                        .english-text {
                            font-family: 'Times';
                            text-transform: uppercase;
                            font-size: 13px;
                            line-height: 1.4;
                        }

                        .heading {
                            font-family: 'SolaimanLipi', sans-serif;
                            font-size: 20px;
                            background: whitesmoke;
                            padding: 0 10px;
                            border-radius: 3px;
                        }

                        .info-text {
                            font-family: 'SolaimanLipi', sans-serif;
                            font-size: 13px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="header-content">
                            <img style="height: 35px" src="${BASE_URL}${info.academy.calligraphy_url}" alt="calligraphy"/>
                            <div class="flex-container">
                                <div style="width: 45%; text-align: right;">
                                    <span class="header-text" style="font-size: 15px">${info.academy.name}</span><br/>
                                    <span class="header-text" style="font-size: 13px">${info.academy.address}</span><br/>
                                    <span class="header-text" style="font-size: 13px">${convertDigits(info.academy.mobile, locale)}</span>
                                </div>
                                <img style="width: 50px; height: 50px" src="${BASE_URL}${info.academy.logo_url}" alt="logo"/>
                                <span class="english-text" style="width: 45%; text-align: left;">
                                    ${info.academy.english_name}<br/>
                                    <span style="font-size: 12px;">${info.academy.english_address}</span><br/>
                                    ${info.academy.mobile}
                                </span>
                            </div>
                        </div>
                        <div class="flex-container" style="margin-top: 5px;">
                            ${
                              info.department
                                ? `<span class="info-text" style="width: 185px;">${i18n.__('department')}: ${info.department}</span>`
                                : `<span style="width: 185px;"></span>`
                            }
                            <span class="heading">${convertDigits(info.heading, locale)}</span>
                            ${
                              info.date
                                ? `<span class="info-text" style="width: 185px;">${i18n.__('date')}: ${info.date}</span>`
                                : `<span style="width: 185px;"></span>`
                            }
                        </div>
                    </div>
                </body>
            </html>
        `;
};

export const SimpleHeader = (info, locale) => {
  const calligraphyPath = getFilePath(info.academy.calligraphy_url);
  const calligraphyBase64 = fs.existsSync(calligraphyPath)
    ? fs.readFileSync(calligraphyPath).toString('base64')
    : '';

  return `
        <header>
            <div class="content" style="border-bottom: 1.5px dotted black; padding-bottom: 5px;">
                <img style="width: 60%; height: 35px" src="data:image/jpeg;base64,${calligraphyBase64}" alt="calligraphy"/>
                <span class="academy-name" style="font-size: 15px">${info.academy.name}</span>
                <span class="academy-address" style="font-size: 13px">${info.academy.address}</span>
                <span class="academy-mobile" style="font-size: 13px">${convertDigits(info.academy.mobile, locale)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px">
                ${
                  info.department
                    ? `<span class="department">${i18n.__('department')}: ${info.department}</span>`
                    : `<span style="width: 185px"></span>`
                }
                <span class="heading">${convertDigits(info.heading, locale)}</span>
                ${
                  info.date
                    ? `<span class="date">${i18n.__('date')}: ${info.date}</span>`
                    : `<span style="width: 185px"></span>`
                }
            </div>
        </header>
        <style>
            header {
                text-align: center;
                margin-bottom: 10px;
            }

            .content {
                display: flex;
                flex-direction: column;
                align-items: center;
                font-family: 'SolaimanLipi', sans-serif;
            }

            .academy-name, .academy-address, .academy-mobile {
                font-family: 'SolaimanLipi', sans-serif;
            }

            .department, .heading, .date {
                font-family: 'SolaimanLipi', sans-serif;
            }

            .heading {
                font-size: 20px;
                background: whitesmoke;
                padding-left: 10px;
                padding-right: 10px;
                border-radius: 3px;
            }

            .department, .date {
                font-size: 13px;
            }
        </style>
    `;
};

export const ResultHeader = (info, locale) => {
  const logoPath = getFilePath(info.academy.logo_url);
  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath).toString('base64')
    : '';

  const calligraphyPath = getFilePath(info.academy.calligraphy_url);
  const calligraphyBase64 = fs.existsSync(calligraphyPath)
    ? fs.readFileSync(calligraphyPath).toString('base64')
    : '';

  const total_subject = info.columns.length - 8;
  const grades = info.grades;

  const generateRow = ({ to, from, grade }) => {
    const result = parseFloat(from) * parseInt(total_subject, 10);

    return `
            <tr>
                <td style="border: 0.5px solid #ddd; padding-left: 3px">${grade}</td>
                ${
                  info.system === 'parcentageSystem'
                    ? `<td style="border: 0.5px solid #ddd; padding-left: 3px">
                                ${convertDigits(from, locale)} x ${convertDigits(total_subject, locale)} = ${convertDigits(result, locale)}
                            </td>`
                    : `<td style="border: 0.5px solid #ddd; padding-left: 3px">
                                ${convertDigits(from, locale)} - ${convertDigits(to, locale)}
                            </td>`
                }
            </tr>
        `;
  };

  return `
        <div style="display: flex; width: 100%; align-items: center; text-align: center; justify-content: space-between; margin-left: 10px; margin-right: 10px">
            <div style="width: 18%">
                <img style="width: 60px; height: 60px" src="data:image/jpeg;base64,${logoBase64}" alt="logo" />
            </div>
            <div style="padding-bottom: 5px; display: flex; flex-direction: column; align-items: center">
                <img style="width: 80%; height: 35px" src="data:image/jpeg;base64,${calligraphyBase64}" alt="calligraphy" class="calligraphy" />
                <span class="academy-name">${info.academy.name}</span>
                <span class="academy-address">${info.academy.address}</span>
                <span class="exam-info">${info.heading.selectedExamName} | ${i18n.__('class')}: ${info.heading.selectedClass}</span>
            </div>
            <div style="width: 18%; margin-right: 15px">
                <table style="width: 150px; border-collapse: collapse; font-family: 'SolaimanLipi'; font-size: 8px">
                    <thead style="background-color: #f2f2f2;">
                        <tr>
                            <th style="border: 1px solid #ddd" colspan="2">${i18n.__('gradeMarks')}</th>
                        </tr>
                    </thead>
                    <tbody style="text-align: left">
                        <tr>
                            ${
                              info.system === 'parcentageSystem'
                                ? `<td style="border: 1px solid #ddd; padding-left: 3px">
                                            ${i18n.__('totalSubject')} ${convertDigits(total_subject, locale)} ${i18n.__('the')}
                                        </td>
                                        <td style="border: 1px solid #ddd; padding-left: 3px">
                                            ${convertDigits(convertToEnglishDigits(info.heading.numberPerSubject), locale)} x ${convertDigits(total_subject, locale)} = ${convertDigits(convertToEnglishDigits(info.heading.numberPerSubject) * total_subject, locale)}
                                        </td>`
                                : ``
                            }
                        </tr>
                        ${grades.map(generateRow).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <style>
            .academy-name, .academy-address, .exam-info {
                font-family: 'SolaimanLipi', sans-serif;
                font-size: 18px;
            }

            .exam-info {
                font-size: 18px;
                border-bottom: 1.5px dotted black;
            }

            table {
                font-family: 'SolaimanLipi', sans-serif;
            }
        </style>
    `;
};

export const VerySimpleHeader = (info, locale) => {
  const calligraphyPath = getFilePath(info.academy.calligraphy_url);
  const calligraphyBase64 = fs.existsSync(calligraphyPath)
    ? fs.readFileSync(calligraphyPath).toString('base64')
    : '';

  return `
      <header>
          <div class="content" style="padding-bottom: 5px;">
              <img style="width: 60%; height: 35px" src="data:image/jpeg;base64,${calligraphyBase64}" alt="calligraphy"/>
              <span class="academy-name">${info.academy.name}</span>
              <span class="subtitle">${info.academy.address}</span>
              <span class="subtitle">${convertDigits(info.academy.mobile, locale)}</span>
          </div>
      </header>
      <style>
          @font-face {
            font-family: 'SolaimanLipi';
          }

          header {
              text-align: center;
              margin-bottom: 10px;
          }

          .content {
              display: flex;
              flex-direction: column;
              align-items: center;
          }

          .academy-name {
              font-size: 20px;
              font-weight: bold;
              color: darkblue;
          }

          .subtitle {
              font-size: 15px;
              color: darkgreen;
          }
      </style>
  `;
};

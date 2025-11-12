import { i18n } from '../utils/i18nConfig.js'; // Adjust the path as needed
import path from 'path';
import fs from 'fs';
import { __dirname, __filename, getBase64, getFilePath } from '../utils/helper.js';

export const ResultFooter = (text) => {
    return `
            <html>
                <head>
                    <style>
                        .footer {
                            width: 100%;
                            display: flex;
                            justify-content: space-between;
                            text-align: center;
                            font-family: 'SolaimanLipi', sans-serif;
                        }
                    </style>
                </head>
                <body>
                    <div class="footer">
                        <div style="font-size: 10px; margin-left: 10mm">
                            <span>${i18n.__('page')}: <span class="pageNumber"></span> / <span class="totalPages"></span></span>
                        </div>
                        <div style="font-size: 15px; margin-right: 10mm">
                            <span>${text}</span>
                        </div>
                    </div>
                </body>
            </html>
        `;
};

export const PageCountFooter = () => {
    return `
        <html>
            <head>
                <style>
                    .footer {
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        text-align: center;
                        font-family: 'SolaimanLipi', sans-serif;
                        font-size: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="footer">
                    <span>${i18n.__('page')}: <span class="pageNumber"></span> / <span class="totalPages"></span></span>
                </div>
            </body>
        </html>
    `;
};

export const SignFooter = async(leftImage, rightImage, leftText, rightText, nowPageCount) => {

    const leftImagePath = leftImage ? getFilePath(leftImage) : null;
    const leftImageBase64 = getBase64(leftImagePath);

    const rightImagePath = rightImage ? getFilePath(rightImage) : null;
    const rightImageBase64 = getBase64(rightImagePath);

    return `
        <html>
            <head>
                <style>
                    .footer {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 10px;
                        font-family: 'SolaimanLipi', sans-serif;
                        font-size: 10px;
                    }

                    .footer-center {
                        width: 40%;
                        display: flex;
                        justify-content: center;
                        text-align: center;
                    }

                    .footer img {
                        width: 80px;
                        height: 35px;
                    }
                </style>
            </head>
            <body>
                <div class="footer">
                    <div style="margin-left: 10mm;">
                        ${leftImage
            ? `<img src="data:image/jpeg;base64,${leftImageBase64}" alt="Left Sign"/>`
            : `<span>${leftText}</span>`
        }
                    </div>
                    <div class="footer-center">
                        ${nowPageCount
            ? ''
            : `<span>${i18n.__('page')}: <span class="pageNumber"></span> / <span class="totalPages"></span></span>`
        }
                    </div>
                    <div style="margin-right: 10mm;">
                        ${rightImage
            ? `<img src="data:image/jpeg;base64,${rightImageBase64}" alt="Right Sign"/>`
            : `<span>${rightText}</span>`
        }
                    </div>
                </div>
            </body>
        </html>
    `;
};


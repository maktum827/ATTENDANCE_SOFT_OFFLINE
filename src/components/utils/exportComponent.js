// utils/exportComponent.js
import ReactDOMServer from 'react-dom/server';

const { remote } = window.require('electron');
const fs = window.require('fs');
const { dialog, BrowserWindow } = remote;

const downloadComponentAsPDF = async (
  Component,
  props = {},
  defaultFileName = 'report.pdf',
) => {
  if (!Component) throw new Error('Component is required');

  const componentHTML = ReactDOMServer.renderToStaticMarkup(
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Component {...props} />,
  );

  const win = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: true },
  });
  await win.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(componentHTML)}`,
  );

  const pdfData = await win.webContents.printToPDF({});

  const { filePath } = await dialog.showSaveDialog({
    title: 'Save PDF',
    defaultPath: defaultFileName,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (filePath) fs.writeFileSync(filePath, pdfData);
  win.close();
};

export default downloadComponentAsPDF;

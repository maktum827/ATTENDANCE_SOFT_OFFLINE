import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import App from './App';
// import store from './store';
import i18n from '../components/hooks/i18n'; // Ensure this path is correct
import { store } from '../store/store';

// Add a blank line here, as per ESLint's rule
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </Provider>,
);

// Calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  console.log(arg); // eslint-disable-line no-console
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);

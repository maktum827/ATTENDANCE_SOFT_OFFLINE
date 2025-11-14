// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'ipc-example'
  | 'get-hardware-id'
  // | 'read-license'
  // | 'write-license'
  | 'restart-app';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },

  // ⭐ NEW: Activation API
  activation: {
    getHardwareId: () => ipcRenderer.invoke('get-hardware-id'),
    // readLicense: () => ipcRenderer.invoke('read-license'),
    // writeLicense: (licenseJson: any) =>
    //   ipcRenderer.invoke('write-license', licenseJson),
  },

  restartApp: () => {
    ipcRenderer.send('restart-app');
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import RemoteControlService from './lib/clicker-public-sdk/remoteControl.js';

contextBridge.exposeInMainWorld('electron', {
    remoteControl: {
        open: () => RemoteControlService.open(),
        close: () => RemoteControlService.close(),
        subscribeEvents: (callback) => RemoteControlService.subscribeEvents(callback),
        unsubscribeEvents: () => RemoteControlService.unsubscribeEvents(),
        startRegister: (classNumber, number, registrationKey) => RemoteControlService.startRegister(classNumber, number, registrationKey),
        finishRegister: () => RemoteControlService.finishRegister(),
    },
    saveFile: (buffer, filename) => ipcRenderer.invoke('save-file', buffer, filename)
});
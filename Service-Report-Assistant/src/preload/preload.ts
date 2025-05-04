// Este archivo se utiliza para definir el contexto de seguridad de la aplicación. Permite la comunicación entre el proceso principal y el proceso de renderizado.

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel: string, func: (data: any) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});
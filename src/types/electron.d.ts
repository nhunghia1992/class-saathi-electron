// src/types/electron.d.ts

export { };

declare global {
  interface Window {
    electron: {
      remoteControl: {
        open: () => void;
        close: () => void;
        subscribeEvents: (callback: (event: any) => void) => void;
        unsubscribeEvents: () => void;
        startRegister: (classNumber: number, number: number, registrationKey: number) => void;
        finishRegister: () => void;
      },
      saveFile: (buffer: Uint8Array, filename: string) => Promise<string>
    };
  }
}
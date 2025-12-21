import { ChatMessage, HistoryLog, GenericRecord } from '../types';

// Firestore functionality has been disabled due to an incompatible backend configuration (Datastore Mode).
// The app will now rely solely on localStorage for data persistence.

export const initializeFirebase = (): boolean => {
  console.warn("Firebase features are disabled due to backend configuration.");
  return false;
};

// --- Chat Service ---

export const sendMessage = async (chatId: string, senderId: string, senderName: string, text: string): Promise<void> => {
  // Do nothing
  return Promise.resolve();
};

export const onNewMessage = (chatId: string, callback: (messages: ChatMessage[]) => void): (() => void) => {
  // Do nothing, return empty unsubscribe function
  return () => {};
};

// --- Generic Record & History Log Service ---

export const addGenericRecord = async (record: { tipo: string, titulo: string, conteudo: string }): Promise<void> => {
  // Do nothing
  return Promise.resolve();
};

export const getRecentRecordsForExport = async (): Promise<GenericRecord[]> => {
  return Promise.resolve([]);
};

export const onRecordsUpdate = (callback: (records: GenericRecord[]) => void): (() => void) => {
  // Do nothing, return empty unsubscribe function
  return () => {};
};

export const logActionToFirebase = async (type: string, content: string): Promise<void> => {
  // Do nothing
  return Promise.resolve();
};

export const onHistoryUpdate = (callback: (logs: HistoryLog[]) => void): (() => void) => {
  // Do nothing, return empty unsubscribe function
  return () => {};
};

export const clearHistoryInFirebase = async (): Promise<void> => {
  // Do nothing
  return Promise.resolve();
};

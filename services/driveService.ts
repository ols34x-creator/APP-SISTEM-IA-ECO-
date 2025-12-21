// FIX: Declare global variables attached to the window object by external scripts
// to satisfy TypeScript's type checker.
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

// --- GOOGLE DRIVE INTEGRATION DISABLED ---
// The functionality below was disabled due to API key errors.
// The user reported an "API key not valid" error from people.googleapis.com.
// To resolve this, the entire integration is being deactivated as requested.

export const initClient = (): Promise<void> => {
    console.warn("Google Drive integration is disabled due to API key errors.");
    return Promise.resolve();
};

export const signIn = (): Promise<any> => {
    const errorMessage = "Google Drive sign-in is disabled due to API key errors.";
    console.warn(errorMessage);
    return Promise.reject(new Error(errorMessage));
};

export const signOut = () => {
    console.warn("Google Drive sign-out is disabled.");
};

export const saveBackup = async (userName: string, backupData: object): Promise<string> => {
    const errorMessage = "Google Drive backup is disabled due to API key errors.";
    console.warn(errorMessage);
    return Promise.reject(new Error(errorMessage));
};
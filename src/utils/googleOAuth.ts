// Google OAuth utility functions and types
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Google OAuth types
export interface GoogleIdConfig {
    client_id: string;
    callback: (response: GoogleIdResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
}

export interface GoogleIdResponse {
    credential: string;
}

export interface GoogleIdPromptNotification {
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
}

export interface GoogleButtonConfig {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    width?: string | number;
}

// Extend Window interface for Google OAuth
declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: GoogleIdConfig) => void;
                    prompt: (callback?: (notification: GoogleIdPromptNotification) => void) => void;
                    renderButton: (element: HTMLElement, options?: GoogleButtonConfig) => void;
                };
            };
        };
    }
}

// Utility function to load Google OAuth script
export const loadGoogleOAuthScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.accounts) {
            resolve();
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Google OAuth script')));
            return;
        }

        // Load the script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            // Wait a bit for the API to be available
            setTimeout(() => {
                if (window.google && window.google.accounts) {
                    resolve();
                } else {
                    reject(new Error('Google OAuth API not available after script load'));
                }
            }, 100);
        };
        
        script.onerror = () => {
            reject(new Error('Failed to load Google OAuth script'));
        };
        
        document.head.appendChild(script);
    });
};

// Utility function to check if Google OAuth is available
export const isGoogleOAuthAvailable = (): boolean => {
    return !!(window.google && window.google.accounts);
};

// Utility function to validate Google Client ID
export const validateGoogleClientId = (): boolean => {
    const isValid = GOOGLE_CLIENT_ID.length > 0 && GOOGLE_CLIENT_ID !== 'your_google_client_id_here';
    if (!isValid) {
        console.warn('Google Client ID is not properly configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.');
    }
    return isValid;
};
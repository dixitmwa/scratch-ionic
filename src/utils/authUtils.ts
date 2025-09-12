import { Preferences } from '@capacitor/preferences';

// Simple test function to verify auth persistence
export const testAuthPersistence = async () => {
  try {
    // Set a test auth token
    await Preferences.set({ key: 'auth', value: 'test-token-123' });
    
    // Retrieve the token
    const { value } = await Preferences.get({ key: 'auth' });
    
    console.log('Auth token stored:', value);
    console.log('Auth persistence working:', !!value);
    
    return !!value;
  } catch (error) {
    console.error('Auth persistence test failed:', error);
    return false;
  }
};

// Function to simulate login for testing
export const simulateLogin = async () => {
  try {
    await Preferences.set({ key: 'auth', value: 'demo-auth-token-' + Date.now() });
    console.log('Login simulated successfully');
    return true;
  } catch (error) {
    console.error('Login simulation failed:', error);
    return false;
  }
};
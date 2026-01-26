import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_PIN, PIN_LENGTH } from '../../config/constants';

// Store PIN securely
export const setPin = async (pin: string): Promise<boolean> => {
  try {
    if (pin.length !== PIN_LENGTH) {
      throw new Error(`PIN must be ${PIN_LENGTH} digits`);
    }
    await SecureStore.setItemAsync(STORAGE_KEYS.PIN, pin);
    return true;
  } catch (error) {
    console.error('Error setting PIN:', error);
    return false;
  }
};

// Verify PIN
export const verifyPin = async (pin: string): Promise<boolean> => {
  try {
    const storedPin = await SecureStore.getItemAsync(STORAGE_KEYS.PIN);
    
    // If no PIN set, use default
    if (!storedPin) {
      if (pin === DEFAULT_PIN) {
        // First login, store the default PIN
        await setPin(DEFAULT_PIN);
        return true;
      }
      return false;
    }
    
    return storedPin === pin;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

// Check if PIN is set
export const isPinSet = async (): Promise<boolean> => {
  try {
    const pin = await SecureStore.getItemAsync(STORAGE_KEYS.PIN);
    return pin !== null;
  } catch (error) {
    return false;
  }
};

// Set logged in state
export const setLoggedIn = async (isLoggedIn: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.IS_LOGGED_IN,
      JSON.stringify(isLoggedIn)
    );
    if (isLoggedIn) {
      await updateLastActivity();
    }
  } catch (error) {
    console.error('Error setting login state:', error);
  }
};

// Check if logged in
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return value ? JSON.parse(value) : false;
  } catch (error) {
    return false;
  }
};

// Update last activity timestamp
export const updateLastActivity = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_ACTIVITY,
      Date.now().toString()
    );
  } catch (error) {
    console.error('Error updating last activity:', error);
  }
};

// Get last activity timestamp
export const getLastActivity = async (): Promise<number | null> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
    return value ? parseInt(value, 10) : null;
  } catch (error) {
    return null;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

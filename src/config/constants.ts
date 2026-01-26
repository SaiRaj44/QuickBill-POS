// App Constants

export const APP_NAME = 'Biryani Point';

export const PIN_LENGTH = 4;
export const DEFAULT_PIN = '1234'; // Default PIN for first setup

export const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const BILL_PREFIX = 'BP';

export const CURRENCY_SYMBOL = '₹';

export const STORAGE_KEYS = {
  PIN: 'user_pin',
  IS_LOGGED_IN: 'is_logged_in',
  LAST_ACTIVITY: 'last_activity',
  SETTINGS: 'app_settings',
};

export const DB_NAME = 'billing_app.db';

export const DEFAULT_SETTINGS = {
  shopName: 'Biryani Point',
  shopAddress: '',
  shopPhone: '',
  autoPrint: true,
  darkMode: true,
};

export const ENVIRONMENT = process.env.APP_ENV || 'dev'
export const IS_PRODUCTION = ENVIRONMENT === 'production'
export const IS_TEST = ENVIRONMENT === 'test'
export const APP_PREFIX_PATH = process.env.APP_PREFIX_PATH || '/'
export const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/Mocks'
export const default_page_size = 30;
export const locked_themes = 13;
export const default_page_no = 1;
export const default_order = "asc";
export const default_order_by = "id";
export const private_key_file = process.env.PRIVATE_KEY_FILE;
export const public_key_file = process.env.PUBLIC_KEY_FILE;
export const private_key_passphrase = process.env.PRIVATE_KEY_PASSPHRASE;
export const access_token_expiry_after = parseInt(process.env.ACCESS_TOKEN_EXPIRY, 10);
export const refresh_token_expiry_after = parseInt(process.env.REFRESH_TOKEN_EXPIRY, 10);

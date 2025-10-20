import CryptoJS from 'crypto-js';

// Use a secure master key (in production, this should be derived from user's password)
const ENCRYPTION_KEY = 'clupso-demo-encryption-key-2024';

export const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

export const decryptPassword = (encryptedPassword: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

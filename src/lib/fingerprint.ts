import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;

// Initialize FingerprintJS
export const initFingerprint = async () => {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
};

// Get device fingerprint
export const getDeviceFingerprint = async (): Promise<{
  deviceId: string;
  browser: string;
  os: string;
}> => {
  const fp = await initFingerprint();
  const result = await fp.get();
  
  // Get browser and OS information
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  
  // Detect browser
  if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
  else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
  else if (userAgent.indexOf('Opera') > -1) browser = 'Opera';
  
  // Detect OS
  if (userAgent.indexOf('Windows') > -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') > -1) os = 'MacOS';
  else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
  else if (userAgent.indexOf('Android') > -1) os = 'Android';
  else if (userAgent.indexOf('iOS') > -1) os = 'iOS';
  
  return {
    deviceId: result.visitorId,
    browser,
    os
  };
};

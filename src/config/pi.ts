export type PiNetworkMode = 'testnet' | 'mainnet';

export const PI_NETWORK_MODE_STORAGE_KEY = 'pi_network_mode';

/** Wallet address the app receives payments on (per network) */
export const PI_APP_WALLET_ADDRESS: Record<PiNetworkMode, string> = {
  testnet: 'GCSTKWX4QG6KPIYIXKZHJJRLKDZXWLHGSAL6CSK2DNUREKSM7JUAPGWE',
  mainnet: '', // سيتم إضافته عند الانتقال للمين نت
};

export const PI_NETWORK_OPTIONS: Array<{
  value: PiNetworkMode;
  label: string;
  description: string;
}> = [
  {
    value: 'testnet',
    label: 'Pi Testnet',
    description: 'Sandbox',
  },
  {
    value: 'mainnet',
    label: 'Pi Mainnet',
    description: 'Live',
  },
];

export const getPiNetworkMode = (): PiNetworkMode => {
  if (typeof window === 'undefined') return 'testnet';

  const storedMode = window.localStorage.getItem(PI_NETWORK_MODE_STORAGE_KEY);
  return storedMode === 'mainnet' ? 'mainnet' : 'testnet';
};

export const setPiNetworkMode = (mode: PiNetworkMode) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PI_NETWORK_MODE_STORAGE_KEY, mode);
};

export const getPiNetworkLabel = (mode: PiNetworkMode) =>
  mode === 'mainnet' ? 'Pi Mainnet' : 'Pi Testnet';

export const getPiSdkConfig = (mode: PiNetworkMode = getPiNetworkMode()) => ({
  version: '2.0',
  sandbox: mode === 'testnet',
});
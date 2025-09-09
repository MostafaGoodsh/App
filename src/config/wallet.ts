// Wallet configuration
// For security, move sensitive configuration here
// Get a free project key at https://cloud.reown.com
// Create a new project and get your Project ID

export const WALLETCONNECT_CONFIG = {
  projectId: '5cbecfb58785fd00d9c6f1825f993060',
  metadata: {
    name: 'المحافظ الرقمية',
    description: 'منصة إدارة المحافظ الرقمية',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    icons: [typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '']
  }
};

// Network configurations
export const NETWORK_CONFIG = {
  polygon: {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC'
  }
};

// Wallet types
export const WALLET_TYPES = {
  WALLETCONNECT: 'WalletConnect'
} as const;
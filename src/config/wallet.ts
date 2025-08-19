// Wallet configuration
// For security, move sensitive configuration here
// Get a free project key at https://cloud.reown.com
// Create a new project and get your Project ID

export const WALLETCONNECT_CONFIG = {
  projectId: '5cbecfb58785fd00d9c6f1825f993060', // Replace with your project ID
  metadata: {
    name: 'المحافظ الرقمية',
    description: 'منصة إدارة المحافظ الرقمية',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    icons: [typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '']
  },
  chains: [1], // Ethereum mainnet
  qrModalOptions: {
    themeMode: 'dark' as const,
    themeVariables: {
      '--wcm-z-index': '1000'
    }
  }
};

// Network configurations
export const NETWORK_CONFIG = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH'
  },
  solana: {
    name: 'Solana',
    currency: 'SOL',
    rpcUrl: 'https://api.mainnet-beta.solana.com'
  }
};
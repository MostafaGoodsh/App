// WalletConnect Configuration - Multi-Chain Support
export const WALLETCONNECT_CONFIG = {
  // Uses the secret from Lovable Cloud; falls back to placeholder if missing
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  metadata: {
    name: 'المحافظ الرقمية',
    description: 'منصة إدارة المحافظ الرقمية متعددة الشبكات',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    icons: [typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '']
  }
};

// Multi-Chain Network Support
export const SUPPORTED_NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io/']
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/']
  },
  bsc: {
    chainId: 56,
    name: 'BSC',
    currency: 'BNB',
    rpcUrls: ['https://bsc-dataseed1.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/']
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum',
    currency: 'ETH',
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io/']
  },
  solana: {
    chainId: 101,
    name: 'Solana',
    currency: 'SOL',
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com/']
  }
};

export const WALLET_TYPES = {
  WALLETCONNECT: 'WalletConnect'
} as const;
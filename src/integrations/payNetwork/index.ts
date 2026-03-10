// Import necessary modules
import { PayNetworkClient } from 'pay-network-client';

// Configuration constants
const API_KEY = process.env.PAY_NETWORK_API_KEY;

// Create and export Pay Network client
export const payNetworkClient = new PayNetworkClient({ apiKey: API_KEY });
import { ethers } from "ethers";
import MsrTokenABI from "@/contracts/MsrToken.abi.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// عناوين العقود على الشبكات المختلفة
const CONTRACT_ADDRESSES = {
  ethereum: "0x...", // استبدل بعنوان العقد على Ethereum
  polygon: "0x...",  // استبدل بعنوان العقد على Polygon
};

const RPC_URLS = {
  ethereum: "https://eth.llamarpc.com",
  polygon: "https://polygon-rpc.com",
};

export const contractService = {
  // الحصول على رصيد المستخدم
  async getBalance(userAddress: string, network: "ethereum" | "polygon" = "ethereum") {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URLS[network]);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES[network],
        MsrTokenABI,
        provider
      );
      const balance = await contract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw error;
    }
  },

  // تحويل العملات
  async transfer(
    toAddress: string,
    amount: string,
    network: "ethereum" | "polygon" = "ethereum"
  ) {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES[network],
        MsrTokenABI,
        signer
      );

      const tx = await contract.transfer(
        toAddress,
        ethers.parseEther(amount)
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("Error transferring tokens:", error);
      throw error;
    }
  },

  // الموافقة على التحويل
  async approve(
    spenderAddress: string,
    amount: string,
    network: "ethereum" | "polygon" = "ethereum"
  ) {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES[network],
        MsrTokenABI,
        signer
      );

      const tx = await contract.approve(
        spenderAddress,
        ethers.parseEther(amount)
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw error;
    }
  },

  // الحصول على معلومات العقد
  async getTokenInfo(network: "ethereum" | "polygon" = "ethereum") {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URLS[network]);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES[network],
        MsrTokenABI,
        provider
      );

      const name = await contract.name();
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();
      const totalSupply = await contract.totalSupply();

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatEther(totalSupply),
      };
    } catch (error) {
      console.error("Error fetching token info:", error);
      throw error;
    }
  },
};

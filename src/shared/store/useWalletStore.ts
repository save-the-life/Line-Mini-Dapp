import create from 'zustand';

interface WalletStore {
  walletAddress: string;
  provider: any;
  walletType: string;
  setWalletAddress: (address: string) => void;
  setProvider: (provider: any) => void;
  setWalletType: (walletType: string) => void;
  clearWallet: () => void;
}

const useWalletStore = create<WalletStore>((set) => ({
  walletAddress: "",
  provider: null,
  walletType: "",
  setWalletAddress: (address: string) => set({ walletAddress: address }),
  setProvider: (provider: any) => set({ provider }),
  setWalletType: (walletType: string) => set({ walletType }),
  clearWallet: () => set({ walletAddress: "", provider: null, walletType: "" }),
}));

export default useWalletStore;

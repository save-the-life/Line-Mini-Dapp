import create from 'zustand';

interface WalletStore {
  walletAddress: string;
  provider: any;
  walletType: string;
  sdk: any;
  setWalletAddress: (address: string) => void;
  setProvider: (provider: any) => void;
  setWalletType: (walletType: string) => void;
  setSdk: (sdk: any) => void;
  clearWallet: () => void;
}

const useWalletStore = create<WalletStore>((set) => ({
  walletAddress: "",
  provider: null,
  walletType: "",
  sdk: null,
  setWalletAddress: (address: string) => set({ walletAddress: address }),
  setProvider: (provider: any) => set({ provider }),
  setWalletType: (walletType: string) => set({ walletType }),
  setSdk: (sdk: any) => set({ sdk }),
  clearWallet: () => set({ walletAddress: "", provider: null, walletType: "", sdk: null }),
}));

export default useWalletStore;

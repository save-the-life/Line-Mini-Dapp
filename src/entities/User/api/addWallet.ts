import api from '@/shared/api/axiosInstance';

// 사용자 지갑 등록 API 
export const requestWallet = async(walletAddress: string, walletType: string): Promise<any> => {
    const walletInfo = {
        walletAddress,
        walletType
    }
    const response = await api.post("/wallet", {walletInfo});

    if(response.data.message === "Success"){
        return true;
    }else{
        return false;
    }
};

export default requestWallet;
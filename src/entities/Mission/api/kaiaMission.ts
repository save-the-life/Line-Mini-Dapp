import api from '@/shared/api/axiosInstance';

// Level 3 USDT 보상 api (지갑 주소만 전송)
export const requestKaiaMission = async (walletAddress: string): Promise<any> => {
    const info = {
        walletAddress: walletAddress
    }

    const response = await api.post("/mission/kaia", info);

    if (response.data.code === "OK") {
        console.log("kaia mission response: ", response);
        return response.data;
    } else {
        console.error('Unexpected response:', response);
        throw new Error(response.data.message || 'Failed to fetch get Kaia Mission');
    }
};

export default requestKaiaMission;
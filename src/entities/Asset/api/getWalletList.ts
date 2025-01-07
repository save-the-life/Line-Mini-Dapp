import api from '@/shared/api/axiosInstance';

export const getWallets = async(): Promise<any> => {
    const response = await api.get('/wallet/my');

    if(response.data.code === 'OK'){
        console.log("지갑 목록 확인이요: ", response.data.data);
        return response.data.data;
    }else{
        console.error('Unexpected response:', response);
        throw new Error(response.data.message || 'Failed to fetch wallet information');
    }
};

export default getWallets;
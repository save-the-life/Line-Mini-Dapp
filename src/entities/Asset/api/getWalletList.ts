import api from '@/shared/api/axiosInstance';

export const getWallets = async(): Promise<any> => {
    const response = await api.get('/wallet/my');

    if(response.data.code === 'OK'){
        return response.data.data;
    }else{
        console.error('Unexpected response:', response);
        throw new Error(response.data.message || 'Failed to fetch wallet information');
    }
};

export default getWallets;
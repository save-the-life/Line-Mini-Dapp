import api from '@/shared/api/axiosInstance';

// SL 차감
export const slPayment = async (walletAddress: string): Promise<any> => {
  const response = await api.post('/diagnosis/sl/pay', {walletAddress});
  
  if (response.data.code === 'OK') {
    console.log("결제 진행: ", response);
    return response.data;
  } else {
    console.error('Unexpected response:', response);
    throw new Error(response.data.message || 'Failed to fetch pet information');
  }
};


export default slPayment;

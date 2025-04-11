import api from '@/shared/api/axiosInstance';

// 카이아 보상 인입유저 확인
export const getKaiaRedirection = async (): Promise<any> => {
  const response = await api.get('/kaia/redirect');

  if (response.data.code === 'OK') {
    // console.log("KAIA Reward 진입 여부: ", response);
    return true;
  } else {
    // console.error('Unexpected response:', response);
    throw new Error(response.data.message || 'Failed to fetch reward information');
  }
};


export default getKaiaRedirection;

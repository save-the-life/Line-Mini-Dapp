// src/entities/user/api/userApi.ts
import api from '@/shared/api/axiosInstance';

export const fetchHomeData = async () => {
  try {
    const response = await api.get('/home');
    // console.log("/home 응답: ", response.data);
    return response.data;
  } catch (error: any) {
    // console.error('/home 에러 확인:', error);
    throw error;
  }
};

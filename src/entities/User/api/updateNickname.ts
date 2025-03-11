import api from '@/shared/api/axiosInstance';

// 사용자 이름 업데이트 API 
export const updateNickname = async(Name: string): Promise<any> => {
    const response = await api.post("/name", {Name});

    if(response.data.message === "Success"){
        return true;
    }else{
        return false;
    }
};

export default updateNickname;
import api from '@/shared/api/axiosInstance';

// 사용자 이름 업데이트 API 
export const updateNickname = async(name: string): Promise<any> => {
    const response = await api.post("/name", {name});

    if(response.data.code === "Success"){
        console.log("닉네임 수정 response: ", response);
        return true;
    }else {
        console.error('Unexpected response:', response);
        throw new Error(response.data.message || 'Failed to fetch nickname update');
    }
};

export default updateNickname;
import api from '@/shared/api/axiosInstance';

// 사용자 이름 업데이트 API 
export const updateNickname = async(name: string): Promise<any> => {
    const response = await api.post("/name", {name});

    if(response.data.message === "Success"){
        console.log("닉네임 수정 response: ", response);
        return true;
    }else{
        return false;
    }
};

export default updateNickname;
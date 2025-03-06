import api from '@/shared/api/axiosInstance';

// 사용자의 캐릭터 선택 API 
export const requestAttendance = async(transactionId: string): Promise<any> => {
    const response = await api.post("/attendance", {transactionId});

    if(response.data.message === "Success"){
        return true;
    }else{
        return false;
    }
};

export default requestAttendance;
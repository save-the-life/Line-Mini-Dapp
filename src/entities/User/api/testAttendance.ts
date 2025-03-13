import api from '@/shared/api/axiosInstance';

// 출석 API 
export const requestAttendance = async(userSignedTx: string): Promise<any> => {
    const response = await api.post("/attendance/tx", {userSignedTx});

    if(response.data.message === "Success"){
        return true;
    }else{
        return false;
    }
};

export default requestAttendance;
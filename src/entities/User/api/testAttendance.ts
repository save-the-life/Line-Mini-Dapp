import api from '@/shared/api/axiosInstance';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';

// 출석 API 
export const testingAttendance = async(userSignedTx: string): Promise<any> => {
    const response = await api.post("/attendance/tx", {userSignedTx});
    console.log("뭐지: ", response);
    if(response){
        console.log("출첵 확인 응답 : ", response);
        return true;
    }else{
        return false;
    }
};

export default testingAttendance;
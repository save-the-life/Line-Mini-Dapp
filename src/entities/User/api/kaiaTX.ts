import api from '@/shared/api/axiosInstance';

// kaia 미션 서명 API 
export const testingKaia = async(userSignedTx: string, walletAddress: string): Promise<any> => {
    const info = {
        userSignedTx: userSignedTx,
        walletAddress: walletAddress
    }

    const response = await api.post("/test/kaia/tx", info);
    console.log("뭐지: ", response);
    if(response){
        console.log("Kaia 확인 응답 : ", response);
        return true;
    }else{
        return false;
    }
};

export default testingKaia;
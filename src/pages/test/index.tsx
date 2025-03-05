import React, { useState } from "react";
import DappPortalSDK from "@linenext/dapp-portal-sdk"; // Default export로 SDK 가져오기
import { ethers } from "ethers";

const contractAddress = "0x3bD64E9A8166Cc97FFA489BFD742cAA6b652C29F";

const abi = [
   {
      "anonymous": false,
      "inputs": [
         {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
         },
         {
            "indexed": false,
            "internalType": "uint256",
            "name": "lastAttendance",
            "type": "uint256"
         },
         {
            "indexed": false,
            "internalType": "uint256",
            "name": "consecutiveDays",
            "type": "uint256"
         }
      ],
      "name": "AttendanceChecked",
      "type": "event"
   },
   {
      "inputs": [],
      "name": "checkAttendance",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
   },
   {
      "inputs": [
         {
            "internalType": "address",
            "name": "",
            "type": "address"
         }
      ],
      "name": "users",
      "outputs": [
         {
            "internalType": "uint256",
            "name": "lastAttendance",
            "type": "uint256"
         },
         {
            "internalType": "uint256",
            "name": "consecutiveDays",
            "type": "uint256"
         }
      ],
      "stateMutability": "view",
      "type": "function"
   }
];


const WalletConnect: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);



  const connectWallet = async () => {
    try {
      console.log("초기화 시작");

      // SDK 초기화
      const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "", // 환경 변수에서 clientId 가져오기
        chainId: "8217", // 메인넷 체인 ID
      });

      // 지갑 연결 요청
        const walletProvider = sdk.getWalletProvider();
        setProvider(walletProvider);
        const accounts = (await walletProvider.request({
            method: "kaia_requestAccounts",
        })) as string[];

      setAccount(accounts[0]);
      console.log("지갑 연결 성공:", accounts[0]);

      
    } catch (error: any) {
      console.error("에러 발생:", error.message);
      console.error("에러 응답:", error.response?.data || "응답 없음");
    }
  };

  const handleAttandance = async () => {
    try{
      // SDK 초기화
      const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "", // 환경 변수에서 clientId 가져오기
        chainId: "8217", // 메인넷 체인 ID
      });
      
      const walletProvider = sdk.getWalletProvider();

      const tx = {
        from: account,
        to: contractAddress,
        value: '10',
        gas: '21000',
      };

      const txHash = await walletProvider.request({method: 'kaia_sendTransaction', params: [tx]});
      console.log("트랜잭션 확인: ", txHash);
    } catch(er: any){

    }
  }

  const checkIn = async () => {
    if (!provider || !account) {
      alert("먼저 지갑을 연결하세요!");
      return;
    }
  
    try {
      console.log("출석 체크 트랜잭션 생성 중...");
  
      // 1. Kaia SDK의 Wallet Provider에서 지갑 타입 확인
      const walletType = provider.getWalletType();
      console.log("연결된 지갑 타입:", walletType);
  
      // 2. 스마트 컨트랙트 인터페이스 생성
      const contract = new ethers.Contract(contractAddress, abi);
      const contractInterface = new ethers.utils.Interface(abi);
      const data = contractInterface.encodeFunctionData("checkAttendance", []);
  
      // 3. 트랜잭션 객체 생성
      let tx = {
        from: account,
        to: contractAddress,
        data: data,
        value: "0x0",
      };
  
      // 4. 지갑 타입별 서명 방식 적용
      let txHash;
  
      if (walletType === "WalletType.OKX" || walletType === "WalletType.Web") {
        // OKX Wallet 또는 소셜 ID 로그인(Liff)은 `eth_sendTransaction` 방식 사용
        txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [tx],
        });
      } else {
        // 기본적으로 `kaia_sendTransaction` 사용 (Kaia Wallet)
        txHash = await provider.request({
          method: "kaia_sendTransaction",
          params: [tx],
        });
      }
  
      console.log("출석 체크 트랜잭션 실행 완료! TX Hash:", txHash);
      alert("출석 체크 성공!");
    } catch (error) {
      console.error("출석 체크 실패:", error);
      alert("출석 체크 중 오류 발생!");
    }
  };

  return (
    <div className="flex flex-col text-white mb-32 px-6 min-h-screen">
      <button onClick={connectWallet}>지갑 연결</button>
      {account && <p>연결된 계정: {account}</p>}

      <button onClick={checkIn} className="mt-5 text-lg text">출책</button>
    </div>
  );
};

export default WalletConnect;

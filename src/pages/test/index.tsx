import React, { useState } from "react";
import DappPortalSDK from "@linenext/dapp-portal-sdk"; // Default export로 SDK 가져오기
import { ethers } from "ethers";

const contractAddress = "0x01AE259aAc479862eA609D6771AA18fB1b1E097e";

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
     "inputs": [
        {
           "internalType": "bytes32",
           "name": "messageHash",
           "type": "bytes32"
        },
        {
           "internalType": "uint8",
           "name": "v",
           "type": "uint8"
        },
        {
           "internalType": "bytes32",
           "name": "r",
           "type": "bytes32"
        },
        {
           "internalType": "bytes32",
           "name": "s",
           "type": "bytes32"
        }
     ],
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
]
const WalletConnect: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);

  const connectWallet = async () => {
    try {
      // console.log("초기화 시작");

      // SDK 초기화
      const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "", // 환경 변수에서 clientId 가져오기
        chainId: "1001", // 메인넷 체인 ID
      });

      // 지갑 연결 요청
        const walletProvider = sdk.getWalletProvider();
        setProvider(walletProvider);
        const accounts = (await walletProvider.request({
            method: "kaia_requestAccounts",
        })) as string[];

      setAccount(accounts[0]);
      // console.log("지갑 연결 성공:", accounts[0]);

      
    } catch (error: any) {
      // console.error("에러 발생:", error.message);
      // console.error("에러 응답:", error.response?.data || "응답 없음");
    }
  };

  const checkIn = async () => {
    if (!provider || !account) {
      alert("먼저 지갑을 연결하세요!");
      return;
    }
  
    try {
      // console.log("출석 체크 서명 요청 중...");
  
      // 1️⃣ 현재 연결된 지갑 타입 확인
      const walletType = provider.getWalletType();
      // console.log("연결된 지갑 타입:", walletType);
  
      // 2️⃣ Kaia SDK의 Provider를 Ethers.js의 Web3Provider로 변환
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
  
      // 3️⃣ 스마트 컨트랙트 인스턴스 생성 (Signer 포함)
      const contract = new ethers.Contract(contractAddress, abi, signer);
  
      let txHash;
  
      // 4️⃣ Kaia Wallet 사용 시 → `kaia_sendTransaction` 실행
      if (walletType === "WalletType.Web" || walletType === "WalletType.Extension" || walletType === "WalletType.Mobile") {
        // console.log("✅ Kaia Wallet 감지 - 트랜잭션 직접 실행");
  
        const tx = await contract.checkAttendance(); // ✅ 인자 없이 실행
        await tx.wait();
        txHash = tx.hash;
  
      } else {
        // 5️⃣ 소셜 로그인 또는 OKX Wallet 사용 시 → Ethers.js의 signMessage() 사용하여 서명 요청
        // console.log("⚠️ 소셜 로그인 또는 OKX Wallet 감지 - 서명 방식 적용");
  
        const message = `출석 체크: ${account}`;
        const messageHash = ethers.utils.hashMessage(message); // ✅ 메시지 해시 생성
  
        // ✅ `provider.request()` 대신 `signer.signMessage()` 사용
        const signature = await signer.signMessage(message);
  
        // console.log("✅ 서명 완료:", signature);
  
        // 6️⃣ 서명 데이터 분해 (v, r, s 값 추출)
        const sig = ethers.utils.splitSignature(signature);
  
        // 7️⃣ 컨트랙트 함수 호출 (서명 데이터 전달)
        const tx = await contract.checkAttendance(messageHash, sig.v, sig.r, sig.s);
        await tx.wait();
        txHash = tx.hash;
      }
  
      // console.log("✅ 출석 체크 트랜잭션 성공! TX Hash:", txHash);
      alert("출석 체크 완료!");
    } catch (error) {
      // console.error("❌ 출석 체크 실패:", error);
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

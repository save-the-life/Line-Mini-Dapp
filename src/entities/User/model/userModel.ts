// src/entities/User/model/userModel.ts

import create from 'zustand';
import { fetchHomeData } from '@/entities/User/api/userApi';
import api from '@/shared/api/axiosInstance';
import { rollDiceAPI, RollDiceResponseData } from '@/features/DiceEvent/api/rollDiceApi';
import { refillDiceAPI } from '@/features/DiceEvent/api/refillDiceApi'; // 분리된 API 함수 임포트
import { autoAPI } from '@/features/DiceEvent/api/autoApi';
import { completeTutorialAPI} from '@/features/DiceEvent/api/completeTutorialApi';
import { useSoundStore } from '@/shared/store/useSoundStore';
import { fetchLeaderTabAPI } from '@/entities/Leaderboard/api/leaderboardAPI';


// 월간 보상 정보 인터페이스
interface MonthlyPrize {
  year: number;
  month: number;
  prizeType: string;
  amount: number;
  eventFinishTime: string; // 추가된 부분: 이벤트 종료 시간
}

// 주간 출석 정보 인터페이스
interface WeekAttendance {
  mon: boolean | null;
  tue: boolean | null;
  wed: boolean | null;
  thu: boolean | null;
  fri: boolean | null;
  sat: boolean | null;
  sun: boolean | null;
}

// 사용자 상태 인터페이스
interface UserState {
  // 사용자 관련 상태들
  nickName: string | null;
  setNickName: (nickName: string | null) => void;
  uid: number | null;
  setUid: (uid: number | null) => void;
  walletAddress: string | null;
  setWalletAddress: (walletAddress: string | null) => void;

  referrerId: string | null; // 추가된 부분: 초대한 친구 아이디
  setReferrerId: (referrerId: string | null) => void; // 추가된 부분

  isAuto: boolean; // 추가된 부분: 오토 여부
  setIsAuto: (isAuto: boolean) => void; // 추가된 부분

  starPoints: number;
  setStarPoints: (value: number | ((prev: number) => number)) => void;

  diceCount: number;
  setDiceCount: (value: number | ((prev: number) => number)) => void;

  lotteryCount: number;
  setLotteryCount: (value: number | ((prev: number) => number)) => void;

  position: number;
  setPosition: (value: number | ((prev: number) => number)) => void;

  userLv: number;
  setUserLv: (userLv: number) => void;

  completeTutorial  : boolean;
  setCompleteTutorial : (completeTutorial : boolean) => void;

  characterType: 'dog' | 'cat' | null; // 수정된 부분: null 허용
  setCharacterType: (type: 'dog' | 'cat' | null) => void; // 수정된 부분: null 허용

  slToken: number;
  setSlToken: (value: number | ((prev: number) => number)) => void;

  rank: number;
  setRank: (rank: number) => void;

  previousRank : number;

  monthlyPrize: MonthlyPrize;
  setMonthlyPrize: (monthlyPrize: MonthlyPrize) => void;

  weekAttendance: WeekAttendance;
  setWeekAttendance: (weekAttendance: WeekAttendance) => void;

  currentMiniGame: string;
  setCurrentMiniGame: (game: string) => void;

  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // 인증 관련 함수들
  login: (initData: string) => Promise<void>;
  signup: (initData: string, petType: 'DOG' | 'CAT') => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;

  // 사용자 데이터 가져오기
  fetchUserData: () => Promise<void>;

  diceResult: number;
  rollDice: (gauge: number) => Promise<RollDiceResponseData>;

  diceRefilledAt: string | null;
  setDiceRefilledAt: (value: string | null) => void;

  items: Items;
  setItems: (items: Items) => void;

  boards: Board[];
  setBoards: (boards: Board[]) => void;

  refillDice: () => Promise<void>;

  pet: Pet; // pet 속성 추가
  setPet: (update: Partial<Pet>) => void; // pet 속성 업데이트 함수 추가

  autoSwitch: () => Promise<void>;

  completeTutorialFunc: () => Promise<void>;


  // **추가된 함수들**
  addGoldItem: () => Promise<void>;
  removeGoldItem: () => Promise<void>;
  addSilverItem: () => Promise<void>;
  removeSilverItem: () => Promise<void>;
  addBronzeItem: () => Promise<void>;
  removeBronzeItem: () => Promise<void>;
  addRewardItem: () => Promise<void>;
  removeRewardItem: () => Promise<void>;
  addAutoItem: () => Promise<void>;
  removeAutoItem: () => Promise<void>;
  addAllItems: () => Promise<void>;
  addDice : () => Promise<void>;
  removeDice: () => Promise<void>;
  addSLToken: () => Promise<void>;
  removeSLToken: () => Promise<void>;


  // **추가된 필드: timeZone (null 가능)**
  timeZone: string | null;
  setTimeZone: (timeZone: string | null) => void;

  // **추가된 필드: suspend (boolean)**
  suspend: boolean;
  setSuspend: (suspend: boolean) => void;

  
  redirect: boolean;
  setRedirect: (suspend: boolean) => void;

  fetchLeaderTab: () => Promise<void>

  modalRank: number | null;
  modalPreviousRank: number | null;
  modalStarPoints: number | null;
  modalLotteryCount: number | null;
  modalSlToken: number | null;
  resetModalData: () => void;
}

// 필요한 인터페이스 정의
interface Items {
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  timeDiceTimes: number;
  boardRewardTimes: number;
  ticketTimes: number;
  spinTimes: number; // 추가된 필드
  autoNftCount: number; // 추가된 필드
  rewardNftCount: number; // 추가된 필드
}

export interface Board {
  rewardAmount: number | null;
  tileType: 'HOME' | 'REWARD' | 'SPIN' | 'RPS' | 'MOVE' | 'JAIL';
  rewardType: 'STAR' | 'DICE' |  null;
  sequence: number;
  moveType: 'SPIN' | 'RPS' | 'HOME' | 'ANYWHERE' | null;
}

interface Pet {
  type: 'DOG' | 'CAT' | null; // 수정된 부분: null 허용
  level: number | null; // 수정된 부분: null 허용
  exp: number; // 경험치 추가
}

// 사용자 상태를 관리하는 Zustand 스토어 생성
export const useUserStore = create<UserState>((set, get) => ({
  fetchLeaderTab: async () => {
    try {
      const data = await fetchLeaderTabAPI()
      // data: { leaderBoard: [...], myRank: { rank, star, ticket, slToken, diceRefilledAt } }
      set(state => ({
        // 이전 랭크를 보존해 두었다가 애니메이션에 사용
        previousRank: state.rank,

        // myRank 필드로부터 각 값 갱신
        rank: data.myRank.rank,
        starPoints: data.myRank.star,
        lotteryCount: data.myRank.ticket,
        slToken: data.myRank.slToken,

        // 모달 데이터도 함께 업데이트
        modalRank: data.myRank.rank,
        modalPreviousRank: state.rank,
        modalStarPoints: data.myRank.star,
        modalLotteryCount: data.myRank.ticket,
        modalSlToken: data.myRank.slToken,

        // 상위 10명 리스트
        leaderTabData: data.leaderBoard,
      }))
    } catch (err) {
      console.error('fetchLeaderTab error', err)
    }
  },
  
  //타임존 추가
  timeZone: null,
  setTimeZone: (timeZone) => set({ timeZone }),
  
  // suspend 필드 추가 (초기값 false)
  suspend: false,
  setSuspend: (suspend) => set({ suspend }),

  
  redirect: false,
  setRedirect: (redirect) => set({ redirect }),


  pet : {
    type: null,
    level: null,
    exp: 0,
  },
  setPet: (update: Partial<Pet>) =>
    set((state) => ({
      pet: {
        ...state.pet,
        ...update,
      },
    })),

  // 초기 상태 값 설정
   // 새 필드 추가: nickName, uid, walletAddress
   nickName: null,
   setNickName: (nickName) => set({ nickName }),
   uid: null,
   setUid: (uid) => set({ uid }),
   walletAddress: null,
   // 기존의 setWalletAddress는 walletStore와 혼동되므로, 사용자용 walletAddress도 분리해서 관리합니다.
   setWalletAddress: (walletAddress) => set({ walletAddress }),

  referrerId: null, // 추가된 부분: 초기값 설정
  setReferrerId: (referrerId) => set({ referrerId }), // 추가된 부분

  isAuto: false, // 추가된 부분: 초기값 설정
  setIsAuto: (isAuto: boolean) =>
    set((state) => ({
      isAuto: state.items.autoNftCount > 0 ? isAuto : false,
    })),// 추가된 부분

  position: 0,
  setPosition: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      position: typeof value === 'function' ? value(state.position) : value,
    })),
    
  starPoints: 0,
  setStarPoints: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      starPoints: typeof value === 'function' ? value(state.starPoints) : value,
    })),

  diceCount: 0,
  setDiceCount: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      diceCount: typeof value === 'function' ? value(state.diceCount) : value,
    })),

  lotteryCount: 0,
  setLotteryCount: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      lotteryCount: typeof value === 'function' ? value(state.lotteryCount) : value,
    })),

  userLv: 100,
  setUserLv: (userLv) => set({ userLv }),

  completeTutorial: true,
  setCompleteTutorial: (completeTutorial) => set({ completeTutorial }),

  characterType: null, // 수정된 부분: 초기값을 null로 설정
  setCharacterType: (type) => set({ characterType: type }), // 수정된 부분: null 허용

  slToken: 0,
  setSlToken: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      slToken: typeof value === "function" ? value(state.slToken) : value,
    })),

  rank: 0,
  setRank: (rank) =>
    set((state) => ({
      previousRank: state.rank, // 현재 랭크를 이전 랭크로 저장
      rank, // 새 랭크 업데이트
    })),

  previousRank: 0,

  monthlyPrize: {
    year: 0,
    month: 0,
    prizeType: '',
    amount: 0,
    eventFinishTime: "",
  },
  setMonthlyPrize: (monthlyPrize) => set({ monthlyPrize }),

  weekAttendance: {
    mon: null,
    tue: null,
    wed: null,
    thu: null,
    fri: null,
    sat: null,
    sun: null,
  },
  setWeekAttendance: (weekAttendance) => set({ weekAttendance }),

  currentMiniGame: '',
  setCurrentMiniGame: (game) => set({ currentMiniGame: game }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  error: null,
  setError: (error) => set({ error }),

  diceResult: 0,
  rollDice: async (gauge: number): Promise<RollDiceResponseData> => {
    set({ isLoading: true, error: null });
  
    const sequence = get().position; // 현재 위치 가져오기
  
    try {
      const data = await rollDiceAPI(gauge, sequence);
  
      // 서버 응답에서 level과 exp를 상태에 직접 설정
      set((state) =>({
        previousRank: state.rank, // 이전 랭크 저장
        rank: data.rank,
        starPoints: data.star,
        lotteryCount: data.ticket,
        diceCount: data.dice,
        slToken: data.slToken,
        userLv: data.level, // 레벨 업데이트
        pet: {
          ...get().pet,
          level: data.level,
          exp: data.exp,
        },
        isLoading: false,
        error: null,
      }));
  
      return data; // 데이터를 반환합니다.
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Roll dice failed' });
      throw error;
    }
  },
  

  diceRefilledAt: null,
  setDiceRefilledAt: (value) => set({ diceRefilledAt: value }),

  items: {
    goldCount: 0,
    silverCount: 0,
    bronzeCount: 0,
    timeDiceTimes: 1,
    boardRewardTimes: 1,
    ticketTimes: 1,
    spinTimes: 1, // 추가된 필드 초기값 설정
    autoNftCount: 0, // 추가된 필드 초기값 설정
    rewardNftCount: 0, // 추가된 필드 초기값 설정
  },
  setItems: (items) => set({ items }),

  boards: [],
  setBoards: (boards) => set({ boards }),

  // 사용자 데이터 설정 함수
  fetchUserData: async () => {
    set({ isLoading: true, error: null });
    try {
      let data = await fetchHomeData();
      if (!data || data.data === null) {
        // 응답 객체가 있고, message가 "Please choose your character first."인 경우 바로 에러 발생
        if (data && data.message === "Please choose your character first.") {
          throw new Error(data.message);
        }
      }

      // 서버 응답에서 필요한 데이터 추출
      const {
        user,
        nowDice,
        rank,
        pet,
        monthlyPrize,
        weekAttendance,
        items,
        boards,
        bgm
      } = data.data;
  
      set({
        // userId를 nickName으로 대체
        nickName: user.nickName,
        uid: user.uid,
        walletAddress: user.walletAddress,
        referrerId: user.referrerId, // 추가된 부분: referrerId 설정
        isAuto: items.autoNftCount > 0 ? user.isAuto : false, // 추가된 부분: isAuto 설정
        completeTutorial: user.completeTutorial,
        timeZone: user.timeZone,
        suspend: user.suspended, // 추가된 부분: suspend 값 저장
        redirect: user.redirect,
  
        position: nowDice.tileSequence,
        diceCount: nowDice.dice,
        starPoints: rank.star,
        lotteryCount: rank.ticket,
        userLv: pet.level || 100, // 서버에서 받은 레벨 설정, 기본값 1
        characterType: pet.type ? pet.type.toLowerCase() as 'dog' | 'cat' : null, // 수정된 부분: pet.type이 null일 수 있음
  
        slToken: rank.slToken,
        rank: rank.rank,
        previousRank: rank.rank,
        diceRefilledAt: rank.diceRefilledAt, // 추가된 부분: diceRefilledAt 설정
  
        items: {
          goldCount: items.goldCount || 0,
          silverCount: items.silverCount || 0,
          bronzeCount: items.bronzeCount || 0,
          timeDiceTimes: items.timeDiceTimes || 1,
          boardRewardTimes: items.boardRewardTimes || 1,
          ticketTimes: items.ticketTimes || 1,
          spinTimes: items.spinTimes || 1, // 추가된 필드 설정
          autoNftCount: items.autoNftCount || 0, // 추가된 필드 설정
          rewardNftCount: items.rewardNftCount || 0, // 추가된 필드 설정
        },
  
        boards: boards,
  
        monthlyPrize: {
          year: monthlyPrize.year,
          month: monthlyPrize.month,
          prizeType: monthlyPrize.prizeType,
          amount: monthlyPrize.amount,
          eventFinishTime: monthlyPrize.eventFinishTime, // 추가된 부분: eventFinish
        },
  
        weekAttendance: {
          mon: weekAttendance.mon,
          tue: weekAttendance.tue,
          wed: weekAttendance.wed,
          thu: weekAttendance.thu,
          fri: weekAttendance.fri,
          sat: weekAttendance.sat,
          sun: weekAttendance.sun,
        },
  
        pet: {
          type: pet.type ? pet.type.toLowerCase() as 'DOG' | 'CAT' : null,
          level: pet.level || 1, // 서버에서 받은 레벨 설정, 기본값 1
          exp: pet.exp || 0, // 서버에서 받은 경험치 설정, 기본값 0
        },
  
        isLoading: false,
        error: null,
      });
      const soundStore = useSoundStore.getState();

      soundStore.setMasterVolume((bgm.masterVolume / 10) * 0.3);
      soundStore.setBgmVolume((bgm.backVolume / 10) * 0.3);
      soundStore.setSfxVolume((bgm.effectVolume / 10) * 0.3);

      useSoundStore.setState({
        masterMuted: bgm.masterMute,
        bgmMuted: bgm.backMute,
        sfxMuted: bgm.effectMute,
      });

    } catch (error: any) {
      // error.response.data.message가 있으면 그 값을 사용
      const errorMessage = error.response?.data?.message || error.message;
      // console.error('fetchUserData 실패:', errorMessage);
      set({ isLoading: false, error: errorMessage });
      // 새로운 에러 객체를 던져서 error.message에 원하는 메시지가 포함되도록 함
      throw new Error(errorMessage);
    }
  },
  

  // 로그인 함수
  login: async (initData: string): Promise<void> => {
    // console.log('Step: login 시작, initData:', initData);
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { initData });

      if (response.data.code === 'OK') {
        const { userId, accessToken, refreshToken } = response.data.data;
        // console.log('Step: login 성공, userId:', userId);
        // 토큰 및 userId 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({  });

        // 사용자 데이터 가져오기
        await get().fetchUserData();
        set({ isLoading: false, error: null });
      } else if (response.data.code === 'ENTITY_NOT_FOUND') {
        // console.warn('Step: login 응답 코드 ENTITY_NOT_FOUND:', response.data.message);
        throw new Error(response.data.message || 'User not found');
      } else {
        // console.warn('Step: login 응답 코드가 OK가 아님:', response.data.message);
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      // console.error('Step: login 실패:', error);
      let errorMessage = 'Login failed. Please try again.';
      if (error.response) {
        // 서버가 응답을 했지만, 상태 코드가 2xx가 아닌 경우
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // 요청이 이루어졌으나, 응답을 받지 못한 경우
        errorMessage = 'No response from server. Please try again later.';
      } else {
        // 다른 에러
        errorMessage = error.message;
      }
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage); // 에러를 다시 던져 호출한 쪽에서 인지할 수 있도록 함
    }
  },

  // 회원가입 함수
  signup: async (initData: string, petType: 'DOG' | 'CAT'): Promise<void> => {
    // console.log('Step: signup 시작, initData:', initData, 'petType:', petType);
    set({ isLoading: true, error: null });
    try {
      // 회원가입 요청 보내기
      await api.post('/auth/signup', { initData, petType });

      set({ isLoading: false, error: null });
    } catch (error: any) {
      // console.error('Step: signup 실패:', error);
      let errorMessage = 'Signup failed. Please try again.';
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again later.';
      } else {
        errorMessage = error.message;
      }
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage); // 에러를 다시 던져 호출한 쪽에서 인지할 수 있도록 함
    }
  },

  // 로그아웃 함수
  logout: () => {
    // console.log('Step: logout 실행. 토큰 및 userId 제거 및 상태 초기화.');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken'); // 추가된 부분: refreshToken 제거
    set({
      nickName: null,
      uid: null,
      walletAddress: null,
      referrerId: null, // 추가된 부분: referrerId 초기화
      isAuto: false, // 추가된 부분: isAuto 초기화
      timeZone: null,
      suspend: false, // 추가된 부분: suspend 초기화
      redirect:false,
      position: 0,
      diceCount: 0,
      starPoints: 0,
      lotteryCount: 0,
      userLv: 100,
      characterType: null, // 수정된 부분: characterType 초기화
      slToken: 0,
      rank: 0,
      monthlyPrize: {
        year: 0,
        month: 0,
        prizeType: '',
        amount: 0,
        eventFinishTime: "",
      },
      weekAttendance: {
        mon: null,
        tue: null,
        wed: null,
        thu: null,
        fri: null,
        sat: null,
        sun: null,
      },
      currentMiniGame: '',
      isLoading: false,
      error: null,
      items: {
        goldCount: 0,
        silverCount: 0,
        bronzeCount: 0,
        timeDiceTimes: 0,
        boardRewardTimes: 0,
        ticketTimes: 0,
        spinTimes: 0, // 추가된 필드 초기화
        autoNftCount: 0, // 추가된 필드 초기화
        rewardNftCount: 0, // 추가된 필드 초기화
      },
      boards: [],
    });
  },

  // 토큰 갱신 함수
  refreshToken: async (): Promise<boolean> => {
    // console.log('Step: refreshToken 시작');
    try {
      const response = await api.get('/auth/refresh');
      // console.log('Step: refreshToken 응답:', response);
  
      const newAccessToken = response.headers['authorization'];
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken.replace('Bearer ', ''));
        // console.log('Step: 새로운 accessToken 저장 완료');
        return true;
      } else {
        // console.warn('Step: Authorization 헤더가 없습니다.');
        throw new Error('Token refresh failed: Authorization header is missing');
      }
    } catch (error: any) {
      // console.error('Step: refreshToken 실패:', error);
      // Refresh 실패 시 로그아웃 처리
      get().logout();
      set({ error: 'Token refresh failed. Please log in again.' });
      return false;
    }
  },  

  refillDice: async () => {
    set({ error: null });
    try {
      const data = await refillDiceAPI();

      const { nowDice, rank }  = data;
      
      // 주사위 리필 후 diceCount만 업데이트
      set({
        diceCount: nowDice.dice,
        diceRefilledAt: rank.diceRefilledAt,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // console.error('주사위 리필 중 에러 발생:', error);
      set({ error: error.message || '주사위 리필에 실패했습니다.' });
      throw error; 
    }
  },

  
  autoSwitch: async () => {
    set({ error: null });
    try {
      const data = await autoAPI();

      const { isAuto }  = data;
    
      set({
        isAuto
      });
  
      // console.log('스위치 변경 성공:', data);
    } catch (error: any) {
      // console.error('스위치 변경 중 에러 발생:', error);
      set({ error: error.message || '스위치 변경에 실패했습니다.' });
      throw error; 
    }
  },

  completeTutorialFunc: async () => {
    set({ error: null });
    try {
      const data = await completeTutorialAPI();

      const { completeTutorial }  = data;
    
      set({
        completeTutorial
      });
  
      // console.log('튜토리얼 완료:', data);
    } catch (error: any) {
      // console.error('튜토리얼 중 에러 발생:', error);
      set({ error: error.message || '튜토리얼에 실패했습니다.' });
      throw error; 
    }
  },


  
    

   // 테스트용 아이템 추가 함수들
   addGoldItem: async () => {
    try {
      const response = await api.get('/test/items/gold');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('골드 아이템 추가 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '골드 아이템 추가 실패');
      }
    } catch (error: any) {
      // console.error('골드 아이템 추가 실패:', error);
      set({ error: error.message || '골드 아이템 추가에 실패했습니다.' });
      throw error;
    }
  },

  removeGoldItem: async () => {
    try {
      const response = await api.get('/test/items/gold/delete');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('골드 아이템 삭제 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '골드 아이템 삭제 실패');
      }
    } catch (error: any) {
      // console.error('골드 아이템 삭제 실패:', error);
      set({ error: error.message || '골드 아이템 삭제에 실패했습니다.' });
      throw error;
    }
  },

  addSilverItem: async () => {
    try {
      const response = await api.get('/test/items/silver');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('실버 아이템 추가 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '실버 아이템 추가 실패');
      }
    } catch (error: any) {
      // console.error('실버 아이템 추가 실패:', error);
      set({ error: error.message || '실버 아이템 추가에 실패했습니다.' });
      throw error;
    }
  },

  removeSilverItem: async () => {
    try {
      const response = await api.get('/test/items/silver/delete');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('실버 아이템 삭제 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '실버 아이템 삭제 실패');
      }
    } catch (error: any) {
      // console.error('실버 아이템 삭제 실패:', error);
      set({ error: error.message || '실버 아이템 삭제에 실패했습니다.' });
      throw error;
    }
  },

  addBronzeItem: async () => {
    try {
      const response = await api.get('/test/items/bronze');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('브론즈 아이템 추가 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '브론즈 아이템 추가 실패');
      }
    } catch (error: any) {
      // console.error('브론즈 아이템 추가 실패:', error);
      set({ error: error.message || '브론즈 아이템 추가에 실패했습니다.' });
      throw error;
    }
  },

  removeBronzeItem: async () => {
    try {
      const response = await api.get('/test/items/bronze/delete');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('브론즈 아이템 삭제 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '브론즈 아이템 삭제 실패');
      }
    } catch (error: any) {
      // console.error('브론즈 아이템 삭제 실패:', error);
      set({ error: error.message || '브론즈 아이템 삭제에 실패했습니다.' });
      throw error;
    }
  },

  addRewardItem: async () => {
    try {
      const response = await api.get('/test/items/reward');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('스핀/말판 리워드 아이템 추가 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '스핀/말판 리워드 아이템 추가 실패');
      }
    } catch (error: any) {
      // console.error('스핀/말판 리워드 아이템 추가 실패:', error);
      set({ error: error.message || '스핀/말판 리워드 아이템 추가에 실패했습니다.' });
      throw error;
    }
  },

  removeRewardItem: async () => {
    try {
      const response = await api.get('/test/items/reward/delete');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('스핀/말판 리워드 아이템 삭제 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '스핀/말판 리워드 아이템 삭제 실패');
      }
    } catch (error: any) {
      // console.error('스핀/말판 리워드 아이템 삭제 실패:', error);
      set({ error: error.message || '스핀/말판 리워드 아이템 삭제에 실패했습니다.' });
      throw error;
    }
  },

  addAutoItem: async () => {
    try {
      const response = await api.get('/test/items/auto');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('오토 아이템 추가 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '오토 아이템 추가 실패');
      }
    } catch (error: any) {
      // console.error('오토 아이템 추가 실패:', error);
      set({ error: error.message || '오토 아이템 추가에 실패했습니다.' });
      throw error;
    }
  },

  removeAutoItem: async () => {
    try {
      const response = await api.get('/test/items/auto/delete');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('오토 아이템 삭제 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '오토 아이템 삭제 실패');
      }
    } catch (error: any) {
      // console.error('오토 아이템 삭제 실패:', error);
      set({ error: error.message || '오토 아이템 삭제에 실패했습니다.' });
      throw error;
    }
  },

  addAllItems: async () => {
    try {
      const response = await api.get('/test/items/all');
      if (response.data.code === 'OK') {
        set({ items: response.data.data });
        // console.log('전체 아이템 추가 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '전체 아이템 추가 실패');
      }
    } catch (error: any) {
      // console.error('전체 아이템 추가 실패:', error);
      set({ error: error.message || '전체 아이템 추가에 실패했습니다.' });
      throw error;
    }
  },

  addDice: async () => {
    try {
      const response = await api.get('/test/items/dice');
      if (response.data.code === 'OK') {
        set({ diceCount: response.data.data.diceCount });
        // console.log('주사위 아이템 추가 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '주사위 아이템 추가 실패');
      }
    } catch (error: any) {
      // console.error('주사위 아이템 추가 실패:', error);
      set({ error: error.message || '주사위 아이템 추가에 실패했습니다.' });
      throw error;
    }
  },

  removeDice: async () => {
    try {
      const response = await api.get('/test/items/dice/delete');
      if (response.data.code === 'OK') {

        set({ diceCount: response.data.data.diceCount });
        // console.log('주사위 아이템 삭제 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || '주사위 아이템 삭제 실패');
      }
    } catch (error: any) {
      // console.error('주사위 아이템 삭제 실패:', error);
      set({ error: error.message || '주사위 아이템 삭제에 실패했습니다.' });
      throw error;
    }
  },

  addSLToken: async () => {
    try {
      const response = await api.get('/test/items/sl');
      if (response.data.code === 'OK') {
        set({ slToken: response.data.data.slCount });
        // console.log('SL 토큰 아이템 추가 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || 'SL 토큰 아이템 추가 실패');
      }
    } catch (error: any) {
      // console.error('SL 토큰 아이템 추가 실패:', error);
      set({ error: error.message || 'SL 토큰 아이템 추가에 실패했습니다.' });
      throw error;
    }
  },

  removeSLToken: async () => {
    try {
      const response = await api.get('/test/items/sl/delete');
      if (response.data.code === 'OK') {
        set({ slToken: response.data.data.slCount });
        // console.log('SL 토큰 아이템 삭제 성공:', response.data.data);
      } else {
        throw new Error(response.data.message || 'SL 토큰 아이템 삭제 실패');
      }
    } catch (error: any) {
      // console.error('SL 토큰 아이템 삭제 실패:', error);
      set({ error: error.message || 'SL 토큰 아이템 삭제에 실패했습니다.' });
      throw error;
    }
  },

  modalRank: null,
  modalPreviousRank: null,
  modalStarPoints: null,
  modalLotteryCount: null,
  modalSlToken: null,
  resetModalData: () => {
    set({
      modalRank: null,
      modalPreviousRank: null,
      modalStarPoints: null,
      modalLotteryCount: null,
      modalSlToken: null,
    });
  },
}));

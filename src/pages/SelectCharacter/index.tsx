import React from 'react';
import SelectCharacter from './SelectCharacter';
import chooseCharacter from '@/entities/User/api/chooseCharacter';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const SelectCharacterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPet, setSelectedPet] = React.useState<'DOG' | 'CAT'>('DOG');
  
  const handleCharacterSelect = async () => {
    try{
      const response = await chooseCharacter(selectedPet);
      if(response){
        // 정상 반환이면 메인 페이지로 이동
        navigate('/first-reward');
      }else{
        // console.log("캐릭터 선택 에러 발생");
        localStorage.removeItem('accessToken');
        navigate('/');
      }
    }catch(error: any){
      // console.log("다시 시작해보아요.");
      localStorage.removeItem('accessToken');
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen">
      <SelectCharacter selectedPet={selectedPet} setSelectedPet={setSelectedPet} />
      <div className="bottom-10 left-0 right-0 absolute flex w-full self-center px-6">
          <button
            className={`h-14 text-white rounded-[10px] w-full mx-6 ${
              selectedPet ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{
              background: 'linear-gradient(135deg, #4FD9FF 0%, #02BCFF 100%)',
              border: '2px solid #82E4FF',
              boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)',
            }}
            disabled={!selectedPet}
            onClick={handleCharacterSelect}
            >
            {t("character_page.Continue")}
          </button>
        </div>
    </div>
  );
};

export default SelectCharacterPage;

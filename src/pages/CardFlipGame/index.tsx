import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCardFlip from 'react-card-flip';
import { useTranslation } from 'react-i18next';
import { useSound } from '@/shared/provider/SoundProvider';
import Audios from '@/shared/assets/audio';
import { flipCard, CardFlipResponseData } from '@/features/DiceEvent/api/cardFlipApi';
import Images from '@/shared/assets/images';

interface CardFlipGameProps {
  onGameEnd: (result: 'win' | 'lose', reward?: { type: string; amount: number }) => void;
  onCancel: () => void;
}

const CardFlipGame: React.FC<CardFlipGameProps> = ({ onGameEnd, onCancel }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState<{
    success: boolean;
    reward?: { type: string; amount: number };
  } | null>(null);
  const [cards, setCards] = useState<number[]>([1, 2]);
  const { t } = useTranslation();
  const { playSfx } = useSound();

  useEffect(() => {
    // 게임 시작 시 카드 순서 섞기
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  }, []);

  const handleCardClick = async (index: number) => {
    if (!gameStarted || selectedCard !== null || isLoading) return;

    try {
      setIsLoading(true);
      playSfx(Audios.high_pass);
      setSelectedCard(index);
      
      // 서버에 카드 뒤집기 요청
      const response = await flipCard();
      
      // 카드 뒤집기 애니메이션
      setIsFlipped(true);

      // 1초 후에 결과 표시
      setTimeout(() => {
        if (response.success) {
          playSfx(Audios.rps_win);
        } else {
          playSfx(Audios.rps_lose);
        }
        setGameResult(response);
        setShowResult(true);
      }, 1000);
    } catch (error) {
      console.error('카드 뒤집기 실패:', error);
      setSelectedCard(null);
      setIsFlipped(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    playSfx(Audios.roll_dice);
    setGameStarted(true);
  };

  const handleConfirm = () => {
    if (gameResult) {
      onGameEnd(gameResult.success ? 'win' : 'lose', gameResult.reward);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#21212F] p-8 rounded-3xl w-[90%] max-w-[600px]">
        {!gameStarted ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">{t('card_flip_game.title')}</h2>
            <p className="text-white mb-8">{t('card_flip_game.description')}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleStartGame}
                className="bg-[#F59E0B] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#D97706] transition-colors"
              >
                {t('card_flip_game.start')}
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-700 transition-colors"
              >
                {t('card_flip_game.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-8 mb-8">
              {cards.map((card, index) => (
                <ReactCardFlip
                  key={index}
                  isFlipped={selectedCard === index && isFlipped}
                  flipDirection="horizontal"
                >
                  {/* 카드 앞면 */}
                  <div
                    onClick={() => handleCardClick(index)}
                    className={`w-[220px] h-[300px] rounded-xl flex items-center justify-center ${
                      selectedCard === null && !isLoading ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <img 
                      src={index === 0 ? Images.CardCat : Images.CardDog} 
                      alt="card" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  {/* 카드 뒷면 */}
                  <div className="w-[220px] h-[300px] bg-white rounded-xl flex items-center justify-center">
                    <img 
                      src={card === 1 ? Images.CardPoint : Images.CardBomb}
                      alt="card result"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </ReactCardFlip>
              ))}
            </div>

            {showResult && (
              <div className="text-center">
                <h3 className={`text-2xl font-bold mb-4 ${gameResult?.success ? 'text-[#F59E0B]' : 'text-gray-400'}`}>
                  {gameResult?.success ? t('card_flip_game.success') : t('card_flip_game.fail')}
                </h3>
                {gameResult?.success && gameResult.reward && (
                  <p className="text-white mb-4">
                    {t('card_flip_game.reward', { type: gameResult.reward.type, amount: gameResult.reward.amount })}
                  </p>
                )}
                <button
                  onClick={handleConfirm}
                  className="bg-[#0147E5] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#0137B0] transition-colors"
                >
                  {t('card_flip_game.confirm')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardFlipGame; 
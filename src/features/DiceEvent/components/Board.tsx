import React from 'react';
import { motion } from 'framer-motion';
import calculateTilePosition from '@/shared/utils/calculateTilePosition';

interface ItemOverlay {
  id: string;
  imageSrc: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  size?: 'small' | 'medium' | 'large';
}

interface BoardProps {
  position: number;
  charactorImageSrc?: string;
  charactorImageSrcs?: string[];
  initialX: number;
  initialY: number;
  delta: number;
  itemOverlays?: ItemOverlay[];
}

const Board: React.FC<BoardProps> = ({
  position,
  charactorImageSrc,
  charactorImageSrcs,
  initialX,
  initialY,
  delta,
  itemOverlays = [],
}) => {
  const { x, y } = calculateTilePosition(position, initialX, initialY, delta);

  // position이 10보다 큰 경우 좌우 반전 스타일 적용
  const flipStyle = position > 10 ? { transform: 'scaleX(-1)' } : {};

  // 아이템 위치에 따른 스타일 계산
  const getItemPositionStyle = (position: string, size: string = 'medium') => {
    // ... 기존 코드 ...
  };

  return (
    <motion.div
      className={`absolute z-40`}
      initial={{ x: initialX, y: initialY }}
      animate={{ x, y }}
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 25 },
        y: { type: 'spring', stiffness: 300, damping: 15 },
      }}
    >
      <div
        className="absolute w-full h-full rounded-full bottom-0 left-1/2 transform -translate-x-1/2"
        style={{
          width: '70%',
          height: '10%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '50%',
        }}
      ></div>
      
      {/* 캐릭터 이미지 컨테이너 */}
      <div className="relative">
        {/* 여러 이미지를 겹쳐서 렌더링 */}
        {(charactorImageSrcs && charactorImageSrcs.length > 0
          ? charactorImageSrcs
          : charactorImageSrc
            ? [charactorImageSrc]
            : []
        ).map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`charactor-layer-${idx}`}
            className="w-12 h-12 md:w-20 md:h-20 absolute top-0 left-0"
            style={flipStyle}
          />
        ))}
        
        {/* 아이템 오버레이들 */}
        {itemOverlays.map((item) => (
          <img
            key={item.id}
            src={item.imageSrc}
            alt={`item-${item.id}`}
            className={`${getItemPositionStyle(item.position, item.size)} z-50`}
            style={flipStyle}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Board;

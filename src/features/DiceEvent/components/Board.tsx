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
    const sizeMap = {
      small: 'w-4 h-4 md:w-6 md:h-6',
      medium: 'w-6 h-6 md:w-8 md:h-8',
      large: 'w-8 h-8 md:w-10 md:h-10',
    };
    const positionMap = {
      top: 'absolute -top-2 left-1/2 transform -translate-x-1/2',
      bottom: 'absolute -bottom-2 left-1/2 transform -translate-x-1/2',
      left: 'absolute top-1/2 -left-2 transform -translate-y-1/2',
      right: 'absolute top-1/2 -right-2 transform -translate-y-1/2',
      center: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    };
    return `${positionMap[position as keyof typeof positionMap]} ${sizeMap[size as keyof typeof sizeMap]}`;
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
      <div className="relative">
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

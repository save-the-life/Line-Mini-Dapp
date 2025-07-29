import React from 'react';
import Images from '@/shared/assets/images';

const StarTile: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex flex-col gap-1 items-center">
    <img src={Images.StarpointIcon} alt="star" className="h-[44px] w-[44px]" />
    <p className="text-xs">x {count}</p>
  </div>
);

const DiceTile: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex flex-col gap-1 items-center">
    <img src={Images.DiceIcon} alt="dice" className="h-[44px] w-[44px]" />
    <p className="text-xs">x {count}</p>
  </div>
);

const AirplaneTile: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col gap-1 items-center">
    <img
      src={Images.AirplaneIcon}
      alt="airplane"
      className="h-[44px] w-[44px]"
    />
    <p className="text-xs">{text}</p>
  </div>
);

export { StarTile, DiceTile, AirplaneTile };

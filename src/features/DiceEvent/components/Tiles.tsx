import React from "react";
import Images from "@/shared/assets/images";

const StarTile: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex flex-col gap-1 items-center">
    <img src={Images.Star} alt="star" className="h-4 w-4" />
    <p className="text-xs font-bold text-white drop-shadow">x {count}</p>
  </div>
);

const DiceTile: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex flex-col gap-1 items-center">
    <img src={Images.Dice} alt="dice" className="h-4 w-4" />
    <p className="text-xs font-bold text-white drop-shadow">x {count}</p>
  </div>
);

const AirplaneTile: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col gap-1 items-center">
    <img src={Images.Airplane} alt="airplane" className="h-4 w-4" />
    <p className="text-xs font-bold text-white drop-shadow">{text}</p>
  </div>
);

export { StarTile, DiceTile, AirplaneTile };

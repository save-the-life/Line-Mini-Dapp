//src\features\DiceEvent\components\Gauge.tsx

import React from 'react';

const Gauge: React.FC<{ gaugeValue: number }> = ({ gaugeValue }) => {
  // 게이지 값을 0-100%로 변환
  const percentage = Math.min((gaugeValue / 6) * 100, 100);
  
  return (
    <div 
      id="second-step"
      className="z-0 w-64 -top-4 absolute md:w-96 md:top-2 max-h-24 flex items-center justify-center"
    >
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-white to-red-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Gauge;

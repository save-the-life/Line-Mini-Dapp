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
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden relative">
        {/* 6개 세그먼트 구분선 */}
        <div className="absolute inset-0 flex">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="flex-1 border-r border-gray-300 last:border-r-0"
            />
          ))}
        </div>
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ease-out relative z-10"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Gauge;

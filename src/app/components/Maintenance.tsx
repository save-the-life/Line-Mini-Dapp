// src/components/Maintenance.tsx
import React from 'react';
import Images from '@/shared/assets/images';

const MaintenanceScreen: React.FC = () => {
  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{
          backgroundImage: `url(${Images.DarkSplash})`,
      }}
    >
    </div>
  );
};

export default MaintenanceScreen;

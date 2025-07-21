import React from 'react';
import BottomNavigation from '@/widgets/BottomNav/BottomNav';
import Images from '@/shared/assets/images';
import { useLocation } from 'react-router-dom';

const backgroundMap: Record<string, string> = {
  "/previous-rewards": Images.BackgroundLobby,
  "/mission": Images.BackgroundLobby,
  "/reward": Images.BackgroundLobby,
  "/choose-character": Images.BackgroundLobby,
  "/dice-event": Images.BackgroundTopview,
  // 필요시 추가
};

interface DiveEventLayoutProps {
  children: React.ReactNode;
  className?: string;
  hidden? : boolean;
}

const DiceEventLayout: React.FC<DiveEventLayoutProps> = ({
  children,
  className,
  hidden,
}) => {
  const location = useLocation();
  const bgImage = backgroundMap[location.pathname] || Images.BackgroundHome;

  return (
    <div
      className={`flex flex-col bg-[#0D1226] items-center  ${className || ''}`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div className={`max-w-[600px] w-full h-full`}>{children}</div>
      <BottomNavigation hidden={hidden} />
    </div>
  );
};

export default DiceEventLayout;

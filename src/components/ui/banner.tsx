import React from 'react';

interface BannerProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const Banner: React.FC<BannerProps> = ({ message, type = 'info' }) => {
  const getBannerColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  return (
    <div className={`px-4 py-3 rounded relative border-l-4 ${getBannerColor()}`} role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default Banner;

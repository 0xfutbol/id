import { CircularProgress } from "@nextui-org/react";
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <CircularProgress color="primary" size="lg" />
    </div>
  );
};

export default LoadingScreen;

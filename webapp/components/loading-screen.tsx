import { CircularProgress } from "@heroui/react";
import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <CircularProgress color="primary" size="lg" />
    </div>
  );
};

export default LoadingScreen;

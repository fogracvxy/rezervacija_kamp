import React from "react";
import { Rings } from "react-loader-spinner";
const Loading = () => {
  return (
    <div className="spinner text-center">
      <Rings
        color="#698A2E"
        height="100%"
        width="100%"
        timeout={5000} //3 secs
      />
    </div>
  );
};

export default Loading;

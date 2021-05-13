import React from "react";
import Loader from "react-loader-spinner";
const Loading = () => {
  return (
    <div className="spinner text-center">
      <Loader
        type="Rings"
        color="#bfaa72"
        height="100%"
        width="100%"
        timeout={5000} //3 secs
      />
    </div>
  );
};

export default Loading;

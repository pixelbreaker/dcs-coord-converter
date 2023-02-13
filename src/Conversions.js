import React, { useContext } from "react";
import { AppContext } from "./AppContext";

const Conversions = ({ lnglat }) => {
  const {
    currentPoint,
    inputName,
    inputType,
    inputValue,
    userPoints,
    setCurrentPoint,
    setCurrentPointState,
    setInputType,
    setInputValue,
    setUserPoints,
  } = useContext(AppContext);

  return <>Conversions</>;
};

export default Conversions;

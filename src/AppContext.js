import React, { createContext, useState } from "react";
import { useLocalStorage } from "react-use";

const AppContext = createContext();

const AppContextWrapper = ({ children }) => {
  const [inputType, setInputType] = useLocalStorage("userInputType", "MGRS");
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputName] = useState("");

  const [currentPoint, setCurrentPointState] = useState(0);

  const [userPoints, setUserPoints] = useLocalStorage("userPoints", []);
  function setCurrentPoint(index) {
    setCurrentPointState(index);
    if (userPoints[index]) {
      const { type, value } = userPoints[index].source;
      setInputType(type);
      setInputValue(value);
    }
  }

  const contextValues = {
    currentPoint,
    inputName,
    inputType,
    inputValue,
    userPoints,
    setCurrentPoint,
    setCurrentPointState,
    setInputName,
    setInputType,
    setInputValue,
    setUserPoints,
  };

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};

export { AppContext };
export default AppContextWrapper;

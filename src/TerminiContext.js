import React, { createContext, useState } from 'react';

export const TerminiContext = createContext();

export const TerminiProvider = ({ children }) => {
  const [termini, setTermini] = useState([]);

  return (
    <TerminiContext.Provider value={{ termini, setTermini }}>
      {children}
    </TerminiContext.Provider>
  );
};
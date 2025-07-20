import React, { createContext, useContext, useState, ReactNode } from 'react';

type MockedLoginContextType = {
  isMockedLoggedIn: boolean;
  mockedLogin: () => void;
  mockedLogout: () => void;
};

const MockedLoginContext = createContext<MockedLoginContextType | undefined>(undefined);

type MockedLoginProviderProps = {
  children: ReactNode;
};

export const MockedLoginProvider = ({ children }: MockedLoginProviderProps) => {
  const [isMockedLoggedIn, setIsMockedLoggedIn] = useState(true);

  const mockedLogin = () => setIsMockedLoggedIn(true);
  const mockedLogout = () => setIsMockedLoggedIn(false);

  return (
    <MockedLoginContext.Provider value={{ isMockedLoggedIn, mockedLogin, mockedLogout }}>
      {children}
    </MockedLoginContext.Provider>
  );
};

export const useMockedLogin = () => {
  const context = useContext(MockedLoginContext);
  if (!context) {
    throw new Error('useMockedLogin must be used within a MockedLoginProvider');
  }
  return context;
};

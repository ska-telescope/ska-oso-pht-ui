// src/context/AppFlowContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { cypressProposal } from '@utils/constants.ts';

export type AppFlowType = 'Science Verification' | 'Proposal' | 'Testing';

interface AppFlowContextType {
  appFlow: AppFlowType;
  isSV: () => boolean;
  setAppFlow: (flow: AppFlowType) => void;
}

const AppFlowContext = createContext<AppFlowContextType | undefined>(undefined);

export const AppFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [appFlow, _setAppFlow] = useState<AppFlowType>('Science Verification');
  let isSV: () => boolean;

  if (cypressProposal) {
    isSV = () => appFlow === 'Testing';
  } else {
    isSV = () => appFlow === 'Science Verification';
  }

  const setAppFlow = (_flow: AppFlowType) => {
    // Disabled for now
  };

  return (
    <AppFlowContext.Provider value={{ appFlow, isSV, setAppFlow }}>
      {children}
    </AppFlowContext.Provider>
  );
};

export const useAppFlow = () => {
  const context = useContext(AppFlowContext);
  if (!context) throw new Error('useAppFlow must be used within AppFlowProvider');
  return context;
};

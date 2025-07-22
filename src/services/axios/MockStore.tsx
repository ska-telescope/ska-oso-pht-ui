import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { mockCycleDataFrontend } from './getCycleData/mockCycleDataFrontend';
import ObservatoryData from '@/utils/types/observatoryData';

export type StoreType = ReturnType<typeof storageObject.useStore>;

// Mock the useStore method
export const MockStore: Partial<StoreType> = {
  user: null,
  telescopeAccess: () => undefined,
  isDeveloper: false,
  clearUser: () => ({ payload: undefined, type: 'user/clear' }),
  updateUser: (user: any) => ({ payload: user, type: 'user/update' }),
  // ...add all other required properties here...
  toggleTheme: () => ({ payload: undefined, type: 'theme/toggle' }),
  application: {
    content1: {},
    content2: {},
    content3: mockCycleDataFrontend as ObservatoryData,
    content4: {},
    content5: {}
  }
};

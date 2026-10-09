import React from 'react';
import { combineReducers, configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';

// FIXME: Delete all of this numbered slot nonsense.
// This was copy-pasted from the ska-gui-local-storage library to allow
// us to drop that dependency, but this should all be removed ASAP.

export interface ApplicationState {
  content1: object;
  content2: object;
  content3: object;
  content4: object;
  content5: object;
  content6: object;
  content7: object;
  content8: object;
  content9: object;
}

export interface HelpState {
  content: object | string;
  component: object | string;
  showHelp: boolean;
  contentURL: string;
  componentURL: string;
}

const applicationInitialState: ApplicationState = {
  content1: [],
  content2: [],
  content3: [],
  content4: [],
  content5: [],
  content6: [],
  content7: [],
  content8: [],
  content9: []
};

const applicationSlice = createSlice({
  name: 'Application',
  initialState: applicationInitialState,
  reducers: {
    clear: () => applicationInitialState,
    setContent1: (state, action: PayloadAction<object>) => {
      state.content1 = action.payload;
    },
    setContent2: (state, action: PayloadAction<object>) => {
      state.content2 = action.payload;
    },
    setContent3: (state, action: PayloadAction<object>) => {
      state.content3 = action.payload;
    },
    setContent4: (state, action: PayloadAction<object>) => {
      state.content4 = action.payload;
    },
    setContent5: (state, action: PayloadAction<object>) => {
      state.content5 = action.payload;
    },
    setContent6: (state, action: PayloadAction<object>) => {
      state.content6 = action.payload;
    },
    setContent7: (state, action: PayloadAction<object>) => {
      state.content7 = action.payload;
    },
    setContent8: (state, action: PayloadAction<object>) => {
      state.content8 = action.payload;
    },
    setContent9: (state, action: PayloadAction<object>) => {
      state.content9 = action.payload;
    }
  }
});

const helpInitialState: HelpState = {
  content: [],
  component: [],
  showHelp: false,
  contentURL: '',
  componentURL: ''
};

const helpSlice = createSlice({
  name: 'Help',
  initialState: helpInitialState,
  reducers: {
    setHelpComponent: (state, action: PayloadAction<object | string>) => {
      state.component = action.payload;
    },
    setHelpContent: (state, action: PayloadAction<object | string>) => {
      state.content = action.payload;
    },
    setHelpToggle: (state) => {
      state.showHelp = !state.showHelp;
    },
    setHelpComponentURL: (state, action: PayloadAction<string>) => {
      state.componentURL = action.payload;
    },
    setHelpContentURL: (state, action: PayloadAction<string>) => {
      state.contentURL = action.payload;
    }
  }
});

const rootReducer = combineReducers({
  application: applicationSlice.reducer,
  help: helpSlice.reducer
});

const store = configureStore({ reducer: rootReducer });

type RootState = ReturnType<typeof store.getState>;

export function StoreProvider({ children }: { children?: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

const application = applicationSlice.actions;
const help = helpSlice.actions;

export const storageObject = {
  useStore() {
    const applicationState = useSelector((s: RootState) => s.application);
    const helpState = useSelector((s: RootState) => s.help);
    const dispatch = useDispatch();

    return {
      application: applicationState,
      clearApplication: () => dispatch(application.clear()),
      updateAppContent1: (content: object) => dispatch(application.setContent1(content)),
      updateAppContent2: (content: object) => dispatch(application.setContent2(content)),
      updateAppContent3: (content: object) => dispatch(application.setContent3(content)),
      updateAppContent4: (content: object) => dispatch(application.setContent4(content)),
      updateAppContent5: (content: object) => dispatch(application.setContent5(content)),
      updateAppContent6: (content: object) => dispatch(application.setContent6(content)),
      updateAppContent7: (content: object) => dispatch(application.setContent7(content)),
      updateAppContent8: (content: object) => dispatch(application.setContent8(content)),
      updateAppContent9: (content: object) => dispatch(application.setContent9(content)),
      help: helpState,
      helpComponent: (content: string | object) => dispatch(help.setHelpComponent(content)),
      helpContent: (content: string | object) => dispatch(help.setHelpContent(content)),
      helpToggle: () => dispatch(help.setHelpToggle()),
      helpComponentURL: (content: string) => dispatch(help.setHelpComponentURL(content)),
      helpContentURL: (content: string) => dispatch(help.setHelpContentURL(content))
    };
  }
};

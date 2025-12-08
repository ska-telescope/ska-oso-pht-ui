import { describe, test, expect, vi } from 'vitest';
import { fireEvent, render, waitFor, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import MemberEntry from './MemberEntry';
import * as mockService from '@/services/axios/get/getUserByEmail/getUserByEmail';
import { AppFlowProvider, useAppFlow } from '@/utils/appFlow/AppFlowContext';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

let isSVFromContext: boolean;

const isEnabled = (testId: string, enabled: boolean = true) => {
  if (enabled) {
    expect(screen.getByTestId(testId)).not.toBeDisabled();
  } else {
    expect(screen.getByTestId(testId)).toBeDisabled();
  }
};

const hasValue = (testId: string, value: string) => {
  const wrapper = screen.getByTestId(testId);
  const input = wrapper.tagName === 'INPUT' ? wrapper : wrapper.querySelector('input');
  if (!input) throw new Error(`No input found inside testId="${testId}"`);
  expect(input).toHaveValue(value);
};

const enterValue = async (testId: string, value: string) => {
  const wrapper = screen.getByTestId(testId);
  const input = wrapper.tagName === 'INPUT' ? wrapper : wrapper.querySelector('input');
  if (!input) throw new Error(`No input found inside testId="${testId}"`);
  fireEvent.change(input, { target: { value: value } });
};

const clickButton = async (testId: string) => {
  const resolveButton = screen.getByTestId(testId);
  act(() => {
    fireEvent.click(resolveButton);
  });
};

const AppFlowTestBridge = () => {
  const { isSV } = useAppFlow();
  isSVFromContext = isSV();
  return null;
};

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>
        <ThemeA11yProvider>
          <AppFlowTestBridge />
          {component}
        </ThemeA11yProvider>
      </AppFlowProvider>
    </StoreProvider>
  );
};

describe('<MemberEntry /> search for user', () => {
  test('search for user successfully', async () => {
    vi.spyOn(mockService, 'default').mockResolvedValue(MockUserFrontendList[0]);
    wrapper(<MemberEntry />);
    isEnabled('email');
    await enterValue('email', MockUserFrontendList[0].email);
    hasValue('email', MockUserFrontendList[0].email);
    clickButton('userSearchButton');

    await waitFor(() => {
      isEnabled('email');
      hasValue('email', MockUserFrontendList[0].email);
      isEnabled('firstName');
      hasValue('firstName', MockUserFrontendList[0].firstName);
      isEnabled('lastName');
      hasValue('lastName', MockUserFrontendList[0].lastName);
    });
  });

  test('user not found', async () => {
    vi.spyOn(mockService, 'default').mockResolvedValue({
      error: 'User not found'
    } as any);
    wrapper(<MemberEntry />);
    isEnabled('email');
    await enterValue('email', 'unknown@skao.int');
    hasValue('email', 'unknown@skao.int');
    clickButton('userSearchButton');

    await waitFor(() => {
      isEnabled('email');
      hasValue('email', 'unknown@skao.int');
      isEnabled('firstName');
      isEnabled('lastName');
    });
  });

  test('fill user details manually', async () => {
    wrapper(<MemberEntry />);
    await waitFor(() => {
      expect(typeof isSVFromContext).toBe('boolean');
    });
    isEnabled('email');
    isEnabled('firstName');
    isEnabled('lastName');
    if (!isSVFromContext) {
      isEnabled('piCheckbox');
      isEnabled('PhDCheckbox');
    }
  });
});

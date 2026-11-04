import { describe, test, expect, vi } from 'vitest';
import { fireEvent, render, waitFor, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import MemberEntry from './MemberEntry';
import * as mockService from '@/services/axios/get/getUserByEmail/getUserByEmail';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

let isSVFromContext: boolean;

// Each field is found by its label, except the tick boxes, whose labels the library doesn't tie to
// the checkbox, so they go by order
const FIELDS = {
  email: () => screen.getByRole('textbox', { name: /email\.label/ }),
  firstName: () => screen.getByRole('textbox', { name: /firstName\.label/ }),
  lastName: () => screen.getByRole('textbox', { name: /lastName\.label/ }),
  piCheckbox: () => screen.getAllByRole('checkbox')[0],
  PhDCheckbox: () => screen.getAllByRole('checkbox')[1]
};
type Field = keyof typeof FIELDS;

const isEnabled = (field: Field, enabled: boolean = true) => {
  if (enabled) {
    expect(FIELDS[field]()).not.toBeDisabled();
  } else {
    expect(FIELDS[field]()).toBeDisabled();
  }
};

const hasValue = (field: Field, value: string) => {
  expect(FIELDS[field]()).toHaveValue(value);
};

const enterValue = async (field: Field, value: string) => {
  fireEvent.change(FIELDS[field](), { target: { value: value } });
};

const clickSearchButton = async () => {
  const searchButton = screen.getByRole('button', { name: 'search.label' });
  act(() => {
    fireEvent.click(searchButton);
  });
};

const AppFlowTestBridge = () => {
  const { isSV } = useOSDAccessors();
  isSVFromContext = isSV;
  return null;
};

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>
        <AppFlowTestBridge />
        {component}
      </ThemeA11yProvider>
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
    clickSearchButton();

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
    clickSearchButton();

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

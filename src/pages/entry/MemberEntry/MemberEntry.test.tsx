import { describe, test, expect } from 'vitest';
import { fireEvent, render, waitFor, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import userEvent from '@testing-library/user-event';
import MemberEntry from './MemberEntry';
import * as mockService from '@/services/axios/get/getUserByEmail/getUserByEmail';

const notifyErrorMock = vi.fn();

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({
    notifyError: notifyErrorMock,
    notifyWarning: vi.fn(),
    notifySuccess: vi.fn()
  })
}));

describe('<MemberEntry />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MemberEntry />
      </StoreProvider>
    );
  });
});

describe('<MemberEntry /> search for user', () => {
  beforeEach(() => {
    notifyErrorMock.mockReset();
  });

  test('search for user successfully', async () => {
    vi.spyOn(mockService, 'GetMockUserByEmail').mockResolvedValue(MockUserFrontendList[0]);

    const { container } = render(
      <StoreProvider>
        <MemberEntry />
      </StoreProvider>
    );

    const emailField = container.querySelector('input[id="email"]');
    act(() => {
      userEvent.clear(emailField!);
      userEvent.type(emailField!, MockUserFrontendList[0].email);
    });

    waitFor(() => {
      expect(emailField).toHaveValue(MockUserFrontendList[0].email);
    });

    const resolveButton = screen.getByTestId('userSearchButton');
    act(() => {
      fireEvent.click(resolveButton);
    });

    waitFor(() => {
      expect(emailField).toBeDisabled();
      expect(emailField).toHaveValue(MockUserFrontendList[0].email);
      const firstNameField = screen.findByDisplayValue(MockUserFrontendList[0].firstName);
      expect(firstNameField).toBeDisabled();
      expect(firstNameField).toHaveValue(MockUserFrontendList[0].firstName);
      const lastNameField = screen.findByDisplayValue(MockUserFrontendList[0].lastName);
      expect(lastNameField).toBeDisabled();
      expect(lastNameField).toHaveValue(MockUserFrontendList[0].lastName);
    });
  });

  test('user not found', async () => {
    vi.spyOn(mockService, 'GetMockUserByEmail').mockResolvedValue({
      error: 'User not found'
    } as any);

    const { container } = render(
      <StoreProvider>
        <MemberEntry />
      </StoreProvider>
    );

    const emailField = container.querySelector('input[id="email"]');
    act(() => {
      userEvent.clear(emailField!);
      userEvent.type(emailField!, 'unknown@skao.int');
    });

    waitFor(() => {
      expect(emailField).toHaveValue('unknown@skao.int');
    });

    const resolveButton = screen.getByTestId('userSearchButton');
    act(() => {
      fireEvent.click(resolveButton);
    });

    waitFor(() => {
      expect(emailField).not.toBeDisabled();
      expect(emailField).toHaveValue('unknown@skao.int');
      const firstNameField = screen.findByDisplayValue(MockUserFrontendList[0].firstName);
      expect(firstNameField).not.toBeDisabled();
      const lastNameField = screen.findByDisplayValue(MockUserFrontendList[0].lastName);
      expect(lastNameField).not.toBeDisabled();
      // TODO double-check these 2 assertions are working as expected
      expect(notifyErrorMock).not.toHaveBeenCalledTimes(1);
      expect(notifyErrorMock).toHaveBeenCalledWith('email.error', 5);
    });
  });

  test('fill user details manually', async () => {
    const { container } = render(
      <StoreProvider>
        <MemberEntry />
      </StoreProvider>
    );
    await waitFor(() => {
      const firstNameField = container.querySelector('[id="firstName"]');
      expect(firstNameField).not.toBeDisabled();
      const lastNameField = container.querySelector('[id="lastName"]');
      expect(lastNameField).not.toBeDisabled();
      const emailField = container.querySelector('[id="email"]');
      expect(emailField).not.toBeDisabled();
      // TODO
    });
  });
});

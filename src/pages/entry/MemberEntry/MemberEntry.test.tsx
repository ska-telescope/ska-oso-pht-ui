import { describe, test, expect } from 'vitest';
import { fireEvent, render, waitFor, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import userEvent from '@testing-library/user-event';
import MemberEntry from './MemberEntry';
import * as mockService from '@/services/axios/get/getUserByEmail/getUserByEmail';

// TODO rework this
// const updateAppContent5Mock = vi.fn();

// vi.mock('@ska-telescope/ska-gui-local-storage', async () => {
//   const actual = await vi.importActual<typeof import('@ska-telescope/ska-gui-local-storage')>(
//     '@ska-telescope/ska-gui-local-storage'
//   );

//   return {
//     ...actual,
//     storageObject: {
//       ...actual.storageObject,
//       useStore: () => ({
//         ...actual.storageObject.useStore(),
//         updateAppContent5: updateAppContent5Mock
//       })
//     }
//   };
// });

describe('<MemberEntry /> search for user', () => {
  // beforeEach(() => {
  //   updateAppContent5Mock.mockReset();
  // });

  test('search for user successfully', async () => {
    vi.spyOn(mockService, 'GetMockUserByEmail').mockResolvedValue(MockUserFrontendList[0]);

    const { container } = render(
      <StoreProvider>
        <MemberEntry />
      </StoreProvider>
    );

    const emailField = await screen.getByTestId('email');
    userEvent.clear(emailField!);
    userEvent.type(emailField!, MockUserFrontendList[0].email);
    expect(emailField).toHaveValue(MockUserFrontendList[0].email);

    const resolveButton = screen.getByTestId('userSearchButton');
    act(() => {
      fireEvent.click(resolveButton);
    });

    await waitFor(() => {
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

    await waitFor(() => {
      expect(emailField).toHaveValue('unknown@skao.int');
    });

    const resolveButton = screen.getByTestId('userSearchButton');
    act(() => {
      fireEvent.click(resolveButton);
    });

    await waitFor(() => {
      expect(emailField).not.toBeDisabled();
      expect(emailField).toHaveValue('unknown@skao.int');
      const firstNameField = screen.findByDisplayValue(MockUserFrontendList[0].firstName);
      expect(firstNameField).not.toBeDisabled();
      const lastNameField = screen.findByDisplayValue(MockUserFrontendList[0].lastName);
      expect(lastNameField).not.toBeDisabled();
      // // TODO double-check these 2 assertions, as they seem unstable
      // expect(updateAppContent5Mock).toHaveBeenCalledWith({
      //   level: 'error',
      //   delay: 5,
      //   message: 'email.error'
      // });
      // expect(updateAppContent5Mock).toHaveBeenCalled();
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

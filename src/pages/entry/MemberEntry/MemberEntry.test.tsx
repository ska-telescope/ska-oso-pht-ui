import { describe, test, expect } from 'vitest';
import { fireEvent, render, waitFor, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import userEvent from '@testing-library/user-event';
import MemberEntry from './MemberEntry';
import * as mockService from '@/services/axios/get/getUserByEmail/getUserByEmail';

describe('<MemberEntry />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MemberEntry />
      </StoreProvider>
    );
  });
});

describe('<MemberEntry /> forSearch', () => {
  test('renders correctly, forSearch true', async () => {
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
  //   test('renders correctly, forSearch false', async () => {
  //     const { container } = render(
  //       <StoreProvider>
  //         <MemberEntry />
  //       </StoreProvider>
  //     );
  //     await waitFor(() => {
  //       const firstNameField = container.querySelector('[id="firstName"]');
  //       expect(firstNameField).not.toBeDisabled();
  //       const lastNameField = container.querySelector('[id="lastName"]');
  //       expect(lastNameField).not.toBeDisabled();
  //       const emailField = container.querySelector('[id="email"]');
  //       expect(emailField).not.toBeDisabled();
  //     });
  //   });
  // });

  // describe('<MemberEntry /> foundInvestigator', () => {
  //   test('renders correctly, foundInvestigator provided', async () => {
  //     const { container } = render(
  //       <StoreProvider>
  //         <MemberEntry />
  //       </StoreProvider>
  //     );
  //     await waitFor(() => {
  //       const firstNameField = container.querySelector('[id="firstName"]');
  //       expect(firstNameField).toHaveValue(MockUserFrontendList[0].firstName);
  //       const lastNameField = container.querySelector('[id="lastName"]');
  //       expect(lastNameField).toHaveValue(MockUserFrontendList[0].lastName);
  //       const emailField = container.querySelector('[id="email"]');
  //       expect(emailField).toHaveValue(MockUserFrontendList[0].email);
  //     });
  //   });
  //   test('renders correctly, foundInvestigator not provided', async () => {
  //     const { container } = render(
  //       <StoreProvider>
  //         <MemberEntry />
  //       </StoreProvider>
  //     );
  //     await waitFor(() => {
  //       const firstNameField = container.querySelector('[id="firstName"]');
  //       expect(firstNameField).toHaveTextContent('');
  //       const lastNameField = container.querySelector('[id="lastName"]');
  //       expect(lastNameField).toHaveTextContent('');
  //       const emailField = container.querySelector('[id="email"]');
  //       expect(emailField).toHaveTextContent('');
  //     });
  //   });

  //   // TODO - Add more tests for MemberEntry component
});

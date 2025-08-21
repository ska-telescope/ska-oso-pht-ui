import { describe, test, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import MemberEntry from './MemberEntry';

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
    const { container } = render(
      <StoreProvider>
        <MemberEntry forSearch />
      </StoreProvider>
    );
    await waitFor(() => {
      const firstNameField = container.querySelector('[id="firstName"]');
      expect(firstNameField).toBeDisabled();
      const lastNameField = container.querySelector('[id="lastName"]');
      expect(lastNameField).toBeDisabled();
      const emailField = container.querySelector('[id="email"]');
      expect(emailField).toBeDisabled();
    });
  });
  test('renders correctly, forSearch false', async () => {
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
    });
  });
});

describe('<MemberEntry /> foundInvestigator', () => {
  test('renders correctly, foundInvestigator provided', async () => {
    const { container } = render(
      <StoreProvider>
        <MemberEntry forSearch foundInvestigator={MockUserFrontendList[0]} />
      </StoreProvider>
    );
    await waitFor(() => {
      const firstNameField = container.querySelector('[id="firstName"]');
      expect(firstNameField).toHaveValue(MockUserFrontendList[0].firstName);
      const lastNameField = container.querySelector('[id="lastName"]');
      expect(lastNameField).toHaveValue(MockUserFrontendList[0].lastName);
      const emailField = container.querySelector('[id="email"]');
      expect(emailField).toHaveValue(MockUserFrontendList[0].email);
    });
  });
  test('renders correctly, foundInvestigator not provided', async () => {
    const { container } = render(
      <StoreProvider>
        <MemberEntry />
      </StoreProvider>
    );
    await waitFor(() => {
      const firstNameField = container.querySelector('[id="firstName"]');
      expect(firstNameField).toHaveTextContent('');
      const lastNameField = container.querySelector('[id="lastName"]');
      expect(lastNameField).toHaveTextContent('');
      const emailField = container.querySelector('[id="email"]');
      expect(emailField).toHaveTextContent('');
    });
  });

  // TODO - Add more tests for MemberEntry component
});

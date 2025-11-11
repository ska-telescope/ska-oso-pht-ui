import { describe, test, expect } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MockCalibratorFrontendList } from '@services/axios/get/getCalibratorList/mockCalibratorListFrontend.tsx';
import completeMockStore from '../../utils/MockStore';
import CalibrationPage from './CalibrationPage';
import { MockProposalFrontend } from '@/services/axios/get/getProposal/mockProposalFrontend';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

vi.mock('@/services/axios/get/getCalibratorList/getCalibratorList', () => ({
  default: vi.fn().mockResolvedValue(MockCalibratorFrontendList)
}));

describe('<CalibrationPage />', () => {
  test('renders correctly', async () => {
    wrapper(<CalibrationPage />);
  });

  test('renders calibration strategy elements', async () => {
    vi.spyOn(storageObject, 'useStore').mockReturnValue(completeMockStore as any);
    wrapper(<CalibrationPage />);
    expect(await screen.getAllByTestId('calibratorName')).toHaveLength(2);
    expect(await screen.findAllByDisplayValue(MockCalibratorFrontendList[0].name)).toHaveLength(2);
    expect(await screen.getAllByTestId('duration')).toHaveLength(2);
    expect(
      await screen.findAllByDisplayValue(MockCalibratorFrontendList[0].durationMin)
    ).toHaveLength(2);
    expect(await screen.getAllByTestId('intent')).toHaveLength(2);
    expect(
      await screen.findAllByDisplayValue(MockCalibratorFrontendList[0].calibrationIntent)
    ).toHaveLength(2);
    expect(await screen.getByTestId('target')).toBeInTheDocument();
    expect(
      await screen.getByDisplayValue(MockProposalFrontend?.observations?.[0]?.linked as string)
    ).toBeInTheDocument();
    expect(await screen.getByTestId('integrationTime')).toBeInTheDocument();
    expect(await screen.getByDisplayValue('60.00')).toBeInTheDocument();
  });

  test('renders no calibration strategy', async () => {
    vi.spyOn(storageObject, 'useStore').mockReturnValue({
      ...completeMockStore,
      application: {
        ...completeMockStore.application,
        content2: {
          ...completeMockStore.application.content2,
          calibrationStrategy: null
        }
      }
    } as any);
    wrapper(<CalibrationPage />);
    expect(await screen.findByTestId('helpPanelId')).toBeInTheDocument();
  });

  test('renders checkbox and comment field', async () => {
    vi.spyOn(storageObject, 'useStore').mockReturnValue(completeMockStore as any);
    wrapper(<CalibrationPage />);
    const checkboxContainer = await screen.findByTestId('calibratorCheckbox');
    expect(checkboxContainer).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked(); // test data should already be checked
    const commentField = await screen.findByTestId('commenttId');
    expect(commentField).toBeInTheDocument(); // test data should already have comment
    expect(
      await screen.getByDisplayValue('This is an observatory defined calibration strategy.')
    ).toBeInTheDocument();
  });

  test('updates checkbox and toggles comment field', async () => {
    vi.spyOn(storageObject, 'useStore').mockReturnValue(completeMockStore as any);
    wrapper(<CalibrationPage />);
    const checkbox = await screen.findByTestId('calibratorCheckbox');
    expect(checkbox).toBeInTheDocument();
    act(() => {
      fireEvent.click(checkbox);
    });
    expect(checkbox).not.toBeChecked();
    const commentField = await screen.queryByTestId('commenttId');
    expect(commentField).not.toBeInTheDocument();
  });
});

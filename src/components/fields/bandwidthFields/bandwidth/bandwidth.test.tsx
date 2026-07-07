import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import Bandwidth from './bandwidth';
import { TELESCOPE_LOW_NUM, TELESCOPE_MID_NUM } from '@/utils/constants.ts';

const RESOLUTION_HZ = 1808.449074;
const MAX_ZOOM_CHANNELS_FOR_AA2 = 1800;

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<Bandwidth />', () => {
  test('MID renders the legacy preset dropdown, unchanged', () => {
    wrapper(<Bandwidth telescope={TELESCOPE_MID_NUM} value={1} setValue={vi.fn()} />);
    expect(screen.getByTestId('bandwidth')).toBeInTheDocument();
    expect(screen.queryByTestId('zoomChannels')).not.toBeInTheDocument();
  });

  test('LOW renders channel count and bandwidth-in-frequency fields, synced from zoomChannels', () => {
    wrapper(
      <Bandwidth
        telescope={TELESCOPE_LOW_NUM}
        value={8}
        setValue={vi.fn()}
        zoomChannels={1000}
        setZoomChannels={vi.fn()}
        maxZoomChannels={1800}
        resolutionHz={RESOLUTION_HZ}
        centralFrequencyHz={200_000_000}
      />
    );
    expect(screen.getByTestId('zoomChannels')).toHaveValue('1000');
    // 1000 channels * 1808.449074 Hz = 1,808,449.074 Hz = 1808.449074 kHz, shown to the nearest
    // centi-Hz (5dp in kHz)
    expect(screen.getByTestId('bandwidth')).toHaveValue('1808.44907');
  });

  test('LOW: editing channel count pushes the new value via setZoomChannels', async () => {
    const setZoomChannels = vi.fn();
    wrapper(
      <Bandwidth
        telescope={TELESCOPE_LOW_NUM}
        value={8}
        setValue={vi.fn()}
        zoomChannels={1000}
        setZoomChannels={setZoomChannels}
        maxZoomChannels={MAX_ZOOM_CHANNELS_FOR_AA2}
        resolutionHz={RESOLUTION_HZ}
      />
    );
    const channelsInput = screen.getByTestId('zoomChannels');
    await userEvent.clear(channelsInput);
    await userEvent.type(channelsInput, '500');
    expect(setZoomChannels).toHaveBeenLastCalledWith(500);
  });

  test('LOW: entering a channel count above maxZoomChannels is capped at the max', async () => {
    const setZoomChannels = vi.fn();

    wrapper(
      <Bandwidth
        telescope={TELESCOPE_LOW_NUM}
        value={8}
        setValue={vi.fn()}
        zoomChannels={1000}
        setZoomChannels={setZoomChannels}
        maxZoomChannels={MAX_ZOOM_CHANNELS_FOR_AA2}
        resolutionHz={RESOLUTION_HZ}
      />
    );
    const channelsInput = screen.getByTestId('zoomChannels');
    await userEvent.clear(channelsInput);
    await userEvent.type(channelsInput, '5000');
    expect(setZoomChannels).toHaveBeenLastCalledWith(MAX_ZOOM_CHANNELS_FOR_AA2);
  });

  test('LOW: the channel-count arrow steps by one channel', async () => {
    const setZoomChannels = vi.fn();
    wrapper(
      <Bandwidth
        telescope={TELESCOPE_LOW_NUM}
        value={8}
        setValue={vi.fn()}
        zoomChannels={1000}
        setZoomChannels={setZoomChannels}
        maxZoomChannels={1800}
        resolutionHz={RESOLUTION_HZ}
      />
    );
    await userEvent.click(screen.getByLabelText('zoomChannels-increment'));
    expect(setZoomChannels).toHaveBeenCalledWith(1001);
  });

  test('LOW: the bandwidth arrow steps the same underlying channel count by one', async () => {
    const setZoomChannels = vi.fn();
    wrapper(
      <Bandwidth
        telescope={TELESCOPE_LOW_NUM}
        value={8}
        setValue={vi.fn()}
        zoomChannels={1000}
        setZoomChannels={setZoomChannels}
        maxZoomChannels={1800}
        resolutionHz={RESOLUTION_HZ}
      />
    );
    await userEvent.click(screen.getByLabelText('bandwidth-increment'));
    expect(setZoomChannels).toHaveBeenCalledWith(1001);
  });

  test('LOW: editing bandwidth-in-frequency pushes the equivalent channel count', async () => {
    const setZoomChannels = vi.fn();
    wrapper(
      <Bandwidth
        telescope={TELESCOPE_LOW_NUM}
        value={8}
        setValue={vi.fn()}
        zoomChannels={1000}
        setZoomChannels={setZoomChannels}
        maxZoomChannels={5000}
        resolutionHz={RESOLUTION_HZ}
      />
    );
    const bandwidthInput = screen.getByTestId('bandwidth');
    await userEvent.clear(bandwidthInput);
    await userEvent.type(bandwidthInput, '3616.9');
    expect(setZoomChannels).toHaveBeenLastCalledWith(2000);
  });

  test('LOW: the channel-count arrow is disabled at maxZoomChannels', () => {
    wrapper(
      <Bandwidth
        telescope={TELESCOPE_LOW_NUM}
        value={8}
        setValue={vi.fn()}
        zoomChannels={1800}
        setZoomChannels={vi.fn()}
        maxZoomChannels={1800}
        resolutionHz={RESOLUTION_HZ}
      />
    );
    expect(screen.getByLabelText('zoomChannels-increment')).toBeDisabled();
  });
});

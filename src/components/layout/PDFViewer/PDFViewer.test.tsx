import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PDFViewer from './PDFViewer';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<PDFViewer />', () => {
  test('renders correctly', () => {
    wrapper(<PDFViewer url={'dummyURL'} />);
  });
});

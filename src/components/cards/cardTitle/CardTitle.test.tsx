import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardTitle from './CardTitle';

describe('<CardTitle />', () => {
  test('renders correctly', () => {
    render(<CardTitle id={''} onClick={undefined} title={''} toolTip={''} />);
  });
});

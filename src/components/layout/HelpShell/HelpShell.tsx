import EdgeSlider from '../EdgeSlider/EdgeSlider';
import { PAGE_TITLE_ADD } from '@/utils/constants';

interface HelpShellProps {
  page: number;
  children?: JSX.Element | JSX.Element[];
}

export default function HelpShell({ page, children }: HelpShellProps) {
  return (
    <>
      {page !== PAGE_TITLE_ADD && <EdgeSlider />}
      {children}
    </>
  );
}

import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import EdgeSlider from '../EdgeSlider/EdgeSlider';
import { PAGE_TITLE_ADD } from '@/utils/constants';

interface HelpShellProps {
  page: number;
  children?: JSX.Element | JSX.Element[];
}

export default function HelpShell({ page, children }: HelpShellProps) {
  const { help } = storageObject.useStore();

  function getHelp(): string {
    return help && help?.component ? (help?.component as string) : '';
  }

  return (
    <>
      {page !== PAGE_TITLE_ADD && <EdgeSlider helperText={getHelp()} />}
      {children}
    </>
  );
}

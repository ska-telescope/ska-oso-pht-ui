import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import EdgeSlider from '../EdgeSlider/EdgeSlider';
import PageBannerPPT from '../pageBannerPPT/PageBannerPPT';
import PageFooterPPT from '../pageFooterPPT/PageFooterPPT';
import { PAGE_TITLE_ADD } from '@/utils/constants';

interface ShellProps {
  page: number;
  footerPage?: number;
  children?: JSX.Element | JSX.Element[];
  buttonDisabled?: boolean;
}

export default function Shell({
  page,
  children,
  footerPage = page,
  buttonDisabled = false
}: ShellProps) {
  const { help } = storageObject.useStore();

  function getHelp(): string {
    return help && help?.component ? (help?.component as string) : '';
  }

  return (
    <>
      <PageBannerPPT pageNo={page} />
      {page !== PAGE_TITLE_ADD && <EdgeSlider helperText={getHelp()} />}
      {children}
      <PageFooterPPT pageNo={footerPage} buttonDisabled={buttonDisabled} />
    </>
  );
}

import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import EdgeSlider from '../EdgeSlider/EdgeSlider';
import PageBannerPPT from '../pageBannerPPT/PageBannerPPT';
import PageFooterPPT from '../pageFooterPPT/PageFooterPPT';

interface ShellProps {
  page: number;
  footerPage?: number;
  children?: JSX.Element | JSX.Element[];
  buttonDisabled?: boolean;
  helpDisabled?: boolean;
}

export default function Shell({
  page,
  children,
  footerPage = page,
  buttonDisabled = false,
  helpDisabled = false
}: ShellProps) {
  const { help } = storageObject.useStore();

  function getHelp(): string {
    return help && help?.component ? (help?.component as string) : '';
  }

  return (
    <>
      <PageBannerPPT pageNo={page} />
      {!helpDisabled && <EdgeSlider helperText={getHelp()} />}
      {children}
      <PageFooterPPT pageNo={footerPage} buttonDisabled={buttonDisabled} />
    </>
  );
}

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
  return (
    <>
      <PageBannerPPT pageNo={page} />
      {!helpDisabled && <EdgeSlider />}
      {children}
      <PageFooterPPT pageNo={footerPage} buttonDisabled={buttonDisabled} />
    </>
  );
}

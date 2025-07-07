import { Link } from 'react-scroll';
import PageBannerPPT from '../pageBannerPPT/PageBannerPPT';
import PageFooterPPT from '../pageFooterPPT/PageFooterPPT';

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
  return (
    <>
      <PageBannerPPT pageNo={page} />
      {children}
      <PageFooterPPT pageNo={footerPage} buttonDisabled={buttonDisabled} />
      <Link activeClass="active" to="scrollTarget" spy={true} smooth={true}></Link>
    </>
  );
}

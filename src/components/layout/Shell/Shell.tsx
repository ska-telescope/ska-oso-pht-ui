import React from 'react';
import PageBanner from '../pageBanner/PageBanner';
import PageFooter from '../pageFooter/PageFooter';
import { Link } from 'react-scroll';

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
      <PageBanner pageNo={page} />
      {children}
      <PageFooter pageNo={footerPage} buttonDisabled={buttonDisabled} />
      <Link activeClass="active" to="scrollTarget" spy={true} smooth={true}></Link>
    </>
  );
}

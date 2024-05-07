import React from 'react';
import PageBanner from '../pageBanner/PageBanner';
import PageFooter from '../pageFooter/PageFooter';
// import { HashLink } from 'react-router-hash-link';
import { Link } from 'react-scroll';

interface ShellProps {
  page: number;
  children?: JSX.Element | JSX.Element[];
}

export default function Shell({ page, children }: ShellProps) {
  return (
    <>
      <PageBanner pageNo={page} />
      {children}
      <PageFooter pageNo={page} />
      <div>
        <Link
          activeClass="active"
          to="scrollTarget"
          spy={true}
          smooth={true}
          // offset={}
          // duration={500}
        ></Link>
        {/*<div style={{ height: '1000px' }}></div>*/}
      </div>
    </>
  );
}

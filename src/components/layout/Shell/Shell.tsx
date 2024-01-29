import React from 'react';
import PageBanner from '../pageBanner/PageBanner';
import PageFooter from '../pageFooter/PageFooter';

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
    </>
  );
}

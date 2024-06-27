import React from 'react';
import Shell from '../../components/layout/Shell/Shell';
import TitleContent from '../../components/titleContentTemp/TitleContent';

const PAGE = 0;

export default function TitlePage() {
  return (
    <Shell page={PAGE}>
      <TitleContent page={PAGE} />
    </Shell>
  );
}

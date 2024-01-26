import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';

import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import TitleContent from '../../components/TitleContent/TitleContent';

const PAGE = 0;

export default function Proposal() {
  const { application, updateAppContent1 } = storageObject.useStore();

  const getProposalState = () => application.content1 as number[];

  const setTheProposalState = (e: number[]) => {
    const [page, value] = e;
    const temp = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(page === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  return (
    <>
      <PageBanner pageNo={PAGE} />
      <TitleContent page={PAGE} setStatus={setTheProposalState} />
      <PageFooter pageNo={PAGE} />
    </>
  );
}

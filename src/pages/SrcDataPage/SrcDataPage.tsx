import React from 'react';
import { useTranslation } from 'react-i18next';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { STATUS_ERROR, STATUS_OK } from '../../utils/constants';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';

const PAGE = 8;

export default function SrcDataPage() {
  const { t } = useTranslation('pht');

  const { application, helpComponent, updateAppContent1 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    helpComponent(t('pipeline.help'));
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_OK];
    const count = getProposal().pipeline.length > 0 ? 1 : 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  // TODO : Retained in case is needed later
  // const pipelineField = () => (
  //   <TextEntry
  //     label={t('pipeline.label')}
  //     labelBold
  //     labelPosition={LABEL_POSITION.START}
  //     testId="pipelineId"
  //     value={getProposal().pipeline}
  //     setValue={(e: string) => setProposal({ ...getProposal(), pipeline: e.substring(0, 100) })}
  //     onFocus={() => helpComponent(t('pipeline.help'))}
  //     helperText={t('pipeline.helper')}
  //     required
  //   />
  // );

  return (
    <Shell page={PAGE}>
      <></>
    </Shell>
  );
}

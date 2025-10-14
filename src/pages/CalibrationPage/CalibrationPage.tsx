import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Grid } from '@mui/system';
import { Proposal } from '../../utils/types/proposal';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import Shell from '@/components/layout/Shell/Shell';

const PAGE = 6;

export default function CalibrationPage() {
  const { t } = useScopedTranslation();
  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2
  } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

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
  }, []);

  React.useEffect(() => {
    setTheProposalState(1); // TODO
  }, [validateToggle]);

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        Calibration Page - under construction
      </Grid>
    </Shell>
  );
}

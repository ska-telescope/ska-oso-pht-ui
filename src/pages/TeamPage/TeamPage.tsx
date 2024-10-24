/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Tab, Tabs, SvgIcon, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { validateTeamPage } from '../../utils/proposalValidation';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import MemberInvite from './MemberInvite/MemberInvite';
import TeamFileImport from './TeamFileImport/TeamFileImport';
import MemberSearch from './MemberSearch/MemberSearch';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import GridMembers from '../../components/grid/members/GridMembers';
import StarIcon from '../../components/icon/starIcon/starIcon';

const PAGE = 1;

export function PIStar({ pi }) {
  if (pi) {
    return <StarIcon />;
  }
}

export function PHDThesis({ value }) {
  if (value) {
    return <SvgIcon component={CheckIcon} viewBox="0 0 24 24" />;
  }
}

export default function TeamPage() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [theValue, setTheValue] = React.useState(0);
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentMember, setCurrentMember] = React.useState('');

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
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateTeamPage(getProposal()));
  }, [validateToggle]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTheValue(newValue);
  };

  const deleteIconClicked = () => {
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const ClickMemberRow = (e: { id: number }) => {
    setCurrentMember(e.id.toString());
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().team.filter(e => e.id !== currentMember);

    setProposal({ ...getProposal(), team: obs1 });
    setCurrentMember('');
    closeDeleteDialog();
  };

  const alertContent = () => {
    const LABEL_WIDTH = 6;
    const rec = getProposal().team.find(p => p.id === currentMember);
    return (
      <Grid
        p={2}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <FieldWrapper label={t('firstName.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.firstName}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('lastName.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.lastName}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('email.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.email}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('phdThesis.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t(rec.phdThesis ? 'yes' : 'no')}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('pi.short')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t(rec.pi ? 'yes' : 'no')}</Typography>
        </FieldWrapper>
      </Grid>
    );
  };

  const getRows = () => getProposal().team;

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  return (
    <Shell page={PAGE}>
      <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
        <Grid
          p={1}
          container
          direction="row"
          alignItems="space-evenly"
          justifyContent="space-around"
        >
          <Grid item md={5} xs={11}>
            <GridMembers
              action
              actionClicked={deleteIconClicked}
              height={400}
              rowClick={ClickMemberRow}
              rows={getRows()}
            />
          </Grid>
          <Grid item md={6} xs={11}>
            <Box sx={{ width: '100%', border: '1px solid grey' }}>
              <Box>
                <Tabs
                  textColor="secondary"
                  indicatorColor="secondary"
                  value={theValue}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab
                    label={t('inviteTeamMember.label')}
                    {...a11yProps(0)}
                    sx={{ border: '1px solid grey' }}
                  />
                  <Tab
                    label={t('importFromFile.label')}
                    {...a11yProps(1)}
                    sx={{ border: '1px solid grey' }}
                    disabled
                  />
                  <Tab
                    label={t('searchForMember.label')}
                    {...a11yProps(2)}
                    sx={{ border: '1px solid grey' }}
                    disabled
                  />
                </Tabs>
              </Box>
              {theValue === 0 && <MemberInvite />}
              {theValue === 1 && <TeamFileImport />}
              {theValue === 2 && <MemberSearch />}
            </Box>
          </Grid>
        </Grid>
      </Grid>
      {openDialog && (
        <AlertDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onDialogResponse={deleteConfirmed}
          title="deleteTeamMember.label"
        >
          {alertContent()}
        </AlertDialog>
      )}
    </Shell>
  );
}

/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Tab, Tabs, SvgIcon, Typography } from '@mui/material';
import { StarRateRounded } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DataGrid, InfoCard, InfoCardColorTypes } from '@ska-telescope/ska-gui-components';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import { STATUS_ERROR, STATUS_OK } from '../../utils/constants';
import { Proposal } from '../../services/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import MemberInvite from './MemberInvite/MemberInvite';
import TeamFileImport from './TeamFileImport/TeamFileImport';
import MemberSearch from './MemberSearch/MemberSearch';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';

const PAGE = 1;

export function PIStar({ pi }) {
  if (pi) {
    return <SvgIcon component={StarRateRounded} viewBox="0 0 24 24" />;
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
  const [currentMember, setCurrentMember] = React.useState(0);

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
    const result = [STATUS_ERROR, STATUS_OK];
    const count = getProposal().team?.length > 0 ? 1 : 0;
    setTheProposalState(result[count]);
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
    setCurrentMember(e.id);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().team.filter(e => e.id !== currentMember);

    setProposal({ ...getProposal(), team: obs1 });
    setCurrentMember(0);
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

  const columns = [
    { field: 'lastName', headerName: t('lastName.label'), flex: 1 },
    { field: 'firstName', headerName: t('firstName.label'), flex: 1 },
    { field: 'status', headerName: t('status.label'), flex: 1 },
    {
      field: 'phdThesis',
      headerName: t('phdThesis.label'),
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (params: { row: { phdThesis: string; status: string } }) => (
        <PHDThesis value={params.row.phdThesis} />
      )
    },
    {
      field: 'pi',
      headerName: t('pi.short'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (params: { row: { pi: string; status: string } }) => <PIStar pi={params.row.pi} />
    },
    {
      field: 'id',
      headerName: t('actions.label'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: () => <TrashIcon onClick={deleteIconClicked} toolTip="Delete team member" />
    }
  ];
  const extendedColumns = [...columns];

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
            {getRows()?.length > 0 && (
              <DataGrid
                rows={getRows()}
                columns={extendedColumns}
                onRowClick={ClickMemberRow}
                height={400}
                showBorder={false}
                showMild
                testId="teamTableId"
              />
            )}
            {getRows()?.length === 0 && (
              <InfoCard
                color={InfoCardColorTypes.Error}
                fontSize={20}
                message={t('members.empty')}
                testId="helpPanelId"
              />
            )}
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
                    label={t('label.inviteTeamMember')}
                    {...a11yProps(0)}
                    sx={{ border: '1px solid grey' }}
                  />
                  <Tab
                    label={t('label.importFromFile')}
                    {...a11yProps(1)}
                    sx={{ border: '1px solid grey' }}
                    disabled
                  />
                  <Tab
                    label={t('label.searchForMember')}
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

/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid2, Tab, Tabs, SvgIcon, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { validateTeamPage } from '../../utils/proposalValidation';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import MemberEntry from '../entry/MemberEntry/MemberEntry';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import GridMembers from '../../components/grid/members/GridMembers';
import StarIcon from '../../components/icon/starIcon/starIcon';
import { FOOTER_SPACER, GRID_MEMBERS_ACTIONS } from '../../utils/constants';
import MemberSearch from './MemberSearch/MemberSearch';
import TeamFileImport from './TeamFileImport/TeamFileImport';
import MemberAccess from './MemberAccess/MemberAccess';

const PAGE = 1;

export function PIStar(pi: boolean) {
  if (pi) {
    return <StarIcon onClick={() => {}} />;
  }
}

export function PHDThesis(value: any) {
  if (value) {
    return <SvgIcon component={CheckIcon} viewBox="0 0 24 24" />;
  }
}

export default function TeamPage() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [theValue, setTheValue] = React.useState(0);
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentMember, setCurrentMember] = React.useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openAccessDialog, setOpenAccessDialog] = React.useState(false);

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
    setOpenDeleteDialog(true);
  };

  const accessIconClicked = () => {
    setOpenAccessDialog(true);
  };

  const actionClicked = (action: string) => {
    switch (action) {
      case GRID_MEMBERS_ACTIONS.delete:
        deleteIconClicked();
        break;
      case GRID_MEMBERS_ACTIONS.access:
        accessIconClicked();
        break;
    }
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const closeAccessDialog = () => {
    setOpenAccessDialog(false);
  };

  const ClickMemberRow = (e: { id: number }) => {
    setCurrentMember(e.id.toString());
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal()?.investigators?.filter(e => e.id !== currentMember);

    setProposal({ ...getProposal(), investigators: obs1 });
    setCurrentMember('');
    closeDeleteDialog();
  };

  const accessConfirmed = () => {
    // TODO implement actions on close
    closeAccessDialog();
  };

  const displayMemberInfo = () => {
    const LABEL_WIDTH = 6;
    const rec = getProposal()?.investigators?.find(p => p.id === currentMember);
    return (
      <Grid2
        p={2}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <FieldWrapper label={t('firstName.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.firstName}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('lastName.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.lastName}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('email.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.email}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('phdThesis.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t(rec?.phdThesis ? 'yes' : 'no')}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('pi.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t(rec?.pi ? 'yes' : 'no')}</Typography>
        </FieldWrapper>
      </Grid2>
    );
  };

  const deleteAlertContent = () => {
    return displayMemberInfo();
  };

  const accessAlertContent = () => {
    return (
      <>
        {displayMemberInfo()}
        <MemberAccess />
      </>
    );
  };

  const getRows = () => getProposal().investigators;

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  return (
    <Shell page={PAGE}>
      <Grid2
        pr={3}
        pl={3}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <Grid2
          p={1}
          container
          direction="row"
          alignItems="space-evenly"
          justifyContent="space-around"
          spacing={1}
        >
          <Grid2 size={{ md: 11, lg: 5 }} order={{ md: 2, lg: 1 }}>
            <GridMembers
              action
              actionClicked={actionClicked}
              height={400}
              rowClick={ClickMemberRow}
              rows={getRows()}
            />
          </Grid2>
          <Grid2 size={{ md: 11, lg: 6 }} order={{ md: 1, lg: 2 }}>
            <Box sx={{ width: '100%', border: '1px solid grey', minHeight: '558px' }}>
              <Box>
                <Tabs
                  variant="fullWidth"
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
                  />
                </Tabs>
              </Box>
              {theValue === 0 && <MemberEntry />}
              {theValue === 1 && <TeamFileImport />}
              {theValue === 2 && <MemberSearch />}
            </Box>
          </Grid2>
        </Grid2>
      </Grid2>
      <AlertDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onDialogResponse={deleteConfirmed}
        title="deleteTeamMember.label"
      >
        {deleteAlertContent()}
      </AlertDialog>
      <AlertDialog
        open={openAccessDialog}
        onClose={() => setOpenAccessDialog(false)}
        onDialogResponse={accessConfirmed}
        title="manageTeamMember.label"
      >
        {accessAlertContent()}
      </AlertDialog>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
    </Shell>
  );
}

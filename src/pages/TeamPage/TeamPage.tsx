import React from 'react';
import { Box, Grid, Tab, Tabs, SvgIcon, Typography, useTheme } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { storageObject } from '@utils/storage/store';
import { validateTeamPage } from '../../utils/validation/validation';
import Shell from '../../components/layout/Shell/Shell';
import MemberEntry from '../entry/MemberEntry/MemberEntry';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import GridMembers from '../../components/grid/members/GridMembers';
import StarIcon from '../../components/icon/starIcon/starIcon';
import {
  GRID_MEMBERS_ACTIONS,
  NOTIFICATION_DELAY_IN_SECONDS,
  PAGE_TEAM,
  STATUS_ERROR
} from '../../utils/constants';
import TeamFileImport from './TeamFileImport/TeamFileImport';
import MemberAccess from './MemberAccess/MemberAccess';
import ProposalAccess from '@/utils/types/proposalAccess';
import { useNotify } from '@/utils/notify/useNotify';
import { listAccessForProposal, updateAccess as saveAccess } from '@/services/api/proposalAccess';
import { accessPI } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { ProposalType as ProposalFormValues } from '@/models/proposals/proposal';
import { getTeamValues } from '@/models/proposals/team';

const PAGE = PAGE_TEAM;

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
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { application, updateAppContent1 } = storageObject.useStore();
  const [theValue, setTheValue] = React.useState(0);
  const [currentMember, setCurrentMember] = React.useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openAccessDialog, setOpenAccessDialog] = React.useState(false);
  const { notifyError, notifySuccess } = useNotify();
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [permissions, setPermissions] = React.useState<ProposalAccess[]>([]);
  const { isSV } = useOSDAccessors();

  const { setValue } = useFormContext<ProposalFormValues>();
  const prslId = useWatch<ProposalFormValues, 'prslId'>({ name: 'prslId' });
  const investigators = useWatch<ProposalFormValues, 'investigators'>({
    name: 'investigators',
    defaultValue: []
  });
  const { errors } = useFormState<ProposalFormValues>();
  const currentInvestigators = investigators;

  const getAccess = () => application.content4 as ProposalAccess[];

  const setTheProposalState = React.useCallback(
    (value: number) => {
      const state = Array.isArray(application.content1) ? (application.content1 as number[]) : [];
      if (state[PAGE] === value) return;
      const temp = [...state];
      while (temp.length <= PAGE) temp.push(STATUS_ERROR);
      temp[PAGE] = value;
      updateAppContent1(temp);
    },
    [application.content1, updateAppContent1]
  );

  React.useEffect(() => {
    const memberPermissions = permissions.find((p) => p.userId === currentMember);
    setSelectedOptions(memberPermissions?.permissions || []);
  }, [permissions]);

  const updateAccess = async (access: ProposalAccess) => {
    const { error } = await saveAccess(access);
    if (error) {
      notifyError(error, NOTIFICATION_DELAY_IN_SECONDS);
    } else {
      notifySuccess(t('manageTeamMember.success'), NOTIFICATION_DELAY_IN_SECONDS);
    }
    closeAccessDialog();
    fetchProposalAccessData();
  };

  React.useEffect(() => {
    if (actionsAvailable()) fetchProposalAccessData();
  }, [currentMember, currentInvestigators]);

  React.useEffect(() => {
    setTheProposalState(
      errors.investigators
        ? STATUS_ERROR
        : validateTeamPage({ investigators: currentInvestigators })
    );
  }, [currentInvestigators, errors.investigators, setTheProposalState]);

  const fetchProposalAccessData = async () => {
    const { data: access, error } = await listAccessForProposal(prslId);
    if (!access) {
      notifyError(error as string, NOTIFICATION_DELAY_IN_SECONDS);
    } else {
      setPermissions(access);
    }
  };

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

  const actionsAvailable = () => {
    return accessPI(getAccess(), prslId);
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
    const updatedInvestigators = currentInvestigators.filter((e) => e.id !== currentMember);

    setValue(
      'investigators',
      getTeamValues({ investigators: updatedInvestigators }).investigators,
      {
        shouldValidate: true
      }
    );
    setCurrentMember('');
    closeDeleteDialog();
  };

  const accessConfirmed = () => {
    const access: ProposalAccess = {
      id: permissions.find((p) => p.userId === currentMember)?.id as string,
      prslId,
      userId: currentMember,
      role: 'Co-Investigator',
      permissions: selectedOptions
    };
    updateAccess(access);
    closeAccessDialog();
  };

  const displayMemberInfo = () => {
    const LABEL_WIDTH = 6;
    const rec = currentInvestigators.find((p) => p.id === currentMember);
    return (
      <Grid
        container
        sx={{
          flexDirection: 'column',
          p: 2,
          alignItems: 'space-evenly',
          justifyContent: 'space-around'
        }}
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
        {!isSV && (
          <FieldWrapper label={t('phdThesis.label')} labelWidth={LABEL_WIDTH}>
            <Typography variant="body1">{t(rec?.phdThesis ? 'yes' : 'no')}</Typography>
          </FieldWrapper>
        )}
        {!isSV && (
          <FieldWrapper label={t('pi.label')} labelWidth={LABEL_WIDTH}>
            <Typography variant="body1">{t(rec?.pi ? 'yes' : 'no')}</Typography>
          </FieldWrapper>
        )}
      </Grid>
    );
  };

  const deleteAlertContent = () => {
    return displayMemberInfo();
  };

  const accessAlertContent = () => {
    return (
      <>
        <Grid>
          {displayMemberInfo()}
          <MemberAccess selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />
        </Grid>
      </>
    );
  };

  const getRows = () => currentInvestigators;

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  return (
    <Shell page={PAGE}>
      <Grid
        container
        sx={{
          flexDirection: 'column',
          pr: 3,
          pl: 3,
          alignItems: 'space-evenly',
          justifyContent: 'space-around'
        }}
      >
        <Grid
          container
          direction="row"
          spacing={1}
          sx={{
            p: 1,
            alignItems: 'space-evenly',
            justifyContent: 'space-around'
          }}
        >
          <Grid
            size={{ md: 11, lg: 6 }}
            sx={{
              order: { md: 2, lg: 1 }
            }}
          >
            <GridMembers
              action={actionsAvailable()}
              actionClicked={actionClicked}
              height={400}
              rowClick={ClickMemberRow}
              rows={getRows()}
              permissions={permissions}
            />
          </Grid>
          <Grid
            size={{ md: 11, lg: 5 }}
            sx={{
              order: { md: 1, lg: 2 }
            }}
          >
            <Box
              sx={{
                width: '100%',
                border: '1px solid',
                borderColor: theme.palette.primary.light,
                borderRadius: '16px'
              }}
            >
              <Box>
                <Tabs
                  variant="fullWidth"
                  textColor="secondary"
                  indicatorColor="secondary"
                  value={theValue}
                  onChange={handleChange}
                >
                  <Tab label={t('inviteTeamMember.label')} {...a11yProps(0)} />
                  <Tab label={t('importFromFile.label')} {...a11yProps(1)} disabled />
                </Tabs>
              </Box>
              {theValue === 0 && <MemberEntry />}
              {theValue === 1 && <TeamFileImport />}
            </Box>
          </Grid>
        </Grid>
      </Grid>
      <AlertDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onDialogResponse={deleteConfirmed}
        title="deleteTeamMember.query"
      >
        {deleteAlertContent()}
      </AlertDialog>
      <AlertDialog
        open={openAccessDialog}
        onClose={() => setOpenAccessDialog(false)}
        onDialogResponse={accessConfirmed}
        title="manageTeamMember.label"
        maxWidth="md"
      >
        {accessAlertContent()}
      </AlertDialog>
    </Shell>
  );
}

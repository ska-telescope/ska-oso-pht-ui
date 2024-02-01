/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Tab, Tabs, SvgIcon, Typography } from '@mui/material';
import { StarRateRounded } from '@mui/icons-material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DataGrid, InfoCard, InfoCardColorTypes } from '@ska-telescope/ska-gui-components';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import { STATUS_ERROR, STATUS_OK } from '../../utils/constants';
import { Proposal } from '../../services/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import MemberInvite from './MemberInvite/MemberInvite';
import TeamFileImport from './TeamFileImport/TeamFileImport';
import MemberSearch from './MemberSearch/MemberSearch';

const PAGE = 1;

export function PIStar({ pi }) {
  if (pi) {
    return <SvgIcon component={StarRateRounded} viewBox="0 0 24 24" />;
  }
}

export default function TeamPage() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent1 } = storageObject.useStore();
  const [theValue, setTheValue] = React.useState(0);
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp = [];
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
    const count = getProposal().team.length > 0 ? 1 : 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTheValue(newValue);
  };

  const deleteIconClicked = () => {
    // TODO : Display confirmation and if confirm, delete
  };

  const columns = [
    { field: 'lastName', headerName: t('label.lastName'), flex: 1 },
    { field: 'firstName', headerName: t('label.firstName'), flex: 1 },
    { field: 'status', headerName: t('column.status'), flex: 1 },
    {
      field: 'phdThesis',
      headerName: t('label.phdThesis'),
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (params: { row: { pi: boolean } }) => (
        <Typography>{params.row.pi ? 'Yes' : 'No'}</Typography>
      )
    },
    {
      field: 'pi',
      headerName: t('column.pi'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (params: { row: { pi: string; status: string } }) => <PIStar pi={params.row.pi} />
    },
    {
      field: 'id',
      headerName: t('column.actions'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: () => <TrashIcon onClick={deleteIconClicked} toolTip="Delete team member" />
    }
  ];
  const extendedColumns = [...columns];

  const getRows = () => getProposal().team;

  const ClickFunction = () => {
    // TODO
  };

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
            {getRows().length > 0 && (
              <DataGrid
                rows={getRows()}
                columns={extendedColumns}
                height={400}
                onRowClick={ClickFunction}
                showBorder={false}
                testId="teamTableId"
              />
            )}
            {getRows().length === 0 && (
              <InfoCard
                color={InfoCardColorTypes.Error}
                fontSize={20}
                message={t('error.noTeamMembers')}
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
    </Shell>
  );
}

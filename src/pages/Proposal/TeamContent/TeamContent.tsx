/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Grid, Tab, Tabs, SvgIcon } from '@mui/material';
import { StarBorderRounded, StarRateRounded } from '@mui/icons-material';
import DataGridWrapper from '../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import { STATUS_ERROR, STATUS_OK } from '../../../utils/constants';
import DeleteProposalButton from '../../../components/button/deleteProposal/deleteProposalButton';
import { Help } from '../../../services/types/help';
import { Proposal } from '../../../services/types/proposal';
// import { TeamMember } from '../../../services/types/teamMember';
import MemberInvite from './MemberInvite/MemberInvite';
import FileImport from './FileImport/FileImport';
import MemberSearch from './MemberSearch/MemberSearch';

// TODO : Either this should be moved to a component of export removed
export function PIStar({ isPI, status, ...rest }) {
  if (isPI) {
    return <SvgIcon component={StarRateRounded} viewBox="0 0 24 24" {...rest} />;
  }
  if (status === 'Accepted') {
    return <SvgIcon component={StarBorderRounded} viewBox="0 0 24 24" {...rest} />;
  }
}

export const HELP_FIRST_NAME = {
  title: 'Help first name',
  description: 'Field sensitive help',
  additional: ''
};
export const HELP_LAST_NAME = {
  title: 'Help last name',
  description: 'Field sensitive help',
  additional: ''
};
export const HELP_EMAIL = {
  title: 'Help email',
  description: 'Field sensitive help',
  additional: ''
};
export const HELP_PHD = {
  title: 'Help PhD',
  description: 'Field sensitive help',
  additional: ''
};
export const HELP_PI = {
  title: 'Help PI',
  description: 'PI HELP',
  additional: ''
};

interface TeamContentProps {
  help: Help;
  page: number;
  proposal: Proposal;
  setHelp: Function;
  setProposal: Function;
  setStatus: Function;
}

export default function TeamContent({
  help,
  page,
  proposal,
  setHelp,
  setProposal,
  setStatus
}: TeamContentProps) {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_OK];
    const count = proposal.team.length > 0 ? 1 : 0;
    setStatus([page, result[count]]);
  }, [setStatus]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const columns = [
    { field: 'LastName', headerName: 'Last Name', flex: 1 },
    { field: 'FirstName', headerName: 'First Name', flex: 1 },
    { field: 'Status', headerName: 'Status', flex: 1 },
    { field: 'PHDThesis', headerName: 'PhD Thesis', flex: 1 },
    {
      field: 'PI',
      headerName: 'PI',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: params => (
        <PIStar isPI={Boolean(params.row.PI)} status={String(params.row.Status)} />
      )
    },
    {
      field: 'Actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: () => <DeleteProposalButton />
    }
  ];
  const extendedColumns = [...columns];

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
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid p={1} container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid item md={6} xs={11}>
          <DataGridWrapper
            rows={proposal.team}
            extendedColumns={extendedColumns}
            height={400}
            rowClick={ClickFunction}
            testId="teamTableId"
          />
        </Grid>
        <Grid item md={6} xs={11}>
          <Box sx={{ width: '100%', border: '1px solid grey' }}>
            <Box>
              <Tabs
                textColor="secondary"
                indicatorColor="secondary"
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab
                  label="Invite Team Member"
                  {...a11yProps(0)}
                  sx={{ border: '1px solid grey' }}
                />
                <Tab
                  label="Import From File"
                  {...a11yProps(1)}
                  sx={{ border: '1px solid grey' }}
                  disabled
                />
                <Tab
                  label="Search For Member"
                  {...a11yProps(2)}
                  sx={{ border: '1px solid grey' }}
                  disabled
                />
              </Tabs>
            </Box>
            {value === 0 && (
              <MemberInvite
                help={help}
                proposal={proposal}
                setHelp={setHelp}
                setProposal={setProposal}
              />
            )}
            {value === 1 && <FileImport />}
            {value === 2 && <MemberSearch />}
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}

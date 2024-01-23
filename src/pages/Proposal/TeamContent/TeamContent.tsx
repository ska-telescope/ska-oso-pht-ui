/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Grid, Tab, Tabs, SvgIcon } from '@mui/material';
import { StarBorderRounded, StarRateRounded } from '@mui/icons-material';
import DataGridWrapper from '../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import { STATUS_ERROR, STATUS_OK } from '../../../utils/constants';
import { Proposal } from '../../../services/types/proposal';
// import { TeamMember } from '../../../services/types/teamMember';
import MemberInvite from './MemberInvite/MemberInvite';
import TeamFileImport from './TeamFileImport/TeamFileImport';
import MemberSearch from './MemberSearch/MemberSearch';

// TODO : Either this should be moved to a component of export removed
export function PIStar({ pi, status, ...rest }) {
  if (pi) {
    return <SvgIcon component={StarRateRounded} viewBox="0 0 24 24" {...rest} />;
  }
  if (status === 'Accepted') {
    return <SvgIcon component={StarBorderRounded} viewBox="0 0 24 24" {...rest} />;
  }
}

interface TeamContentProps {
  page: number;
  proposal: Proposal;
  setProposal: Function;
  setStatus: Function;
}

export default function TeamContent({ page, proposal, setProposal, setStatus }: TeamContentProps) {
  const [value, setValue] = React.useState(0);
  const [validateToggle, setValidateToggle] = React.useState(false);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [proposal]);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_OK];
    const count = proposal.team.length > 0 ? 1 : 0;
    setStatus([page, result[count]]);
  }, [validateToggle]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const deleteIconClicked = () => {
    // TODO : Display confirmation and if confirm, delete
  };

  const columns = [
    { field: 'lastName', headerName: 'Last Name', flex: 1 },
    { field: 'firstName', headerName: 'First Name', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'phdThesis', headerName: 'PhD Thesis', flex: 1 },
    {
      field: 'pi',
      headerName: 'PI',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: params => <PIStar pi={params.row.pi} status={String(params.row.status)} />
    },
    {
      field: 'Actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: () => <TrashIcon onClick={deleteIconClicked} toolTip="Delete team member" />
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
        <Grid item md={5} xs={11}>
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
            {value === 0 && <MemberInvite proposal={proposal} setProposal={setProposal} />}
            {value === 1 && <TeamFileImport />}
            {value === 2 && <MemberSearch />}
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}

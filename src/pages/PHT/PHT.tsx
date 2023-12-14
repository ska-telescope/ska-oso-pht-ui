import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { DropDown, SearchEntry } from '@ska-telescope/ska-gui-components';
import { EXISTING_PROPOSALS, SEARCH_TYPE_OPTIONS } from '../../utils/constants';
import AddProposalButton from '../../components/button/AddProposal/AddProposalButton';
import DataGridWrapper from '../../components/wrappers/dataGridWrapper/dataGridWrapper';

// TODO -  We can call the getProposals from here

export default function PHT() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');

  const ClickFunction = () => {
    navigate('/proposal');
  };

  const PAGE_DESC =
    'Proposals where you have either participated as a Co-Investigator or as a Principal Investigator.';

  const COLUMNS = [
    { field: 'id', headerName: 'SKAO ID', width: 200 },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'pi', headerName: 'PI', width: 200 },
    { field: 'status', headerName: 'Status', width: 200 },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 200 },
    { field: 'Actions', headerName: 'Actions', width: 200 }
  ];
  const extendedColumns = structuredClone(COLUMNS);

  return (
    <>
      <Grid p={1} container direction="column" alignItems="center" justifyContent="space-around">
        <Typography variant="h5">{PAGE_DESC}</Typography>
      </Grid>

      <Grid
        p={1}
        spacing={2}
        container
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
      >
        <Grid item xs={2}>
          <AddProposalButton />
        </Grid>
        <Grid item xs={2}>
          <DropDown
            options={SEARCH_TYPE_OPTIONS}
            testId="{tt}"
            value={searchType}
            setValue={setSearchType}
            label="All Status Types"
          />
        </Grid>
        <Grid item xs={4}>
          {/* <DropdownComponent options={options} onSelect={handleSelection} label="Choose an option" /> */}
          <SearchEntry
            label="Search"
            testId="searchId"
            value={searchTerm}
            setValue={setSearchTerm}
          />
        </Grid>
      </Grid>

      <Grid p={1} container direction="column" alignItems="flex-left" justifyContent="space-around">
        <DataGridWrapper
          rows={EXISTING_PROPOSALS}
          extendedColumns={extendedColumns}
          height={500}
          rowClick={ClickFunction}
        />
      </Grid>
    </>
  );
}

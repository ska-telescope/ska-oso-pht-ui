import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { DropDown, SearchEntry, Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import GetProposals from '../../services/axios/getProposals/getProposals';
import { SEARCH_TYPE_OPTIONS } from '../../utils/constants';
import AddProposalButton from '../../components/button/AddProposal/AddProposalButton';
import DataGridWrapper from '../../components/wrappers/dataGridWrapper/dataGridWrapper';
import CloneIcon from '../../components/icon/cloneIcon/cloneIcon';
import DownloadIcon from '../../components/icon/downloadIcon/downloadIcon';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { Proposal } from '../../services/types/proposal';

export default function PHT() {
  const navigate = useNavigate();
  /*
  TODO: remove colouring of selected row for better visibility
  using something like: sx={{ '&:selected': { backgroundColor: 'primary.light' } }}
  */

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');
  const [dataProposals, setDataProposals] = React.useState([]);
  const [axiosError, setAxiosError] = React.useState('');

  const PAGE_DESC =
    'Proposals where you have either participated as a Co-Investigator or as a Principal Investigator.';

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const response = await GetProposals();
      if (isMounted) {
        if (response && !response.error) {
          if (response.every(item => item.id && item.title)) {
            setAxiosError('');
            setDataProposals(response as Proposal[]);
          } else {
            setAxiosError('Unexpected data format returned from API');
          }
        } else {
          setAxiosError(response.error);
        }
      }
    };
    fetchData();
    return () => {
      // Clean up on unmount
      isMounted = false;
    };
  }, []);

  const cloneIconClicked = () => {
    // TODO
  };

  const deleteIconClicked = () => {
    // TODO : Display confirmation and if confirm, delete
  };

  const downloadIconClicked = () => {
    // TODO : Implement
  };

  const editIconClicked = () => {
    navigate('/proposal');
  };

  const viewIconClicked = () => {
    navigate('/proposal');
  };

  const COLUMNS = [
    { field: 'id', headerName: 'Proposal ID', width: 200 },
    { field: 'cycle', headerName: 'Cycle', width: 200 },
    { field: 'title', headerName: 'Title', width: 300 },
    { field: 'pi', headerName: 'PI', width: 200 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 150 },
    {
      field: 'cpi',
      headerName: ' ',
      sortable: false,
      width: 250,
      disableClickEventBubbling: true,
      renderCell: () => (
        <>
          <ViewIcon onClick={viewIconClicked} toolTip="View proposal" />
          {false && <EditIcon onClick={editIconClicked} toolTip="Edit proposal" />}
          <CloneIcon onClick={cloneIconClicked} toolTip="Clone proposal" />
          <DownloadIcon onClick={downloadIconClicked} toolTip="Download proposal" />
          <TrashIcon onClick={deleteIconClicked} toolTip="Delete proposal" />
        </>
      )
    }
  ];
  const extendedColumns = [...COLUMNS];

  function filterProposals() {
    return dataProposals.filter(
      item =>
        ['title'].some(field => item[field].toLowerCase().includes(searchTerm.toLowerCase())) &&
        (searchType === '' || item.status.toLowerCase() === searchType.toLowerCase())
    );
  }

  const filteredData = dataProposals ? filterProposals() : [];

  return (
    <>
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
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
            options={[{ label: 'All Status Types', value: '' }, ...SEARCH_TYPE_OPTIONS]}
            testId="proposalType"
            value={searchType}
            setValue={setSearchType}
            label="All Status Types"
          />
        </Grid>
        <Grid item xs={4} mt={-1}>
          <SearchEntry
            label="Search"
            testId="searchId"
            value={searchTerm}
            setValue={setSearchTerm}
          />
        </Grid>
      </Grid>

      <Grid p={1} container direction="column" alignItems="flex-left" justifyContent="space-around">
        <Grid
          p={1}
          container
          direction="column"
          alignItems="flex-left"
          justifyContent="space-around"
        />
        {axiosError ? (
          <Alert testId="alertErrorId" color={AlertColorTypes.Error}>
            <Typography>{axiosError}</Typography>
          </Alert>
        ) : (
          <DataGridWrapper
            testId="dataGridId"
            rows={filteredData}
            extendedColumns={extendedColumns}
            height={500}
          />
        )}
      </Grid>
    </>
  );
}

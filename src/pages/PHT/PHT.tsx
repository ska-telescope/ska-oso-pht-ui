import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  Alert,
  AlertColorTypes
} from '@ska-telescope/ska-gui-components';
import GetProposalList from '../../services/axios/getProposalList/getProposalList';
import GetProposal from '../../services/axios/getProposal/getProposal';
import { DEFAULT_HELP, NAV, SEARCH_TYPE_OPTIONS } from '../../utils/constants';
import AddProposalButton from '../../components/button/AddProposal/AddProposalButton';
import CloneIcon from '../../components/icon/cloneIcon/cloneIcon';
import DownloadIcon from '../../components/icon/downloadIcon/downloadIcon';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { Proposal } from '../../services/types/proposal';
import MockProposal from '../../services/axios/getProposal/mockProposal';

export default function PHT() {
  const navigate = useNavigate();
  const {
    clearApp,
    helpComponent,
    updateAppContent1,
    updateAppContent2,
    updateAppContent3
  } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');
  const [dataProposals, setDataProposals] = React.useState([]);
  const [axiosError, setAxiosError] = React.useState('');
  const [axiosViewError, setAxiosViewError] = React.useState('');
  const [axiosViewErrorColor, setAxiosViewErrorColor] = React.useState(null);

  const PAGE_DESC =
    'Proposals where you have either participated as a Co-Investigator or as a Principal Investigator.';

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const response = await GetProposalList();
      if (isMounted) {
        if (response && !response.error) {
          if (response.every((item: { id: number; title: string }) => item.id && item.title)) {
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

  const getTheProposal = async () => {
    helpComponent(DEFAULT_HELP);
    clearApp();

    const proposalId = 1; // TODO replace with id from the list
    const response = await GetProposal(proposalId);
    if (response && !response.error) {
      // Handle successful response
      setAxiosViewError(`Success: ${response}`);
      setAxiosViewErrorColor(AlertColorTypes.Success);
      // setDataProposals([]); // can we remove this???
      updateAppContent1([5, 5, 5, 5, 5, 5, 5, 5]);
      updateAppContent2(MockProposal); // TODO Replace with axios/GetProposal();
      updateAppContent3(MockProposal); // TODO Replace with axios/GetProposal();
      setTimeout(() => {
        navigate(NAV[0]);
      }, 1000);
    } else {
      // Handle error response
      setAxiosViewError(response.error);
      setAxiosViewErrorColor(AlertColorTypes.Error);
    }
  };

  const editIconClicked = async () => {
    getTheProposal();
  };

  const viewIconClicked = () => {
    getTheProposal();
  };

  const canEdit = (e: { row: { status: string } }) => e.row.status === 'Draft';
  const canClone = () => true;
  const canDownload = () => true;
  const canDelete = (e: { row: { status: string } }) =>
    e.row.status === 'Draft' || e.row.status === 'Withdrawn';

  const COLUMNS = [
    { field: 'id', headerName: 'Proposal ID', width: 100 },
    { field: 'telescope', headerName: 'Telescope', width: 100 },
    { field: 'cycle', headerName: 'Cycle', width: 150 },
    { field: 'title', headerName: 'Title', width: 250 },
    { field: 'pi', headerName: 'PI', width: 150 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 150 },
    {
      field: 'cpi',
      headerName: ' ',
      sortable: false,
      width: 250,
      disableClickEventBubbling: true,
      renderCell: (e: never) => (
        <>
          {!canEdit(e) && <ViewIcon onClick={viewIconClicked} toolTip="View proposal" />}
          {canEdit(e) && <EditIcon onClick={editIconClicked} toolTip="Edit proposal" />}
          {canClone && <CloneIcon onClick={cloneIconClicked} toolTip="Clone proposal" />}
          {canDownload && (
            <DownloadIcon onClick={downloadIconClicked} toolTip="Download proposal" />
          )}
          {canDelete(e) && <TrashIcon onClick={deleteIconClicked} toolTip="Delete proposal" />}
        </>
      )
    }
  ];
  const extendedColumns = [...COLUMNS];

  function filterProposals() {
    return dataProposals.filter(
      item =>
        ['title', 'cycle'].some(field =>
          item[field].toLowerCase().includes(searchTerm.toLowerCase())
        ) &&
        (searchType === '' || item.status.toLowerCase() === searchType.toLowerCase())
    );
  }

  const filteredData = dataProposals ? filterProposals() : [];

  return (
    <>
      { axiosViewError ? (
        <Alert testId="alertErrorId" color={axiosViewErrorColor}>
          <Typography>{axiosViewError}</Typography>
        </Alert>
          )
      : null }
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
        <Typography variant="h5">{PAGE_DESC}</Typography>
      </Grid>

      <Grid p={1} spacing={2} container direction="row" alignItems="center" justifyContent="center">
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

      <Grid container direction="column" alignItems="center" justifyContent="space-evenly">
        <Grid item>
          {axiosError ? (
            <Alert testId="alertErrorId" color={AlertColorTypes.Error}>
              <Typography>{axiosError}</Typography>
            </Alert>
          ) : (
            <DataGrid
              testId="dataGridId"
              rows={filteredData}
              columns={extendedColumns}
              showBorder={false}
              height={500}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
}

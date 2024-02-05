import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  Alert,
  AlertColorTypes
} from '@ska-telescope/ska-gui-components';
import GetProposals from '../../services/axios/getProposalList/getProposalList';
import GetProposal from '../../services/axios/getProposal/getProposal';
import { NAV, SEARCH_TYPE_OPTIONS } from '../../utils/constants';
import AddProposalButton from '../../components/button/AddProposal/AddProposalButton';
import CloneIcon from '../../components/icon/cloneIcon/cloneIcon';
import DownloadIcon from '../../components/icon/downloadIcon/downloadIcon';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { Proposal } from '../../services/types/proposal';
import MockProposal from '../../services/axios/getProposal/mockProposal';

export default function LandingPage() {
  const { t } = useTranslation('pht');
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
  const [, setAxiosViewError] = React.useState('');
  const [, setAxiosViewErrorColor] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const response = await GetProposals();
      if (isMounted) {
        if (response && !response.error) {
          if (response.every((item: { id: number; title: string }) => item.id && item.title)) {
            setAxiosError('');
            setDataProposals(response as Proposal[]);
          } else {
            setAxiosError(t('error.axios.format'));
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
    helpComponent('');
    clearApp();

    const proposalId = 1; // TODO replace with id from the list
    const response = await GetProposal(proposalId);
    if (response && !response.error) {
      // Handle successful response
      setAxiosViewError(`Success: ${response}`);
      setAxiosViewErrorColor(AlertColorTypes.Success);
      setDataProposals([]);
      updateAppContent1([5, 5, 5, 5, 5, 5, 5, 5]);
      updateAppContent2(MockProposal); // TODO Replace with axios/GetProposal();
      updateAppContent3(MockProposal); // TODO Replace with axios/GetProposal();
      navigate(NAV[0]);
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

  const canEdit = () => true;

  const COLUMNS = [
    { field: 'id', headerName: t('id.label'), width: 100 },
    { field: 'telescope', headerName: t('label.telescope'), width: 100 },
    { field: 'cycle', headerName: t('cycle.label'), width: 150 },
    { field: 'title', headerName: t('title.label'), width: 200 },
    { field: 'pi', headerName: t('pi.short'), width: 150 },
    { field: 'status', headerName: t('status.label'), width: 100 },
    { field: 'lastUpdated', headerName: t('updated.label'), width: 150 },
    {
      field: 'cpi',
      headerName: ' ',
      sortable: false,
      width: 250,
      disableClickEventBubbling: true,
      renderCell: () => (
        <>
          {!canEdit && (
            <ViewIcon onClick={viewIconClicked} toolTip={t('icon.tooltip.viewProposal')} />
          )}
          {canEdit && (
            <EditIcon onClick={editIconClicked} toolTip={t('icon.tooltip.editProposal')} />
          )}
          <CloneIcon onClick={cloneIconClicked} toolTip={t('icon.tooltip.cloneProposal')} />
          <DownloadIcon
            onClick={downloadIconClicked}
            toolTip={t('icon.tooltip.downloadProposal')}
          />
          <TrashIcon onClick={deleteIconClicked} toolTip={t('icon.tooltip.deleteProposal')} />
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
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
        <Typography variant="h5">{t('page.10.desc')}</Typography>
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
            options={[{ label: t('status.0'), value: '' }, ...SEARCH_TYPE_OPTIONS]}
            testId="proposalType"
            value={searchType}
            setValue={setSearchType}
            label={t('status.0')}
          />
        </Grid>
        <Grid item xs={4} mt={-1}>
          <SearchEntry
            label={t('label.search')}
            testId="searchId"
            value={searchTerm}
            setValue={setSearchTerm}
          />
        </Grid>
      </Grid>

      <Grid p={1} container direction="column" alignItems="flex-left" justifyContent="space-evenly">
        <Grid
          p={1}
          container
          direction="column"
          alignItems="flex-left"
          justifyContent="space-evenly"
        />
        {axiosError ? (
          <Alert testId="alertErrorId" color={AlertColorTypes.Error}>
            <Typography>{axiosError}</Typography>
          </Alert>
        ) : (
          <DataGrid
            testId="dataGridId"
            rows={filteredData}
            columns={extendedColumns}
            height={500}
          />
        )}
      </Grid>
    </>
  );
}

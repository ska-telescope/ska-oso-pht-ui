import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes,
  InfoCard,
  InfoCardColorTypes
} from '@ska-telescope/ska-gui-components';
import GetProposalList from '../../services/axios/getProposalList/getProposalList';
import GetProposal from '../../services/axios/getProposal/getProposal';
import { NAV, SEARCH_TYPE_OPTIONS } from '../../utils/constants';
import AddProposalButton from '../../components/button/AddProposal/AddProposalButton';
import CloneIcon from '../../components/icon/cloneIcon/cloneIcon';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import ProposalDisplay from '../../components/alerts/proposalDisplay/ProposalDisplay';
import { Proposal } from '../../services/types/proposal';
import MockProposal from '../../services/axios/getProposal/mockProposal';
import TimedAlert from '../../components/alerts/timedAlert/TimedAlert';
import { env } from '../../env';

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
  const [proposals, setProposals] = React.useState([]);
  const [axiosError, setAxiosError] = React.useState('');
  const [axiosViewError, setAxiosViewError] = React.useState('');
  const [openCloneDialog, setOpenCloneDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openViewDialog, setOpenViewDialog] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const response = await GetProposalList();
      if (isMounted) {
        if (response && !response.error) {
          if (response.every((item: { id: number; title: string }) => item.id && item.title)) {
            setAxiosError('');
            setProposals(response as Proposal[]);
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

  const getTheProposal = async () => {
    helpComponent('');
    clearApp();

    const proposalId = 1; // TODO replace with id from the list
    const response = await GetProposal(proposalId);
    if (response && !response.error) {
      // Handle successful response
      setAxiosViewError('');
      updateAppContent1([5, 5, 5, 5, 5, 5, 5, 5]);
      updateAppContent2(MockProposal); // TODO Replace with axios/GetProposal();
      updateAppContent3(MockProposal); // TODO Replace with axios/GetProposal();
      return true;
    } else {
      // Handle error response
      setAxiosViewError(response.error);
      updateAppContent1(null);
      updateAppContent2(null);
      updateAppContent3(null);
      return false;
    }
  };

  const goToTitlePage = () => {
    setTimeout(() => {
      navigate(env.REACT_APP_SKA_PHT_BASE_URL + NAV[0]);
    }, 1000);
  };

  const viewIconClicked = () => {
    if (getTheProposal()) {
      setTimeout(() => {
        setOpenViewDialog(true);
      }, 1000);
    }
  };

  const editIconClicked = async () => {
    if (getTheProposal()) {
      goToTitlePage();
    }
  };

  const cloneIconClicked = () => {
    if (getTheProposal()) {
      setTimeout(() => {
        setOpenCloneDialog(true);
      }, 1000);
    }
  };

  const cloneConfirmed = () => {
    setOpenCloneDialog(false);
    // TODO - In here we need to copy the proposal and take them to the title for processing.
    goToTitlePage();
  };

  const deleteIconClicked = () => {
    if (getTheProposal()) {
      setTimeout(() => {
        setOpenDeleteDialog(true);
      }, 1000);
    }
  };

  const deleteConfirmed = () => {
    setOpenDeleteDialog(false);
  };

  const canEdit = (e: { row: { status: string } }) => e.row.status === 'Draft';
  const canClone = () => true;
  const canDelete = (e: { row: { status: string } }) =>
    e.row.status === 'Draft' || e.row.status === 'Withdrawn';

  const COLUMNS = [
    { field: 'id', headerName: t('id.label'), width: 100 },
    { field: 'telescope', headerName: t('arrayConfiguration.label'), width: 100 },
    { field: 'cycle', headerName: t('cycle.label'), width: 150 },
    { field: 'title', headerName: t('title.label'), width: 250 },
    { field: 'pi', headerName: t('pi.short'), width: 150 },
    { field: 'status', headerName: t('status.label'), width: 100 },
    { field: 'lastUpdated', headerName: t('updated.label'), width: 150 },
    {
      field: 'cpi',
      headerName: ' ',
      sortable: false,
      width: 250,
      disableClickEventBubbling: true,
      renderCell: (e: never) => (
        <>
          <EditIcon
            onClick={editIconClicked}
            disabled={!canEdit(e)}
            toolTip={t(canEdit(e) ? 'editProposal.toolTip' : 'editProposal.disabled')}
          />
          <ViewIcon onClick={viewIconClicked} toolTip={t('viewProposal.toolTip')} />
          <CloneIcon
            onClick={cloneIconClicked}
            disabled={!canClone()}
            toolTip={t('cloneProposal.toolTip')}
          />
          <TrashIcon
            onClick={deleteIconClicked}
            disabled={!canDelete(e)}
            toolTip={t(canDelete(e) ? 'deleteProposal.toolTip' : 'deleteProposal.disabled')}
          />
        </>
      )
    }
  ];
  const extendedColumns = [...COLUMNS];

  function filterProposals() {
    return proposals.filter(
      item =>
        ['title', 'cycle', 'pi'].some(field =>
          item[field].toLowerCase().includes(searchTerm.toLowerCase())
        ) &&
        (searchType === '' || item.status.toLowerCase() === searchType.toLowerCase())
    );
  }

  const filteredData = proposals ? filterProposals() : [];

  return (
    <>
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
        <Typography variant="h5">{t('page.11.desc')}</Typography>
      </Grid>

      <Grid p={1} spacing={2} container direction="row" alignItems="center" justifyContent="center">
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

      {axiosViewError && <TimedAlert color={AlertColorTypes.Error} text={axiosViewError} />}
      {!axiosViewError && (
        <Grid container direction="column" alignItems="center" justifyContent="space-evenly">
          <Grid item>
            {axiosError && (
              <TimedAlert clear={setAxiosError} color={AlertColorTypes.Error} text={axiosError} />
            )}
            {!axiosError && (!filteredData || filteredData.length === 0) && (
              <InfoCard
                color={InfoCardColorTypes.Info}
                fontSize={20}
                message={t('proposals.empty')}
                testId="helpPanelId"
              />
            )}
            {!axiosError && filteredData.length > 0 && (
              <DataGrid
                testId="dataGridId"
                rows={filteredData}
                columns={extendedColumns}
                showBorder={false}
                showMild
                height={500}
              />
            )}
          </Grid>
        </Grid>
      )}
      {openDeleteDialog && (
        <ProposalDisplay
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={deleteConfirmed}
          onConfirmLabel="deleteProposal.confirm"
        />
      )}
      {openCloneDialog && (
        <ProposalDisplay
          open={openCloneDialog}
          onClose={() => setOpenCloneDialog(false)}
          onConfirm={cloneConfirmed}
          onConfirmLabel="cloneProposal.confirm"
        />
      )}
      {openViewDialog && (
        <ProposalDisplay
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          onConfirm={deleteConfirmed}
          onConfirmLabel=""
        />
      )}
    </>
  );
}

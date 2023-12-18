import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, FormControlLabel, IconButton } from '@mui/material';
import { DropDown, SearchEntry } from '@ska-telescope/ska-gui-components';
import { EditRounded, FileCopyRounded, DownloadRounded, DeleteRounded } from '@mui/icons-material';
import { grey } from '@mui/material/colors';
import { EXISTING_PROPOSALS, SEARCH_TYPE_OPTIONS } from '../../utils/constants';
import AddProposalButton from '../../components/button/AddProposal/AddProposalButton';
import DataGridWrapper from '../../components/wrappers/dataGridWrapper/dataGridWrapper';
// import { event } from 'cypress/types/jquery';

const MatEdit = ({ id }) => {
  const handleEditClick = () => {
    // eslint-disable-next-line no-console
    console.log('::: in handleEditClick', id);
    // to do: implement edit proposal once API endpoint ready
  };

  return (
    <FormControlLabel
      label=''
      control={(
        <IconButton
          color="secondary"
          aria-label="edit"
          onClick={handleEditClick}
        >
          <EditRounded style={{ color: grey[500] }} />
        </IconButton>
      )}
    />
  );
};

const MatClone = ({ id }) => {
  const handleCloneClick = () => {
    // eslint-disable-next-line no-console
    console.log('::: in handleCloneClick', id);
    // to do: implement clone proposal once API endpoint ready
  };

  return (
    <FormControlLabel
      label=''
      control={(
        <IconButton
          color="secondary"
          aria-label="clone"
          onClick={handleCloneClick}
        >
          <FileCopyRounded style={{ color: grey[500] }} />
        </IconButton>
      )}
    />
  );
};

const MatDownload = ({ id }) => {
  const handleDownloadClick = () => {
    // eslint-disable-next-line no-console
    console.log('::: in handleDownloadClick', id);
    // to do: implement download proposal once API endpoint ready
  };

  return (
    <FormControlLabel
      label=''
      control={(
        <IconButton
          color="secondary"
          aria-label="download"
          onClick={handleDownloadClick}
        >
          <DownloadRounded style={{ color: grey[500] }} />
        </IconButton>
      )}
    />
  );
};

const MatDelete = ({ id }) => {
  const handleDeleteClick = () => {
    // eslint-disable-next-line no-console
    console.log('::: in handleDeleteClick', id);
    // to do: implement delete proposal once API endpoint ready
  };

  return (
    <FormControlLabel
      label=''
      control={(
        <IconButton
          color="secondary"
          aria-label="delete"
          onClick={handleDeleteClick}
        >
          <DeleteRounded style={{ color: grey[500]}} />
        </IconButton>
      )}
    />
  );
};

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
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 400,
      disableClickEventBubbling: true,
      renderCell: (params) => (
        <>
          <div
            className="d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
          >
            <MatEdit id={params.id} />
          </div>
          <div
            className="d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
          >
            <MatClone id={params.id} />
          </div>
          <div
            className="d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
          >
            <MatDownload id={params.id} />
          </div>
          <div
            className="d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
          >
            <MatDelete id={params.id} />
          </div>
        </>
        )
    }
  ];
  const extendedColumns = [...COLUMNS];

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
          // rowClick={ClickFunction}
        />
      </Grid>
    </>
  );
}
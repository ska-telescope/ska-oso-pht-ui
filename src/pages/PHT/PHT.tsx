import { Grid, Typography } from '@mui/material';
import { DropDown, SearchEntry, DataGrid } from '@ska-telescope/ska-gui-components';
import { t } from 'i18next';
import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SEARCH_TYPE_OPTIONS } from '../..//utils/constants';
//import { NAV } from '../../utils/constants';
//import AddObservation from '../AddObservation/AddObservation';
//import AddProposal from '../AddProposal/AddProposal';
//import DataPage from '../DataPage/DataPage';
//import GeneralPage from '../GeneralPage/GeneralPage';
// import LandingPage from '../LandingPage/LandingPage';
//import ObservationPage from '../ObservationPage/ObservationPage';
//import SciencePage from '../SciencePage/SciencePage';
//import TargetPage from '../TargetPage/TargetPage';
//import TeamPage from '../TeamPage/TeamPage';
//import TechnicalPage from '../TechnicalPage/TechnicalPage';
//import TitlePage from '../TitlePage/TitlePage';

export default function PHT() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');
  const [dataProposals] = React.useState([]);

  function filterProposals() {
    return dataProposals.filter(
      item =>
        ['title', 'cycle'].some(field =>
          item[field].toLowerCase().includes(searchTerm.toLowerCase())
        ) &&
        (searchType === '' || item.status.toLowerCase() === searchType.toLowerCase())
    );
  }

  const COLUMNS = [
    { field: 'id', headerName: t('id.label'), width: 100 },
    { field: 'telescope', headerName: t('label.telescope'), width: 100 },
    { field: 'cycle', headerName: t('cycle.label'), width: 150 },
    { field: 'title', headerName: t('title.label'), width: 250 },
    { field: 'pi', headerName: t('pi.short'), width: 150 },
    { field: 'status', headerName: t('status.label'), width: 100 },
    { field: 'lastUpdated', headerName: t('updated.label'), width: 150 }
  ];
  const extendedColumns = [...COLUMNS];

  const filteredData = dataProposals ? filterProposals() : [];

  return (
    <>
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
        <Typography variant="h5">HEADER</Typography>
      </Grid>

      <Grid p={1} spacing={2} container direction="row" alignItems="center" justifyContent="center">
        <Grid item xs={2} />
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

      <Grid container direction="column" alignItems="center" justifyContent="space-evenly">
        <Grid item>
          <DataGrid
            testId="dataGridId"
            rows={filteredData}
            columns={extendedColumns}
            showBorder={false}
            height={500}
          />
        </Grid>
      </Grid>
    </>
  );
}

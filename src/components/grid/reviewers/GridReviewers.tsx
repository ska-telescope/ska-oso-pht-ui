import { useTranslation } from 'react-i18next';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Typography, Grid2, Box, Card, CardContent } from '@mui/material';
import React from 'react';
import { LABEL_POSITION, Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import Alert from '../../alerts/standardAlert/StandardAlert';
import {
  FOOTER_SPACER,
  NOT_SPECIFIED,
  REVIEWER_STATUS,
  SEARCH_TYPE_OPTIONS_REVIEWERS
} from '@/utils/constants';
import GetReviewerList from '@/services/axios/getReviewerList/getReviewerList';
import Reviewer from '@/utils/types/reviewer';
import { Panel } from '@/utils/types/panel';
import { PanelReviewer } from '@/utils/types/panelReviewer';

export function filterReviewers(
  reviewers: Reviewer[],
  searchTerm: string,
  searchTypeExpertise: string,
  searchTypeAffiliation: string
) {
  const fields: (keyof Reviewer)[] = ['givenName', 'surname', 'jobTitle'];
  return reviewers.filter(
    item =>
      fields.some(field =>
        (item[field] as string)?.toLowerCase().includes(searchTerm?.toLowerCase())
      ) &&
      (searchTypeExpertise === '' ||
        item.subExpertise?.toLowerCase() === searchTypeExpertise?.toLowerCase()) &&
      (searchTypeAffiliation === '' ||
        item.officeLocation?.toLowerCase() === searchTypeAffiliation?.toLowerCase())
  );
}

interface GridReviewersProps {
  height?: string;
  currentPanel: Panel | null;
  onChange: (reviewersList: PanelReviewer[]) => void;
  showTitle?: boolean;
  showSearch?: boolean;
}

export default function GridProposals({
  height = '50vh',
  showTitle = false,
  showSearch = false,
  currentPanel,
  onChange
}: GridReviewersProps) {
  const { t } = useTranslation('pht');

  const [reviewers, setReviewers] = React.useState<Reviewer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchTypeExpertise, setSearchTypeExpertise] = React.useState('');
  const [searchTypeAffiliation, setSearchTypeAffiliation] = React.useState('');
  const [selected, setSelected] = React.useState(true);
  const [notSelected, setNotSelected] = React.useState(true);
  const [axiosError, setAxiosError] = React.useState('');
  const [localPanel, setLocalPanel] = React.useState<Panel>({} as Panel);
  const [fetchList] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await GetReviewerList();

      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setReviewers(response);
      }
    };
    fetchData();
  }, [fetchList]);

  React.useEffect(() => {
    if (currentPanel && currentPanel?.id) {
      setLocalPanel(currentPanel);
    }
  }, [currentPanel]);

  const displayStatus = (status: any) => {
    return status
      ? t('reviewers.statusCategory.' + status)
      : t('reviewers.statusCategory.' + NOT_SPECIFIED);
  };

  const setReviewerPanels = (reviewerPanels: PanelReviewer[]) => {
    // send updated reviewer list to parent component
    onChange(reviewerPanels);
  };

  const deleteReviewerPanel = (reviewer: Reviewer) => {
    function filterRecords(id: string) {
      return localPanel?.reviewers?.filter(item => !(item.reviewerId === id));
    }
    const filtered = filterRecords(reviewer.id);
    setReviewerPanels(filtered);
  };

  const isReviewerSelected = (reviewerId: string): boolean => {
    return localPanel?.reviewers?.filter(entry => entry.reviewerId === reviewerId).length > 0;
  };

  const addReviewerPanel = (reviewer: Reviewer) => {
    const rec: PanelReviewer = {
      reviewerId: reviewer.id,
      panelId: localPanel?.id ?? '',
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    };
    const reviewers = localPanel?.reviewers;
    reviewers.push(rec);
    setReviewerPanels(reviewers);
  };

  const reviewerSelectedToggle = (reviewer: Reviewer) => {
    if (isReviewerSelected(reviewer.id)) {
      deleteReviewerPanel(reviewer);
    } else {
      addReviewerPanel(reviewer);
    }
  };

  const colSelect = {
    field: 'select',
    headerName: '',
    flex: 0.6,
    disableClickEventBubbling: true,
    renderCell: (e: { row: any }) => (
      <Box pr={1}>
        <TickBox
          label=""
          testId="linkedTickBox"
          checked={isReviewerSelected(e.row.id)}
          onChange={() => reviewerSelectedToggle(e.row)}
        />
      </Box>
    )
  };

  const colTitle = {
    field: 'title',
    headerName: t('reviewers.title'),
    minWidth: 120,
    renderCell: (e: any) => e.row.jobTitle
  };

  const colGivenName = {
    field: 'givenName',
    headerName: t('reviewers.givenName'),
    minWidth: 180,
    renderCell: (e: { row: any }) => e.row.givenName
  };

  const colSurname = {
    field: 'surname',
    headerName: t('reviewers.surname'),
    minWidth: 180,
    renderCell: (e: { row: any }) => e.row.surname
  };

  const colOfficeLocation = {
    field: 'officeLocation',
    headerName: t('reviewers.officeLocation'),
    minWidth: 200,
    renderCell: (e: { row: any }) => e.row.officeLocation
  };

  const colSubExpertise = {
    field: 'subExpertise',
    headerName: t('reviewers.subExpertise'),
    flex: 2,
    minWidth: 200,
    renderCell: (e: { row: any }) => t('reviewers.subExpertiseCategory.' + e.row.subExpertise)
  };

  const colStatus = {
    field: 'status',
    headerName: t('reviewers.status'),
    minWidth: 150,
    renderCell: (e: { row: any }) => displayStatus(e.row.status)
  };

  const stdColumns = [
    ...[
      colSelect,
      colTitle,
      colGivenName,
      colSurname,
      colOfficeLocation,
      colSubExpertise,
      colStatus
    ]
  ];

  const selectedData = reviewers
    ? reviewers.filter(e => (isReviewerSelected(e.id) ? selected : notSelected))
    : [];
  const filteredData = selectedData
    ? filterReviewers(selectedData, searchTerm, searchTypeExpertise, searchTypeAffiliation)
    : [];

  const ReviewersSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh" textAlign={'left'}>
      {t('reviewers.label')}
    </Typography>
  );

  const searchDropdownExpertise = () => (
    <DropDown
      options={[{ label: t('subjectExpertise.0'), value: '' }, ...SEARCH_TYPE_OPTIONS_REVIEWERS]}
      testId="subExpertise"
      value={searchTypeExpertise}
      setValue={setSearchTypeExpertise}
      label={t('subjectExpertise.0')}
    />
  );

  const getAffiliationOptions = () => {
    const affiliations = reviewers
      .map(reviewer => reviewer.officeLocation)
      .filter((value, index, self) => self.indexOf(value) === index && value !== '');
    return affiliations.map(affiliation => ({
      label: affiliation,
      value: affiliation
    }));
  };

  const searchDropdownAffiliation = () => (
    <DropDown
      options={[{ label: t('affiliation.0'), value: '' }, ...getAffiliationOptions()]}
      testId="officeLocation"
      value={searchTypeAffiliation}
      setValue={setSearchTypeAffiliation}
      label={t('affiliation.0')}
    />
  );

  const searchEntryField = (testId: string) => (
    <SearchEntry
      label={t('search.label')}
      testId={testId}
      value={searchTerm}
      setValue={setSearchTerm}
    />
  );

  return (
    <>
      {showTitle && (
        <Grid2 p={2} size={{ lg: 12 }}>
          {ReviewersSectionTitle()}
        </Grid2>
      )}

      {showSearch && (
        <Grid2
          pt={2}
          size={{ sm: 12, md: 8, lg: 12 }}
          container
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid2 size={{ sm: 12, lg: 8 }}>
            <Grid2 container direction="row" spacing={2}>
              <Grid2 size={{ sm: 6 }}>{searchDropdownExpertise()}</Grid2>
              <Grid2 size={{ sm: 6 }}>{searchDropdownAffiliation()}</Grid2>
            </Grid2>
            <Grid2 size={{ sm: 12 }} mt={-1}>
              {searchEntryField('searchId')}
            </Grid2>
          </Grid2>
          <Grid2 size={{ sm: 12, lg: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Grid2
                  container
                  flexDirection={'row'}
                  flexWrap={'wrap'}
                  alignItems="space-evenly"
                  justifyContent="space-between"
                >
                  <Grid2>
                    <Typography id="targetObservationLabel" pt={1} variant="h6">
                      {t('targetObservation.filters')}
                    </Typography>
                  </Grid2>

                  <Grid2>
                    <Grid2
                      container
                      flexDirection={'row'}
                      flexWrap={'wrap'}
                      justifyContent={'flex-start'}
                    >
                      <Grid2>
                        <TickBox
                          disabled={!localPanel}
                          label={t('selected.label')}
                          labelPosition={LABEL_POSITION.END}
                          testId="selectedTickBox"
                          checked={selected}
                          onChange={() => setSelected(!selected)}
                        />
                      </Grid2>
                      <Grid2>
                        <TickBox
                          disabled={!localPanel}
                          label={t('notSelected.label')}
                          labelPosition={LABEL_POSITION.END}
                          testId="notSelectedTickBox"
                          checked={notSelected}
                          onChange={() => setNotSelected(!notSelected)}
                        />
                      </Grid2>
                    </Grid2>
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      )}
      <Grid2 size={{ xs: 12 }} pt={1}>
        {!axiosError && (!filteredData || filteredData.length === 0) && (
          <Alert color={AlertColorTypes.Info} text={t('reviewers.empty')} testId="helpPanelId" />
        )}
        {!axiosError && filteredData.length > 0 && (
          <div>
            <DataGrid
              maxHeight={height}
              testId="dataGridId"
              rows={filteredData}
              columns={stdColumns}
              height={height}
            />
          </div>
        )}
        {axiosError && (
          <Alert color={AlertColorTypes.Error} testId="axiosErrorTestId" text={axiosError} />
        )}
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
    </>
  );
}

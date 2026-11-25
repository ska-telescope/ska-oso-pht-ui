import React from 'react';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Typography, Box, Grid } from '@mui/material';
import Alert from '../../alerts/standardAlert/StandardAlert';
import {
  getColAuthors,
  getColProposalObservingMode,
  getColProposalPI,
  getColProposalSC,
  getColProposalStatus,
  getColProposalTitle,
  getColProposalType,
  getColProposalTypeCycle
} from './columns/Columns';
import GetProposalsReviewable from '@/services/axios/get/getProposalsReviewable/getProposalsReviewable';
import Proposal from '@/utils/types/proposal';
import { PROPOSAL_STATUS, DETAILS, PROPOSAL_TYPE } from '@/utils/constants';
import { IdObject } from '@/utils/types/idObject';
import { arraysAreEqual } from '@/utils/helpers';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import TriStateCheckbox from '@/components/fields/triStateCheckbox/TriStateCheckbox';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

export function filterProposals(
  proposals: Proposal[],
  searchTerm: string,
  searchScienceCategory: string | null,
  searchProposalType: string
): Proposal[] {
  const fields: (keyof Proposal)[] = ['title'];
  return proposals.filter(
    (item) =>
      fields.some((field) =>
        (item[field] as string)?.toLowerCase().includes(searchTerm?.toLowerCase())
      ) &&
      (searchScienceCategory === null || item?.scienceCategory === searchScienceCategory) &&
      (searchProposalType === '' || item?.proposalType === searchProposalType)
  );
}

interface GridProposalsProps {
  selectedProposals?: IdObject[];
  forReview?: boolean;
  showSearch?: boolean;
  showTitle?: boolean;
  showSelection?: boolean;
  tickBoxClicked?: (proposal: Proposal, isProposalSelected: boolean) => void;
}

export default function GridProposals({
  selectedProposals = [],
  showSearch = false,
  showTitle = false,
  forReview = false,
  showSelection = false,
  tickBoxClicked = () => {}
}: GridProposalsProps) {
  const { t } = useScopedTranslation();
  const { osdPolicies } = useOSDAccessors();

  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchScienceCategory, setSearchScienceCategory] = React.useState<string | null>(null);
  const [searchProposalType, setSearchProposalType] = React.useState('');

  const [axiosError, setAxiosError] = React.useState('');
  const [fetchList, setFetchList] = React.useState(false);
  const [proposalsCollection, setProposalsCollection] = React.useState<IdObject[]>([]);
  const [checkState, setCheckState] = React.useState<'checked' | 'unchecked' | 'indeterminate'>(
    'indeterminate'
  );

  const { axiosClient: authClient } = useAxiosAuthClient();

  React.useEffect(() => {
    setFetchList(!fetchList);
  }, []);

  React.useEffect(() => {
    const fetchData = async (status: string) => {
      const response = await GetProposalsReviewable(authClient);
      const prevProposals = status === PROPOSAL_STATUS.UNDER_REVIEW ? [] : proposals;

      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setProposals([...prevProposals, ...response]);
      }
    };
    setProposals([]);
    fetchData(PROPOSAL_STATUS.UNDER_REVIEW);
    fetchData(PROPOSAL_STATUS.SUBMITTED);
  }, [fetchList]);

  React.useEffect(() => {
    if (selectedProposals && !arraysAreEqual(selectedProposals, proposalsCollection)) {
      setProposalsCollection(selectedProposals);
    }
  }, [selectedProposals]);

  const isProposalSelected = (proposalId: string): boolean => {
    return proposalsCollection?.filter((entry) => entry.id === proposalId)?.length > 0;
  };

  const colSelect = {
    field: 'select',
    headerName: 'Select',
    renderHeader: () => (
      <Box
        sx={{
          pl: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          margin: 0
        }}
      >
        <TriStateCheckbox state={checkState} setState={setCheckState} />
      </Box>
    ),
    disableClickEventBubbling: true,
    filterable: false,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (e: { row: any }) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          margin: 0
        }}
      >
        <TickBox
          label=""
          labelPosition="top"
          testId="linkedTickBox"
          checked={isProposalSelected(e.row.id)}
          onChange={() => tickBoxClicked?.(e.row, isProposalSelected(e.row.id))}
        />
      </Box>
    )
  };

  // Each column is only shown when some proposal needs it: the science category when a proposal
  // has one, and the observing mode when a proposal has none (e.g. SV)
  const scienceCategoryColumn = proposals.some((proposal) => proposal.scienceCategory)
    ? [getColProposalSC(t)]
    : [];
  const observingModeColumn = proposals.some((proposal) => !proposal.scienceCategory)
    ? [getColProposalObservingMode(t)]
    : [];

  const proposalColumns = [
    ...(showSelection ? [colSelect] : []),
    getColProposalTitle(t),
    getColProposalTypeCycle(t, osdPolicies),
    getColProposalStatus(t),
    ...scienceCategoryColumn,
    ...observingModeColumn,
    getColProposalPI(t)
  ];

  const reviewColumns = [
    ...[
      getColProposalType(t),
      getColProposalTitle(t),
      getColAuthors(t),
      ...scienceCategoryColumn,
      ...observingModeColumn
    ]
  ];

  const selectedData = proposals
    ? proposals.filter((e) =>
        isProposalSelected(e.id) ? checkState !== 'unchecked' : checkState !== 'checked'
      )
    : [];
  const filteredData = selectedData
    ? filterProposals(selectedData, searchTerm, searchScienceCategory, searchProposalType)
    : [];

  const renderProposalsSectionTitle = () => (
    <Typography
      align="center"
      variant="h6"
      sx={{
        minHeight: '4vh',
        textAlign: 'left'
      }}
    >
      {t('proposals.label')}
    </Typography>
  );

  const scienceCategoryDropdown = () => (
    <Box
      sx={{
        pt: 1
      }}
    >
      <DropDown
        options={[{ label: t('scienceCategory.all'), value: null }, ...DETAILS.ScienceCategory]}
        testId="proposalScienceCategory"
        value={searchScienceCategory}
        setValue={setSearchScienceCategory}
        label={t('scienceCategory.all')}
      />
    </Box>
  );

  const proposalTypeDropdown = () => (
    <Box
      sx={{
        pt: 1
      }}
    >
      <DropDown
        options={[
          { label: t('proposalType.all'), value: '' },
          ...Object.values(PROPOSAL_TYPE).map((type) => ({
            label: t('proposalType.title.' + type),
            value: type
          }))
        ]}
        testId="proposalType"
        value={searchProposalType}
        setValue={setSearchProposalType}
        label={t('proposalType.all')}
      />
    </Box>
  );

  const searchEntryField = (testId: string) => (
    <SearchEntry
      label={t('search.label')}
      testId={testId}
      value={searchTerm}
      setValue={setSearchTerm}
    />
  );

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState<number>(0);
  React.useLayoutEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const TITLE_HEIGHT = 120;
  const SEARCH_HEIGHT = 120;
  const interimHeight = showTitle ? containerHeight - TITLE_HEIGHT : containerHeight;
  const finalHeight = showSearch ? `${interimHeight - SEARCH_HEIGHT}px` : `${interimHeight}px`;

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {showTitle && (
        <Grid container size={{ lg: 12 }}>
          {renderProposalsSectionTitle()}
        </Grid>
      )}

      {showSearch && (
        <Grid
          size={{ sm: 12 }}
          container
          direction="row"
          spacing={2}
          sx={{
            pb: 2,
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Grid size={{ sm: 3 }}>{proposalTypeDropdown()}</Grid>
          <Grid size={{ sm: 3 }}>{scienceCategoryDropdown()}</Grid>
          <Grid size={{ sm: 5 }}>{searchEntryField('searchId')}</Grid>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <div>
          <DataGrid
            maxHeight={finalHeight}
            testId="dataGridProposals"
            rows={filteredData}
            columns={forReview ? reviewColumns : proposalColumns}
            height={finalHeight}
          />
        </div>
        {axiosError && (
          <Alert color={AlertColorTypes.Error} testId="axiosErrorTestId" text={axiosError} />
        )}
      </Grid>
    </Box>
  );
}

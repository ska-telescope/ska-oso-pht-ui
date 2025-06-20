import { SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { DateEntry, DropDown, SearchEntry } from '@ska-telescope/ska-gui-components';
import Grid2 from '@mui/material/Grid2';
import useTheme from '@mui/material/styles/useTheme';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';
import { proposals } from './mocked';
import { PATH, PMT } from '@/utils/constants';
import GridProposals from '@/components/grid/proposals/GridProposals';
import GridReviewers from '@/components/grid/reviewers/GridReviewers';
import GridReviewPanels from '@/components/grid/reviewPanels/GridReviewPanels';
import CardTitle from '@/components/cards/cardTitle/CardTitle';
import D3PieChart from '@/components/charts/D3PieChart';
import D3BarChart from '@/components/charts/D3BarChart';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import ResetButton from '@/components/button/Reset/Reset';

const MIN_CARD_WIDTH = 350;
const CARD_HEIGHT = '45vh';
const CONTENT_HEIGHT = `calc(${CARD_HEIGHT} - 140px)`;

function groupByField(
  data: typeof proposals,
  field: keyof typeof proposals[0],
  filters: { telescope: string; country: string; date: string },
  search: string
) {
  const filtered = data.filter(d => {
    const searchMatch = Object.values(d).some(v =>
      String(v)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    return (
      (!filters.telescope || d.telescope === filters.telescope) &&
      (!filters.country || d.country === filters.country) &&
      (!filters.date || d.date === filters.date) &&
      (!search || searchMatch)
    );
  });

  const counts = filtered.reduce((acc, item) => {
    const key = item[field];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function groupRankDistribution(data: typeof proposals) {
  const counts: Record<string, number> = {};
  for (const item of data) {
    const key = item.rank?.toString() || 'Not ranked';
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts).map(([rank, count]) => ({ group: rank, rank: count }));
}

const ResizablePanel = ({ children, title }: { children: ReactNode; title: string }) => {
  return (
    <div
      className="border rounded p-3 shadow flex flex-col resize overflow-auto mb-6 hover:bg-gray-100 hover:shadow-md transition-all duration-200"
      style={{
        minWidth: '350px',
        minHeight: '300px',
        resize: 'both',
        overflow: 'auto',
        border: '1px solid #ccc',
        backgroundColor: 'transparent',
        borderRadius: '8px'
      }}
    >
      <Typography p={1} id="title" variant="h5" style={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <div className="flex-1 flex items-center justify-center w-full h-full">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '5px'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default function ReviewDashboard() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const theme = useTheme();

  const [filter, setFilter] = useState({ telescope: '', country: '', date: '' });
  const [search, setSearch] = useState('');

  const onPanelClick = (thePath: string) => {
    if (thePath?.length > 0) {
      navigate(thePath);
    }
  };

  const panelButton = (title: string, toolTip: string, nav: string) => (
    <Grid2 m={2} minWidth={MIN_CARD_WIDTH}>
      <CardTitle
        className={''}
        code={t(title)[0].toUpperCase()}
        colorAvatarBG={theme.palette.primary.contrastText}
        colorAvatarFG={theme.palette.primary.main}
        colorCardBG={theme.palette.primary.main}
        colorCardFG={theme.palette.primary.contrastText}
        id={title}
        onClick={() => onPanelClick(nav)}
        title={t(title)}
        toolTip={t(toolTip)}
      />
    </Grid2>
  );

  const proposalStatusData = groupByField(proposals, 'status', filter, search);
  const scienceCategoryData = groupByField(proposals, 'category', filter, search);
  const barChartData = groupRankDistribution(proposals);
  const handleReset = () => {
    setFilter({ telescope: '', country: '', date: '' });
    setSearch('');
  };

  return (
    <>
      <PageBannerPMT hideOverviewButton title={t('menuOptions.overview')} />
      <Grid2 container direction="row" alignItems="center" justifyContent="space-around">
        {panelButton('menuOptions.panelSummary', 'panels.overviewTooltip', PMT[0])}
        {panelButton('menuOptions.reviews', 'reviewers.overviewTooltip', PMT[1])}
        {panelButton('menuOptions.proposals', 'proposals.overviewTooltip', PATH[0])}
      </Grid2>

      {/* Filters */}
      <Grid2 container spacing={2} px={5} py={2} alignItems="center" justifyContent="space-around">
        <Grid2 size={{ xs: 1 }}>
          <DropDown
            options={[
              { label: 'All', value: '' },
              { label: 'LOW', value: 'LOW' },
              { label: 'MID', value: 'MID' },
              { label: 'BOTH', value: 'BOTH' }
            ]}
            value={filter.telescope}
            setValue={(e: any) => setFilter({ ...filter, telescope: e })}
            label={'Telescope'}
          />
        </Grid2>
        <Grid2 size={{ xs: 2 }}>
          <DropDown
            options={[
              { label: 'All', value: '' },
              { label: 'South Africa', value: 'South Africa' },
              { label: 'United Kingdom', value: 'United Kingdom' },
              { label: 'Namibia', value: 'Namibia' }
            ]}
            value={filter.country}
            setValue={(e: any) => setFilter({ ...filter, country: e })}
            label={'Country'}
          />
        </Grid2>
        <Grid2 size={{ xs: 1 }}>
          <DateEntry
            label="Date"
            testId="dateEntryTestId"
            value={filter.date}
            setValue={(e: any) => setFilter({ ...filter, date: e })}
          />
        </Grid2>
        <Grid2 size={{ xs: 4 }}>
          <SearchEntry
            label={t('search.label')}
            testId={'searchTestId'}
            value={search}
            setValue={(e: SetStateAction<string>) => setSearch(e)}
          />
        </Grid2>
        <Grid2 size={{ xs: 2 }}>
          <ResetButton
            action={handleReset}
            disabled={
              search === '' &&
              filter.telescope === '' &&
              filter.country === '' &&
              filter.date === ''
            }
            title="Reset"
            testId="cancelButtonTestId"
          />
        </Grid2>
      </Grid2>

      {/* Metrics */}
      <Grid2 container spacing={2} px={5} py={3} pb={10}>
        <Grid2>
          <ResizablePanel title="Proposal Status">
            <D3PieChart
              data={proposalStatusData}
              showTotal={true}
              centerText={proposalStatusData.reduce((sum, d) => sum + d.value, 0).toString()}
            />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title="Science Categories">
            <D3PieChart
              data={scienceCategoryData}
              showTotal={true}
              centerText={scienceCategoryData.reduce((sum, d) => sum + d.value, 0).toString()}
            />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title="Reviewer Rank Distribution">
            <D3BarChart data={barChartData} fields={['rank']} groupBy={['group']} />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title={t('menuOptions.panelSummary')}>
            <GridReviewPanels height={CONTENT_HEIGHT} listOnly />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title={t('menuOptions.reviews')}>
            <GridReviewers height={CONTENT_HEIGHT} listOnly />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title={t('menuOptions.proposals')}>
            <GridProposals height={CONTENT_HEIGHT} listOnly />
          </ResizablePanel>
        </Grid2>
      </Grid2>
    </>
  );
}

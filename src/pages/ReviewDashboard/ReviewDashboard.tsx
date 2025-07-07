import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid2 from '@mui/material/Grid2';
import useTheme from '@mui/material/styles/useTheme';
import {
  DateEntry,
  DropDown,
  TextEntry,
  SPACER_VERTICAL,
  Spacer
} from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';
import { Card, Typography } from '@mui/material';
import { proposals } from './mocked';
import { BANNER_PMT_SPACER, PATH, PMT } from '@/utils/constants';
import GridProposals from '@/components/grid/proposals/GridProposals';
import GridReviewers from '@/components/grid/reviewers/GridReviewers';
import GridReviewPanels from '@/components/grid/reviewPanels/GridReviewPanels';
import CardTitle from '@/components/cards/cardTitle/CardTitle';
import D3PieChart from '@/components/charts/D3PieChart';
import { D3ChartSelector } from '@/components/charts/D3ChartSelector';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import D3BarChartWithToggle from '@/components/charts/D3BarChartWithToggle';
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

const ResizablePanel = ({ children, title }: { children: ReactNode; title: string }) => (
  <div
    className="border rounded p-3 bg-white shadow flex flex-col resize overflow-auto mb-6 hover:bg-gray-100 hover:shadow-md transition-all duration-200"
    style={{
      minWidth: '350px',
      minHeight: '300px',
      resize: 'both',
      overflow: 'auto',
      border: '1px solid #ccc',
      borderRadius: '16px'
    }}
  >
    <Typography p={1} variant="h5">
      {title}
    </Typography>

    <div className="flex-1 flex items-center justify-center w-full h-full">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

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
    <Grid2 m={2} data-testid={title} minWidth={MIN_CARD_WIDTH}>
      <Card data-testid={title}>
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
      </Card>
    </Grid2>
  );

  const proposalStatusData = groupByField(proposals, 'status', filter, search);
  const scienceCategoryData = groupByField(proposals, 'category', filter, search);

  return (
    <>
      <PageBannerPMT title={t('overview.title')} />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
      <Grid2 container direction="row" alignItems="center" justifyContent="space-around">
        {panelButton('page.15.title', 'page.15.tooltip', PMT[0])}
        {panelButton('reviewProposalList.title', 'reviewProposalList.tooltip', PMT[1])}
        {panelButton('homeBtn.title', 'homeBtn.tooltip', PATH[0])}
      </Grid2>

      {/* Filters */}
      <Grid2 container spacing={2} px={5} py={2} alignItems="center" justifyContent="space-between">
        <Grid2 size={{ sm: 2 }}>
          <DropDown
            options={[
              { value: '', label: 'All' },
              { value: 'LOW', label: 'LOW' },
              { value: 'MID', label: 'MID' },
              { value: 'BOTH', label: 'BOTH' }
            ]}
            testId={'telescopeTestId'}
            value={filter.telescope}
            setValue={(e: string) => setFilter({ ...filter, telescope: e })}
            label={'Telescope'}
          />
        </Grid2>
        <Grid2 size={{ sm: 2 }}>
          <DropDown
            options={[
              { value: '', label: 'All' },
              { value: 'South Africa', label: 'South Africa' },
              { value: 'United Kingdom', label: 'United Kingdom' },
              { value: 'Namibia', label: 'Namibia' }
            ]}
            testId={'countryTestId'}
            value={filter.country}
            setValue={(e: string) => setFilter({ ...filter, country: e })}
            label={'Country'}
          />
        </Grid2>
        <Grid2 size={{ sm: 2 }}>
          <DateEntry
            label={'Date'}
            setValue={(e: string) => setFilter({ ...filter, date: e })}
            testId="effectiveResolution"
            value={filter.date}
          />
        </Grid2>
        <Grid2 size={{ sm: 2 }}>
          <TextEntry
            label={'Search'}
            setValue={setSearch}
            testId="effectiveResolution"
            value={search}
          />
        </Grid2>
        <Grid2 size={{ sm: 2 }}>
          <ResetButton
            action={() => {
              setSearch('');
              setFilter({ telescope: '', country: '', date: '' });
            }}
            disabled={
              filter.telescope === '' &&
              filter.country === '' &&
              filter.date === '' &&
              search === ''
            }
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
            <D3BarChartWithToggle
              data={proposals}
              groupByOptions={['status', 'category', 'country']}
              allFields={['rank', 'telescope']}
            />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title="New Rank Distribution">
            <D3ChartSelector data={proposals} />
          </ResizablePanel>
        </Grid2>

        <Grid2>
          <ResizablePanel title={t('panels.label')}>
            <GridReviewPanels height={CONTENT_HEIGHT} updatedData={null} listOnly />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title={t('reviewProposalList.title')}>
            <GridReviewers height={CONTENT_HEIGHT} />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title={t('homeBtn.title')}>
            <GridProposals height={CONTENT_HEIGHT} />
          </ResizablePanel>
        </Grid2>
      </Grid2>
    </>
  );
}

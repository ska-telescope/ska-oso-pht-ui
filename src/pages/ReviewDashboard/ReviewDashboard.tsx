import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, IconButton, Paper, Tooltip, MenuItem, Select, TextField, InputLabel, FormControl } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import useTheme from '@mui/material/styles/useTheme';
import { useTranslation } from 'react-i18next';
import { ReactElement, JSXElementConstructor, ReactNode } from 'react';
import { PATH, PMT } from '@/utils/constants';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import GridProposals from '@/components/grid/proposals/GridProposals';
import GridReviewers from '@/components/grid/reviewers/GridReviewers';
import GridReviewPanels from '@/components/grid/reviewPanels/GridReviewPanels';
import CardTitle from '@/components/cards/cardTitle/CardTitle';
import D3PieChart from '@/components/charts/D3PieChart';
import { proposals } from './mocked';

const MIN_CARD_WIDTH = 350;
const CARD_HEIGHT = '45vh';
const CONTENT_HEIGHT = `calc(${CARD_HEIGHT} - 140px)`;

function groupByField(data: typeof proposals, field: keyof typeof proposals[0], filters: { telescope: string; country: string; date: string }, search: string) {
  const filtered = data.filter(d => {
    const searchMatch = Object.values(d).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    );
    return (!filters.telescope || d.telescope === filters.telescope) &&
           (!filters.country || d.country === filters.country) &&
           (!filters.date || d.date === filters.date) &&
           (!search || searchMatch);
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
    style={{ minWidth: '350px', minHeight: '300px', resize: 'both', overflow: 'auto', border: '1px solid #ccc' }}
  >
    <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2>
    <div className="flex-1 flex items-center justify-center w-full h-full">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
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

  return (
    <>
      <Grid2 container p={5} direction="row" alignItems="center" justifyContent="space-around">
        {panelButton('menuOptions.panelSummary', 'panels.overviewTooltip', PMT[0])}
        {panelButton('menuOptions.reviews', 'reviewers.overviewTooltip', PMT[1])}
        {panelButton('menuOptions.proposals', 'proposals.overviewTooltip', PATH[0])}
      </Grid2>

      {/* Filters */}
      <Grid2 container spacing={2} px={5} py={2} alignItems="center" justifyContent="space-between">
        <Grid2>
          <FormControl fullWidth>
            <InputLabel>Telescope</InputLabel>
            <Select
              value={filter.telescope}
              onChange={e => setFilter({ ...filter, telescope: e.target.value })}
              label="Telescope"
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MID">MID</MenuItem>
              <MenuItem value="BOTH">BOTH</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
        <Grid2>
          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={filter.country}
              onChange={e => setFilter({ ...filter, country: e.target.value })}
              label="Country"
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="South Africa">South Africa</MenuItem>
              <MenuItem value="United Kingdom">United Kingdom</MenuItem>
              <MenuItem value="Namibia">Namibia</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
        <Grid2>
          <TextField
            label="Date"
            type="date"
            value={filter.date}
            onChange={e => setFilter({ ...filter, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid2>
        <Grid2 sx={{ flexGrow: 1 }}>
          <TextField
            label="Search"
            fullWidth
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
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

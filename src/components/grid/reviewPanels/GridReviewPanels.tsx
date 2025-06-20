import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Typography, Grid2 } from '@mui/material';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { FOOTER_SPACER } from '@/utils/constants';
import { Panel } from '@/utils/types/panel';
import { PanelReviewer } from '@/utils/types/panelReviewer';

interface GridReviewPanelsProps {
  height?: string;
  listOnly?: boolean;
  onRowClick?: (row: any) => void;
  updatedData: PanelReviewer[];
}

export default function GridReviewPanels({
  height = '50vh',
  listOnly = false,
  onRowClick,
  updatedData
}: GridReviewPanelsProps) {
  const { t } = useTranslation('pht');

  const [data, setData] = React.useState<Panel[]>([]);
  const [fetchList, setFetchList] = React.useState(false);

  const DATA_GRID_HEIGHT = '65vh';

  const GetReviewPanels = (): Panel[] => [
    { id: 'P400', name: 'Stargazers', cycle: '2023-2024', proposals: [], reviewers: [] },
    { id: 'P500', name: 'Buttons', cycle: '2023-2024', proposals: [], reviewers: [] },
    { id: 'P600', name: 'Nashrakra', cycle: '2023-2024', proposals: [], reviewers: [] }
  ];

  const updateReviewPanel = (updatedData: PanelReviewer[]) => {
    if (updatedData && updatedData.length > 0) {
      // console.log('Updating review panel with data:', updatedData);
    }
  };

  React.useEffect(() => {
    updateReviewPanel(updatedData);
  }, updatedData);

  React.useEffect(() => {
    setFetchList(!fetchList);
  }, []);

  React.useEffect(() => {
    const fetchData = () => {
      const response = GetReviewPanels();
      setData(response);
      onRowClick?.(response[0]); // Trigger onRowClick with the first row on load of data to select it by default
    };
    fetchData();
  }, [fetchList]);

  const colTitle = {
    field: 'title',
    headerName: t('panels.name'),
    flex: 2,
    minWidth: 250,
    renderCell: (e: any) => e.row.name
  };

  const stdColumns = [...[colTitle]];

  const ProposalsSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh" textAlign={'left'}>
      {t('proposals.label')}
    </Typography>
  );

  return (
    <>
      {!listOnly && <Grid2>{ProposalsSectionTitle()}</Grid2>}

      <Grid2 pt={1}>
        {false && (!data || data.length === 0) && (
          <Alert color={AlertColorTypes.Info} text={t('page.15.empty')} testId="helpPanelId" />
        )}
        {true && data.length > 0 && (
          <div>
            <DataGrid
              maxHeight={height}
              testId="dataGridId"
              rows={data}
              columns={stdColumns}
              height={DATA_GRID_HEIGHT}
              onRowClick={(e: any) => {
                onRowClick?.(e.row);
              }}
            />
          </div>
        )}
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
    </>
  );
}

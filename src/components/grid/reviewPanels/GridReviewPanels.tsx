import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Typography, Grid2 } from '@mui/material';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { FOOTER_SPACER } from '@/utils/constants';

interface GridReviewPanelsProps {
  height?: string;
  listOnly?: boolean;
}

export default function GridReviewPanels({
  height = '50vh',
  listOnly = false
}: GridReviewPanelsProps) {
  const { t } = useTranslation('pht');

  const [data, setData] = React.useState<any[]>([]);
  const [fetchList, setFetchList] = React.useState(false);

  const DATA_GRID_HEIGHT = '65vh';

  const GetReviewPanels = () => [
    { id: 'P400', name: 'Stargazers' },
    { id: 'P500', name: 'Buttons' },
    { id: 'P600', name: 'Nashrakra' }
  ];

  React.useEffect(() => {
    setFetchList(!fetchList);
  }, []);

  React.useEffect(() => {
    const fetchData = () => {
      const response = GetReviewPanels();
      setData(response);
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
            />
          </div>
        )}
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
    </>
  );
}

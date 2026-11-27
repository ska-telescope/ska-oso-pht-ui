import React from 'react';
import { DataGrid, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Typography, Grid } from '@mui/material';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { Panel } from '@/utils/types/panel';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { generatePanels, listPanels } from '@/services/api/panels';
import { PAGE_OBSERVATION_UPDATE } from '@/utils/constants';

interface GridReviewPanelsProps {
  height?: string;
  listOnly?: boolean;
  onRowClick: (row: any) => void;
}

export default function GridReviewPanels({
  height = '100%',
  listOnly = false,
  onRowClick
}: GridReviewPanelsProps) {
  const { t } = useScopedTranslation();
  const [data, setData] = React.useState<Panel[]>([]);
  const [createList, setCreateList] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);

  // The panels, or undefined when they can't be fetched
  const GetReviewPanels = async () => (await listPanels()).data;

  React.useEffect(() => {
    setFetchList(!fetchList);
  }, []);

  React.useEffect(() => {
    const autoGeneratePanels = async () => {
      await generatePanels();
      setFetchList(!fetchList);
    };
    if (createList) {
      autoGeneratePanels();
    }
  }, [createList]);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await GetReviewPanels();
      if (response) {
        if (response.length > 0) {
          setData(response);
        } else {
          setCreateList(!createList);
        }
      }
    };
    fetchData();
  }, [fetchList]);

  const colTitle = {
    field: 'title',
    flex: 2,
    minWidth: 250,
    renderHeader: () => {
      return listOnly ? (
        <Typography
          variant="h6"
          sx={{
            minHeight: '4vh',
            paddingTop: 1
          }}
        >
          {t('panels.label')}
        </Typography>
      ) : (
        t('panels.name')
      );
    },
    renderCell: (e: any) => e.row.name
  };

  const stdColumns = [...[colTitle]];

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

  function filteredData(panels: Panel[]): Panel[] {
    return [...panels].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <>
      {!listOnly && <Grid>{renderProposalsSectionTitle()}</Grid>}

      <Grid>
        {(!data || data.length === 0) && (
          <Alert
            color={AlertColorTypes.Info}
            text={t('page.' + PAGE_OBSERVATION_UPDATE + '.empty')}
            testId="helpPanelId"
          />
        )}
        {data.length > 0 && (
          <>
            <DataGrid
              maxHeight={height}
              testId="dataGridId"
              rows={filteredData(data)}
              columns={stdColumns}
              height={height}
              hideFooter={data.length <= 5}
              onRowClick={(e: any) => onRowClick(e.row)}
            />
          </>
        )}
      </Grid>
    </>
  );
}

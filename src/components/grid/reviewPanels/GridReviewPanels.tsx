import React from 'react';
import { DataGrid, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Typography, Grid } from '@mui/material';
import GetPanelList from '@services/axios/get/getPanelList/getPanelList';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { Panel } from '@/utils/types/panel';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import PostPanelGenerate from '@/services/axios/post/postPanelGenerate/postPanelGenerate';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { PAGE_OBSERVATION_UPDATE } from '@/utils/constants';

interface GridReviewPanelsProps {
  height?: string;
  listOnly?: boolean;
  onRowClick: (row: any) => void;
  // updatedData: Panel | null;
}

export default function GridReviewPanels({
  height = '100%',
  listOnly = false,
  onRowClick
}: GridReviewPanelsProps) {
  const { t } = useScopedTranslation();
  const authClient = useAxiosAuthClient();
  const [data, setData] = React.useState<Panel[]>([]);
  const [createList, setCreateList] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);
  const [, setAxiosError] = React.useState('');
  const { osdCycleDescription } = useOSDAccessors();

  const GetReviewPanels = async () => {
    const response = await GetPanelList(authClient);
    if (typeof response === 'string') {
      setAxiosError(response);
    } else {
      return response;
    }
  };

  React.useEffect(() => {
    setFetchList(!fetchList);
  }, []);

  React.useEffect(() => {
    const autoGeneratePanels = async () => {
      await PostPanelGenerate(authClient, osdCycleDescription);
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
        const panels = (response as unknown) as Panel[];
        if (panels?.length > 0) {
          setData(panels);
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
        <Typography sx={{ paddingTop: 1 }} variant="h6" minHeight="4vh">
          {t('panels.label')}
        </Typography>
      ) : (
        t('panels.name')
      );
    },
    renderCell: (e: any) => e.row.name
  };

  const stdColumns = [...[colTitle]];

  const ProposalsSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh" textAlign={'left'}>
      {t('proposals.label')}
    </Typography>
  );

  function filteredData(panels: Panel[]): Panel[] {
    return [...panels].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <>
      {!listOnly && <Grid>{ProposalsSectionTitle()}</Grid>}

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

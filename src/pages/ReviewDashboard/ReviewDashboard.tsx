import { useNavigate } from 'react-router-dom';
import { Card, CardActionArea, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { ReactElement, JSXElementConstructor, ReactNode } from 'react';
import { PATH, PMT } from '@/utils/constants';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import GridProposals from '@/components/grid/proposals/GridProposals';
import GridReviewers from '@/components/grid/reviewers/GridReviewers';

const MIN_CARD_WIDTH = 300;
const MIN_CARD_HEIGHT = 200;

export default function ReviewDashboard() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const onPanelClick = (thePath: string) => {
    if (thePath?.length > 0) {
      navigate(thePath);
    }
  };

  const panel = (
    title: string,
    toolTip: string,
    nav: string,
    content:
      | string
      | number
      | boolean
      | ReactElement<any, string | JSXElementConstructor<any>>
      | Iterable<ReactNode>
      | null
      | undefined
  ) => {
    return (
      <Grid2>
        <Tooltip title={toolTip} arrow>
          <Card sx={{ minWidth: MIN_CARD_WIDTH, minHeight: MIN_CARD_HEIGHT, padding: 2 }}>
            <CardHeader
              action={
                <IconButton aria-label="settings">
                  <ViewIcon onClick={() => onPanelClick(nav)} />
                </IconButton>
              }
              title={t(title)}
            />
            {content}{' '}
          </Card>
        </Tooltip>
      </Grid2>
    );
  };

  return (
    <Grid2 container p={5} direction="row" alignItems="center" justifyContent="space-around">
      {panel('menuOptions.panelSummary', 'tooltip', PMT[0], null)}
      {panel('menuOptions.reviews', 'tooltip', PMT[1], <GridReviewers listOnly />)}
      {panel('menuOptions.proposals', 'tooltip', PATH[0], <GridProposals listOnly />)}
    </Grid2>
  );
}

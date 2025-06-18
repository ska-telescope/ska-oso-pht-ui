import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, IconButton, Paper, Tooltip } from '@mui/material';
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
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';

const MIN_CARD_WIDTH = 300;
const CARD_HEIGHT = '37vh';
const CONTENT_HEIGHT = `calc(${CARD_HEIGHT} - 140px)`;

export default function ReviewDashboard() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const theme = useTheme();

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
      <Grid2 m={2}>
        <Tooltip title={toolTip} arrow>
          <Card sx={{ minWidth: MIN_CARD_WIDTH, height: CARD_HEIGHT }}>
            <CardHeader
              action={
                <IconButton aria-label="settings">
                  <ViewIcon onClick={() => onPanelClick(nav)} />
                </IconButton>
              }
              title={t(title)}
            />
            <CardContent>
              <Paper style={{ maxHeight: CONTENT_HEIGHT, overflow: 'auto' }} elevation={0}>
                {content}
              </Paper>
            </CardContent>
          </Card>
        </Tooltip>
      </Grid2>
    );
  };

  const panelButton = (title: string, toolTip: string, nav: string) => {
    return (
      <Grid2 m={2}>
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
  };

  return (
    <>
      <PageBannerPMT hideOverviewButton title={t('menuOptions.overview')} />
      <Grid2 container p={5} direction="row" alignItems="center" justifyContent="space-around">
        {panelButton('menuOptions.panelSummary', 'panels.overviewTooltip', PMT[0])}
        {panelButton('menuOptions.reviews', 'reviewers.overviewTooltip', PMT[1])}
        {panelButton('menuOptions.proposals', 'proposals.overviewTooltip', PATH[0])}
      </Grid2>

      {/* USE THE GRID BELOW FOR METRICS  */}
      <Grid2 container p={5} direction="row" alignItems="center" justifyContent="space-around">
        {panel(
          'menuOptions.panelSummary',
          t('panels.overviewTooltip'),
          PMT[0],
          <GridReviewPanels height={CONTENT_HEIGHT} listOnly />
        )}
        {panel(
          'menuOptions.reviews',
          t('reviewers.overviewTooltip'),
          PMT[1],
          <GridReviewers height={CONTENT_HEIGHT} listOnly />
        )}
        {panel(
          'menuOptions.proposals',
          t('proposals.overviewTooltip'),
          PATH[0],
          <GridProposals height={CONTENT_HEIGHT} listOnly />
        )}
      </Grid2>
    </>
  );
}

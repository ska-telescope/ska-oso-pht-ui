import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Grid2, Tab, Tabs, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { BANNER_PMT_SPACER, PMT, REVIEWER_STATUS } from '../../utils/constants';
import BackButton from '@/components/button/Back/Back';
import GridProposals from '@/components/grid/proposals/GridProposals';
import GridReviewers from '@/components/grid/reviewers/GridReviewers';
import { Panel } from '@/utils/types/panel';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import GridReviewPanels from '@/components/grid/reviewPanels/GridReviewPanels';
import { PanelReviewer } from '@/utils/types/panelReviewer';
import PlusIcon from '@/components/icon/plusIcon/plusIcon';
import { PanelProposal } from '@/utils/types/panelProposal';
import Proposal from '@/utils/types/proposal';
import Reviewer from '@/utils/types/reviewer';
import { IdObject } from '@/utils/types/idObject';
import PostPanel from '@/services/axios/postPanel/postPanel';
import PageFooterPMT from '@/components/layout/pageFooterPMT/PageFooterPMT';
import ObservatoryData from '@/utils/types/observatoryData';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';

const PANELS_HEIGHT = '66vh';
const TABS_HEIGHT = '68vh';
const TABS_CONTAINER_HEIGHT = '62vh';
const TAB_GRID_HEIGHT = '44vh';

export const addReviewerPanel = (
  reviewer: Reviewer,
  localPanel: Panel,
  setReviewerPanels: (reviewers: PanelReviewer[]) => void
) => {
  const rec: PanelReviewer = {
    reviewerId: reviewer.id,
    panelId: localPanel?.id ?? '',
    // assignedOn: new Date().toISOString(), // TODO clarify if assignedOn should be set in the database
    status: REVIEWER_STATUS.PENDING
  };
  const updatedReviewers = [...localPanel?.reviewers, rec];
  setReviewerPanels(updatedReviewers);
};

export const deleteReviewerPanel = (
  reviewer: Reviewer,
  localPanel: Panel,
  setReviewerPanels: Function
) => {
  function filterRecords(id: string) {
    return localPanel?.reviewers?.filter(item => !(item.reviewerId === id));
  }
  const filtered = filterRecords(reviewer.id);
  setReviewerPanels(filtered);
};

export const convertPanelProposalToProposalIdList = (
  panelProposals: PanelProposal[]
): IdObject[] => {
  return panelProposals.map(panelProposal => ({
    id: panelProposal.proposalId
  }));
};

export const convertPanelReviewerToReviewerIdList = (
  panelReviewers: PanelReviewer[]
): IdObject[] => {
  return panelReviewers.map(panelReviewer => ({
    id: panelReviewer.reviewerId
  }));
};

export const addProposalPanel = (
  proposal: Proposal,
  localPanel: Panel,
  setProposalPanels: (proposals: PanelProposal[]) => void
) => {
  const rec: PanelProposal = {
    proposalId: proposal.id,
    panelId: localPanel?.id ?? ''
    // TODO clarify if assignedOn should be set in the database
    // assignedOn: new Date().toISOString()
  };
  const updatedProposals = [...localPanel?.proposals, rec];
  setProposalPanels(updatedProposals);
};

export const deleteProposalPanel = (
  proposal: Proposal,
  localPanel: Panel,
  setProposalPanels: Function
) => {
  function filterRecords(id: string) {
    return localPanel?.proposals?.filter(item => !(item.proposalId === id));
  }
  const filtered = filterRecords(proposal.id);
  setProposalPanels(filtered);
};

export default function PanelMaintenance() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const theme = useTheme();

  const [theValue, setTheValue] = React.useState(0);
  const [currentPanel, setCurrentPanel] = React.useState<Panel | null>(null);
  const [panelProposals, setPanelProposals] = React.useState<IdObject[]>([]);
  const [panelReviewers, setPanelReviewers] = React.useState<IdObject[]>([]);
  const [, setAxiosError] = React.useState('');
  const { application } = storageObject.useStore();
  const authClient = useAxiosAuthClient();

  const getObservatoryData = () => application.content3 as ObservatoryData;
  const getCycleId = () => getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId;

  React.useEffect(() => {
    const proposals = currentPanel?.proposals
      ? convertPanelProposalToProposalIdList(currentPanel?.proposals)
      : [];
    setPanelProposals(proposals);
  }, [currentPanel]);

  React.useEffect(() => {
    const reviewers = currentPanel?.reviewers
      ? convertPanelReviewerToReviewerIdList(currentPanel?.reviewers)
      : [];
    setPanelReviewers(reviewers);
  }, [currentPanel]);

  const handlePanelChange = (row: Panel) => {
    setCurrentPanel(row);
  };

  const handleReviewersChange = (reviewersList: PanelReviewer[]) => {
    // Update the current panel's reviewers with the new list
    setCurrentPanel(prevPanel => {
      if (!prevPanel) return prevPanel;
      const updatedPanel = {
        ...prevPanel,
        reviewers: reviewersList
      };
      // Save the updated panel to the backend
      savePanel(updatedPanel);
      // Update the state with the new panel
      return updatedPanel;
    });
  };

  async function savePanel(panel: Panel): Promise<string | { error: string }> {
    const response = await PostPanel(authClient, panel, getCycleId());
    if (typeof response === 'object' && response?.error) {
      // TODO notify user of error
      setAxiosError(
        typeof response === 'object' && 'error' in response ? response.error : String(response)
      );
    } else {
      // TODO notify user of success
    }
    return response;
  }

  const handleProposalsChange = (proposalsList: PanelProposal[]) => {
    // Update the current panel's proposals with the new list
    setCurrentPanel(prevPanel => {
      if (!prevPanel) {
        return prevPanel;
      }
      const updatedPanel = {
        ...prevPanel,
        proposals: proposalsList
      };
      // Save the updated panel to the backend
      savePanel(updatedPanel);
      // Update the state with the new panel
      return updatedPanel;
    });
  };

  const proposalSelectedToggle = (proposal: Proposal, isSelected: boolean) => {
    if (isSelected) {
      deleteProposalPanel(proposal, currentPanel as Panel, handleProposalsChange);
    } else {
      addProposalPanel(proposal, currentPanel as Panel, handleProposalsChange);
    }
  };

  const reviewerSelectedToggle = (reviewer: Reviewer, isSelected: boolean) => {
    if (isSelected) {
      deleteReviewerPanel(reviewer, currentPanel as Panel, handleReviewersChange);
    } else {
      addReviewerPanel(reviewer, currentPanel as Panel, handleReviewersChange);
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTheValue(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  const panelsSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh">
      {t('panels.label')}
    </Typography>
  );

  const backButton = () => (
    <BackButton
      action={() => navigate(PMT[2])}
      testId="overviewButtonTestId"
      title={'overview.title'}
      toolTip="overview.toolTip"
    />
  );

  const addPanelIcon = () => <PlusIcon onClick={() => navigate(PMT[3])} />;

  return (
    <>
      <PageBannerPMT title={t('page.15.desc')} backBtn={backButton()} />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
      <Grid2
        container
        pr={2}
        spacing={3}
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Grid2 p={2} size={{ sm: 12, md: 6, lg: 4 }}>
          <Box
            sx={{
              width: '100%',
              border: '1px solid lightGrey',
              borderRadius: '16px'
            }}
            minHeight="50vh"
          >
            <Grid2
              sx={{ borderBottom: '1px solid lightGrey' }}
              pl={1}
              pr={1}
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid2 pt={2}>{panelsSectionTitle()}</Grid2>
              <Grid2>{addPanelIcon()}</Grid2>
            </Grid2>
            <GridReviewPanels
              height={PANELS_HEIGHT}
              listOnly
              onRowClick={row => handlePanelChange(row)}
              updatedData={currentPanel}
            />
          </Box>
        </Grid2>

        <Grid2
          size={{ sm: 12, md: 6, lg: 8 }}
          pt={2}
          container
          direction="row"
          justifyContent="space-around"
          alignItems="flex-start"
        >
          <Box
            sx={{
              height: TABS_HEIGHT,
              width: '100%'
            }}
          >
            <Box pt={2}>
              <Tabs
                variant="fullWidth"
                textColor="secondary"
                indicatorColor="secondary"
                value={theValue}
                onChange={handleChange}
                aria-label="basic tabs example"
                sx={{
                  '& button': { backgroundColor: theme.palette.primary.main },
                  '& button.Mui-selected': { backgroundColor: 'transparent' }
                }}
              >
                <Tab label={t('reviewers.label')} {...a11yProps(0)} />
                <Tab label={t('proposals.label')} {...a11yProps(1)} />
              </Tabs>
            </Box>
            <Box
              p={2}
              sx={{
                width: '100%',
                height: TABS_CONTAINER_HEIGHT
              }}
            >
              {theValue === 0 && (
                <GridReviewers
                  height={TAB_GRID_HEIGHT}
                  showSearch
                  showSelection={!!currentPanel}
                  selectedReviewers={panelReviewers}
                  tickBoxClicked={(reviewer, isReviewerSelected) => {
                    reviewerSelectedToggle(reviewer, isReviewerSelected);
                  }}
                />
              )}
              {theValue === 1 && (
                <GridProposals
                  height={TAB_GRID_HEIGHT}
                  showSearch
                  showSelection={!!currentPanel}
                  selectedProposals={panelProposals}
                  tickBoxClicked={(proposal, isProposalSelected) => {
                    proposalSelectedToggle(proposal, isProposalSelected);
                  }}
                />
              )}
            </Box>
          </Box>
        </Grid2>
      </Grid2>
      <PageFooterPMT />
    </>
  );
}

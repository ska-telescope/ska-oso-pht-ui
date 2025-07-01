import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Grid2, Tab, Tabs, Typography } from '@mui/material';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { PMT } from '../../utils/constants';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
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

const REVIEWER_HEIGHT = '65vh';
const TABS_HEIGHT = '72vh';
const TABS_CONTENT_HEIGHT = '67vh';
const TAB_GRID_HEIGHT = '51vh';

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
  const [theValue, setTheValue] = React.useState(0);
  const [currentPanel, setCurrentPanel] = React.useState<Panel | null>(null);

  const handlePanelChange = (row: Panel) => {
    setCurrentPanel(row);
  };

  const handleReviewersChange = (reviewersList: PanelReviewer[]) => {
    // Update the current panel's reviewers with the new list
    setCurrentPanel(prevPanel => {
      if (!prevPanel) return prevPanel;
      return {
        ...prevPanel,
        reviewers: reviewersList
      };
    });
  };

  const handleProposalsChange = (proposalsList: PanelProposal[]) => {
    // Update the current panel's proposals with the new list
    setCurrentPanel(prevPanel => {
      if (!prevPanel) return prevPanel;
      return {
        ...prevPanel,
        proposals: proposalsList
      };
    });
  };

  const proposalSelectedToggle = (proposal: Proposal, isSelected: boolean) => {
    if (isSelected) {
      deleteProposalPanel(proposal, currentPanel as Panel, handleProposalsChange);
    } else {
      addProposalPanel(proposal, currentPanel as Panel, handleProposalsChange);
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
      title={'overview.label'}
      toolTip="overview.toolTip"
    />
  );

  const addPanelIcon = () => <PlusIcon onClick={() => navigate(PMT[3])} />;

  return (
    <>
      <PageBannerPMT title={t('page.15.desc')} backBtn={backButton()} />
      <Grid2
        container
        pl={2}
        pr={2}
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Grid2 p={2} size={{ sm: 12, md: 6, lg: 3 }}>
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
              container
              direction="row"
              justifyContent="space-around"
              alignItems="center"
            >
              <Grid2 mr={30} pt={2}>
                {panelsSectionTitle()}
              </Grid2>
              <Grid2>{addPanelIcon()}</Grid2>
            </Grid2>
            <GridReviewPanels
              height={REVIEWER_HEIGHT}
              listOnly
              onRowClick={row => handlePanelChange(row)}
              updatedData={currentPanel}
            />
          </Box>
        </Grid2>

        <Grid2
          p={2}
          size={{ sm: 12, md: 6, lg: 9 }}
          container
          direction="row"
          justifyContent="space-around"
          alignItems="flex-start"
        >
          {currentPanel && (
            <Box sx={{ border: 'none', height: TABS_HEIGHT, width: '90%' }}>
              <Box>
                <Tabs
                  variant="fullWidth"
                  textColor="secondary"
                  indicatorColor="secondary"
                  value={theValue}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab label={t('reviewers.label')} {...a11yProps(0)} />
                  <Tab label={t('proposals.label')} {...a11yProps(1)} />
                </Tabs>
              </Box>
              <Box
                p={2}
                sx={{
                  width: '100%',
                  height: TABS_CONTENT_HEIGHT,
                  border: '1px solid lightgrey',
                  borderBottomLeftRadius: '16px',
                  borderBottomRightRadius: '16px'
                }}
              >
                {theValue === 0 && (
                  <GridReviewers
                    currentPanel={currentPanel}
                    height={TAB_GRID_HEIGHT}
                    showSearch
                    onChange={item => handleReviewersChange(item)}
                  />
                )}
                {theValue === 1 && (
                  <GridProposals
                    showSearch
                    showSelection
                    tickBoxClicked={(proposal, isProposalSelected) => {
                      proposalSelectedToggle(proposal, isProposalSelected);
                    }}
                  />
                )}
              </Box>
            </Box>
          )}
          {!currentPanel && (
            <Box sx={{ width: '90%' }}>
              <Alert
                color={AlertColorTypes.Info}
                text={t('panels.notSelected')}
                testId="helpPanelId"
              />
            </Box>
          )}
        </Grid2>
      </Grid2>
    </>
  );
}

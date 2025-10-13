import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { BANNER_PMT_SPACER_MIN, PMT, REVIEWER_STATUS } from '../../utils/constants';
import BackButton from '@/components/button/Back/Back';
import GridProposals from '@/components/grid/proposals/GridProposals';
import GridReviewers from '@/components/grid/reviewers/GridReviewers';
import { Panel } from '@/utils/types/panel';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import GridReviewPanels from '@/components/grid/reviewPanels/GridReviewPanels';
import { PanelReviewer } from '@/utils/types/panelReviewer';
import { PanelProposal } from '@/utils/types/panelProposal';
import Proposal from '@/utils/types/proposal';
import { Reviewer } from '@/utils/types/reviewer';
import { IdObject } from '@/utils/types/idObject';
import PageFooterPMT from '@/components/layout/pageFooterPMT/PageFooterPMT';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import PutPanel from '@/services/axios/put/putPanel/putPanel';
import AssignButton from '@/components/button/Assign/Assign';
import PostPanelGenerate from '@/services/axios/post/postPanelGenerate/postPanelGenerate';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { items } from 'happy-dom/lib/PropertySymbol.d.ts.js';

const PANELS_HEIGHT = '74vh';
const TABS_HEIGHT = '76vh';
const TABS_CONTAINER_HEIGHT = '70vh';
const TAB_GRID_HEIGHT = '52vh';

export const addReviewerPanel = (
  reviewer: Reviewer,
  localPanel: Panel,
  setReviewerPanels: (sciReviewers: PanelReviewer[], tecReviewers: PanelReviewer[]) => void
) => {
  console.log('reviewer check ', reviewer);
  const rec: PanelReviewer = {
    reviewType: reviewer.reviewType,
    reviewerId: reviewer.id,
    panelId: localPanel?.id ?? '',
    status: REVIEWER_STATUS.PENDING
  };

  const updatedSciReviewers = reviewer.reviewType === 'science'
    ? [...localPanel?.sciReviewers, rec]
    : localPanel?.sciReviewers;
  const updatedTecReviewers = reviewer.reviewType === 'technical'
    ? [...localPanel?.tecReviewers, rec]
    : localPanel?.tecReviewers;
  setReviewerPanels(updatedSciReviewers, updatedTecReviewers);
};

export const deleteReviewerPanel = (
  reviewer: Reviewer,
  localPanel: Panel,
  setReviewerPanels: Function
) => {
  console.log('reviewer delete ', reviewer);

  function filterSciRecords(id: string) {
    console.log('science reviewers', localPanel?.sciReviewers);
    console.log('id check ', id);
    console.log('local panel check', localPanel?.sciReviewers);
    return localPanel?.sciReviewers?.filter(item => {
      console.log('Filtering sciReviewers, current reviewerId:', item.reviewerId);
      return !(item.reviewerId === id);
    });
  }
  function filterTecRecords(id: string) {
    return localPanel?.tecReviewers?.filter(item => !(item.reviewerId === id));
  }
  const sciFiltered = filterSciRecords(reviewer.id);
  const tecFiltered = filterTecRecords(reviewer.id);

  console.log('sciFiltered ', sciFiltered);
  setReviewerPanels(sciFiltered, tecFiltered);
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
  console.log('panelReviewers ', panelReviewers);
  //reviewer per id
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
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [theValue, setTheValue] = React.useState(0);
  const [currentPanel, setCurrentPanel] = React.useState<Panel | null>(null);
  const [panelProposals, setPanelProposals] = React.useState<IdObject[]>([]);
  const [panelReviewers, setPanelReviewers] = React.useState<IdObject[]>([]);
  const [makeAssignment, setMakeAssignment] = React.useState(false);
  const authClient = useAxiosAuthClient();
  const { osdCycleDescription, osdCycleId } = useOSDAccessors();

  React.useEffect(() => {
    const autoGeneratePanels = async () => {
      await PostPanelGenerate(authClient, osdCycleDescription);
    };
    if (makeAssignment) {
      autoGeneratePanels();
      setMakeAssignment(false);
      setCurrentPanel(null);
    }
  }, [makeAssignment]);

  React.useEffect(() => {
    const proposals = currentPanel?.proposals
      ? convertPanelProposalToProposalIdList(currentPanel?.proposals)
      : [];
    setPanelProposals(proposals);

    const sciReviewers = currentPanel?.sciReviewers
      ? convertPanelReviewerToReviewerIdList(currentPanel?.sciReviewers)
      : [];
    const tecReviewers = currentPanel?.tecReviewers
      ? convertPanelReviewerToReviewerIdList(currentPanel?.tecReviewers)
      : [];
    console.log('sci reviewers', sciReviewers);
    console.log('tec reviewers ', tecReviewers);
    setPanelReviewers([...sciReviewers, ...tecReviewers]);
  }, [currentPanel]);

  const handlePanelChange = (row: Panel) => {
    setCurrentPanel(row);
  };

  const handleReviewersChange = (sciReviewers: PanelReviewer[], tecReviewers: PanelReviewer[]) => {
    console.log('sciReviewers ', sciReviewers);
    console.log('tecReviewers ', tecReviewers);

    setCurrentPanel(prevPanel => {
      if (!prevPanel) return prevPanel;
      const updatedPanel = {
        ...prevPanel,
        sciReviewers: sciReviewers,
        tecReviewers: tecReviewers
      };
      // Save the updated panel to the backend
      savePanel(updatedPanel);
      // Update the state with the new panel
      return updatedPanel;
    });
  };

  async function savePanel(panel: Panel): Promise<string | { error: string }> {
    const response = await PutPanel(authClient, panel, osdCycleId);
    if (typeof response === 'object' && response?.error) {
      // TODO
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
      // proposalForUpdate = undefined; // TODO : What happens if you unassign a proposal from a panel ?
      deleteProposalPanel(proposal, currentPanel as Panel, handleProposalsChange);
    } else {
      // proposalForUpdate = proposal;
      addProposalPanel(proposal, currentPanel as Panel, handleProposalsChange);
    }
  };

  const reviewerSelectedToggle = (reviewer: Reviewer, isSelected: boolean) => {
    console.log('selected reviewer ', reviewer);
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

  const fwdButton = () => <AssignButton action={() => setMakeAssignment(true)} />;

  return (
    <>
      <PageBannerPMT title={t('page.15.desc')} backBtn={backButton()} fwdBtn={fwdButton()} />
      <Spacer size={BANNER_PMT_SPACER_MIN} axis={SPACER_VERTICAL} />
      <Grid
        container
        pr={2}
        spacing={3}
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Grid p={2} size={{ sm: 12, md: 4, lg: 2.75 }}>
          <Box
            sx={{
              width: '100%',
              border: '1px solid lightGrey',
              borderRadius: '16px'
            }}
            minHeight="50vh"
          >
            <Grid
              sx={{ borderBottom: '1px solid lightGrey' }}
              pl={1}
              pr={1}
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid pt={2}>{panelsSectionTitle()}</Grid>
            </Grid>
            <GridReviewPanels
              height={PANELS_HEIGHT}
              listOnly
              onRowClick={row => handlePanelChange(row)}
              // updatedData={currentPanel}
            />
          </Box>
        </Grid>

        <Grid
          size={{ sm: 12, md: 8, lg: 9.25 }}
          pt={1}
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
                  '& button': { height: 75, backgroundColor: theme.palette.primary.main },
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
        </Grid>
      </Grid>
      <PageFooterPMT />
    </>
  );
}

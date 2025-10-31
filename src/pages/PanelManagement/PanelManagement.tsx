import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import {
  BANNER_PMT_SPACER_MIN,
  FOOTER_PMT_SPACER,
  PMT,
  REVIEWER_STATUS
} from '../../utils/constants';
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
import PostPanelAssignments from '@/services/axios/post/postPanelAssignments/postPanelAssignments';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

const TAB_HEADER_HEIGHT = 55;
const GAP = 5;

export const addReviewerPanel = (
  reviewer: Reviewer,
  localPanel: Panel,
  setReviewerPanels: (sciReviewers: PanelReviewer[], tecReviewers: PanelReviewer[]) => void
) => {
  const rec: PanelReviewer = {
    reviewerId: reviewer.id.replace(/-(science|technical)$/, ''),
    panelId: localPanel?.id ?? '',
    status: REVIEWER_STATUS.PENDING
  };

  const isScience = (str: string): boolean => str.endsWith('-science');
  const isTechnical = (str: string): boolean => str.endsWith('-technical');

  const updatedSciReviewers = isScience(reviewer.id)
    ? [...localPanel?.sciReviewers, rec]
    : localPanel?.sciReviewers;
  const updatedTecReviewers = isTechnical(reviewer.id)
    ? [...localPanel?.tecReviewers, rec]
    : localPanel?.tecReviewers;
  setReviewerPanels(updatedSciReviewers, updatedTecReviewers);
};

export const deleteReviewerPanel = (
  reviewer: Reviewer,
  localPanel: Panel,
  setReviewerPanels: Function
) => {
  function filterSciRecords(id: string) {
    const stripped = id.replace('-science', '');
    return localPanel?.sciReviewers?.filter(item => !(item.reviewerId === stripped));
  }
  function filterTecRecords(id: string) {
    const stripped = id.replace('-technical', '');
    return localPanel?.tecReviewers?.filter(item => !(item.reviewerId === stripped));
  }
  const sciFiltered = filterSciRecords(reviewer.id);
  const tecFiltered = filterTecRecords(reviewer.id);
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

export default function PanelManagement() {
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

  /*------------------------------------------------------------------*/

  const boxRefPanel = React.useRef<HTMLDivElement>(null);
  const [boxHeightPanel, setBoxHeightPanel] = React.useState<number | undefined>(undefined);
  React.useLayoutEffect(() => {
    const updateHeightPanel = () => {
      if (boxRefPanel.current) {
        setBoxHeightPanel(boxRefPanel.current.offsetHeight);
      }
    };
    updateHeightPanel();
    window.addEventListener('resize', updateHeightPanel);
    return () => {
      window.removeEventListener('resize', updateHeightPanel);
    };
  }, []);

  /*------------------------------------------------------------------*/

  React.useEffect(() => {
    const autoAssignments = async () => {
      await PostPanelAssignments(authClient, osdCycleDescription);
    };
    if (makeAssignment) {
      autoAssignments();
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
    setPanelReviewers([
      ...sciReviewers.map(reviewer => ({ id: reviewer.id + '-science' })),
      ...tecReviewers.map(reviewer => ({ id: reviewer.id + '-technical' }))
    ]);
  }, [currentPanel]);

  const handlePanelChange = (row: Panel) => {
    setCurrentPanel(row);
  };

  const handleReviewersChange = (sciReviewers: PanelReviewer[], tecReviewers: PanelReviewer[]) => {
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
    <Box sx={{ height: '91vh', display: 'flex', flexDirection: 'column' }}>
      <PageBannerPMT title={t('page.15.desc')} backBtn={backButton()} fwdBtn={fwdButton()} />
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0
        }}
      >
        <Spacer size={BANNER_PMT_SPACER_MIN} axis={{ SPACER_VERTICAL }} />
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={GAP}
          m={GAP}
          sx={{ flexGrow: 1 }}
        >
          <Grid size={{ sm: 12, md: 4, lg: 2.75 }} sx={{ height: '100%' }}>
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: '#ccc',
                borderRadius: '8px'
              }}
              ref={boxRefPanel}
            >
              <GridReviewPanels
                height={String(boxHeightPanel) ?? '100%'}
                listOnly
                onRowClick={row => handlePanelChange(row)}
              />
            </Box>
          </Grid>

          <Grid
            size={{ sm: 12, md: 8, lg: 9.25 }}
            sx={{ height: '100%' }}
            container
            direction="row"
            justifyContent="space-around"
            alignItems="flex-start"
          >
            <Box sx={{ height: '100%', width: '100%' }}>
              <Tabs
                variant="fullWidth"
                textColor="secondary"
                indicatorColor="secondary"
                value={theValue}
                onChange={handleChange}
                aria-label="basic tabs example"
                sx={{
                  '& button': {
                    height: TAB_HEADER_HEIGHT,
                    backgroundColor: theme.palette.primary.main
                  },
                  '& button.Mui-selected': { backgroundColor: 'transparent' }
                }}
              >
                <Tab label={t('reviewers.label')} {...a11yProps(0)} />
                <Tab label={t('proposals.label')} {...a11yProps(1)} />
              </Tabs>
              <Box
                sx={{
                  width: '100%',
                  height: `calc(100% - ${TAB_HEADER_HEIGHT}px)`
                }}
              >
                {theValue === 0 && (
                  <GridReviewers
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
        <Spacer size={FOOTER_PMT_SPACER} axis={{ SPACER_VERTICAL }} />
      </Box>
      <PageFooterPMT />
    </Box>
  );
}

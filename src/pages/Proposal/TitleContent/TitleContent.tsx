/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import React from 'react';
import { Avatar, Card, CardHeader, Grid, Tooltip, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { TextEntry } from '@ska-telescope/ska-gui-components';

const MAX_TITLE_LENGTH = 50;

const Projects = [
  {
    id: 1,
    title: 'Standard Proposal',
    code: 'PI',
    description: 'Standard Observing Proposal',
    subProjects: [
      {
        id: 1,
        title: 'Target of opportunity',
        code: 'ToO',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 2,
        title: 'Joint SKA proposal',
        code: 'JTP',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 3,
        title: 'Coordinated Proposal',
        code: 'CP',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      },
      {
        id: 4,
        title: 'Long term proposal',
        code: 'LTP',
        description: 'A proposal that spans multiple PROPOSAL CYCLES'
      }
    ]
  },
  {
    id: 2,
    title: 'Key Science Project',
    code: 'KSP',
    description:
      'A large project that requires observing time allocations over a period longer than one cycle. This differs from a LTP as KSPs require a lot of observing time whereas LTPs typically need small amounts of time spread over more than one cycle',
    subProjects: [
      {
        id: 5,
        title: 'Target of opportunity',
        code: 'ToO',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 6,
        title: 'Joint SKA proposal',
        code: 'JTP',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 7,
        title: 'Coordinated Proposal',
        code: 'CP',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      },
      {
        id: 8,
        title: 'Long term proposal',
        code: 'LTP',
        description: 'A proposal that spans multiple PROPOSAL CYCLES'
      }
    ]
  },
  {
    id: 3,
    title: "Director's Discretionary Time Proposal",
    code: 'DDT',
    description:
      "Director's discretionary time proposal. It does not follow the normal proposal submission policies. It only requires approval from DG.",
    subProjects: [
      {
        id: 9,
        title: 'Target of opportunity',
        code: 'ToO',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 10,
        title: 'Joint SKA proposal',
        code: 'JTP',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 11,
        title: 'Coordinated Proposal',
        code: 'CP',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      }
    ]
  }
];

export default function TitleContent() {
  const theme = useTheme();

  const emptyProposal = {
    id: 0,
    title: '',
    code: '',
    description: '',
    subProjects: [
      {
        id: 0,
        title: '',
        code: '',
        description: ''
      }
    ]
  };

  const emptySubProposal = {
    id: 0,
    title: '',
    code: '',
    description: ''
  };

  const [theTitle, setTheTitle] = React.useState('');
  const [theProposal, setTheProposal] = React.useState(emptyProposal);
  const [theSubProposal, setTheSubProposal] = React.useState(emptySubProposal);

  function clickProposal(PROPOSAL: any) {
    setTheProposal(PROPOSAL);
  }
  function clickSubProposal(PROPOSAL: any) {
    setTheSubProposal(PROPOSAL);
  }

  const validateTheTitle = (e: string) => setTheTitle(e.substring(0, MAX_TITLE_LENGTH));

  const setCardBG = (in1: any, in2: any) =>
    in1 && in1 === in2 ? theme.palette.secondary.main : theme.palette.primary.main;
  const setCardFG = (in1: any, in2: any) =>
    in1 && in1 === in2 ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText;

  function ProposalType(PROPOSAL: any) {
    return (
      <Grid item>
        <Card
          style={{
            color: setCardFG(theProposal, PROPOSAL),
            backgroundColor: setCardBG(theProposal, PROPOSAL)
          }}
          onClick={() => clickProposal(PROPOSAL)}
          variant="outlined"
        >
          <CardHeader
            avatar={(
              <Avatar
                variant="rounded"
                style={{
                  color: setCardBG(theProposal, PROPOSAL),
                  backgroundColor: setCardFG(theProposal, PROPOSAL)
                }}
              >
                <Typography variant="body2" component="div">
                  {PROPOSAL.code}
                </Typography>
              </Avatar>
            )}
            title={(
              <Typography variant="h6" component="div">
                <Tooltip title={PROPOSAL.description} arrow>
                  <Typography>{PROPOSAL.title}</Typography>
                </Tooltip>
              </Typography>
            )}
          />
          {/* <CardContent>
            <Tooltip title={PROPOSAL.description} arrow>
              <Typography variant="caption" component="div">
                {PROPOSAL.description}
              </Typography>
            </Tooltip>
          </CardContent> */}
        </Card>
      </Grid>
    );
  }

  function ProposalSubType(PROPOSAL: any) {
    return (
      <Grid item xs={12} sm={6} md={3}>
        <Card
          style={{
            color: setCardFG(theSubProposal, PROPOSAL),
            backgroundColor: setCardBG(theSubProposal, PROPOSAL)
          }}
          onClick={() => clickSubProposal(PROPOSAL)}
          variant="outlined"
        >
          <CardHeader
            avatar={(
              <Avatar
                variant="rounded"
                style={{
                  color: setCardBG(theSubProposal, PROPOSAL),
                  backgroundColor: setCardFG(theSubProposal, PROPOSAL)
                }}
              >
                <Typography variant="body2" component="div">
                  {PROPOSAL.code}
                </Typography>
              </Avatar>
            )}
            title={(
              <Typography variant="h6" component="div">
                <Tooltip title={PROPOSAL.description} arrow>
                  <Typography>{PROPOSAL.title}</Typography>
                </Tooltip>
              </Typography>
            )}
          />
          {/* <CardContent>
            <Typography variant="caption" component="div">
              {PROPOSAL.description.split('\n').map((c: string) => {
                return (
                  // eslint-disable-next-line react/jsx-key
                  <Typography data-testid={c} variant="caption" component="div">
                    {c}
                  </Typography>
                );
              })}
            </Typography>
            </CardContent> */}
        </Card>
      </Grid>
    );
  }

  return (
    <Grid container direction="column" alignItems="flex-start" justifyContent="space-evenly">
      <Grid
        pl={2}
        container
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        spacing={2}
      >
        <Grid item xs={3}>
          <TextEntry label="Title" testId="titleId" value={theTitle} setValue={validateTheTitle} />
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body2">
            This title should be used to allow for the identification of this proposal in a list of
            proposals
          </Typography>
        </Grid>
      </Grid>

      <Grid pl={2} container direction="row" justifyContent="space-around" alignItems="center">
        <Grid item xs={3}>
          <Typography variant="body2">Proposal Type</Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body2">
            Below are the available Proposal Types that can be used as a basis for a new proposal.
          </Typography>
          <Typography variant="body2">
            A description of the different types is provided as an aid as to the correct type to be
            selected to allow the proposal to be completed as required
          </Typography>
          <Typography variant="body2" sx={{ paddingTop: '20px', fontStyle: 'italic' }}>
            It is possible to be able to change this at a later date, however be aware that this may
            cause information already entered to be lost.
          </Typography>
        </Grid>
      </Grid>

      <Grid
        p={2}
        container
        direction="row"
        justifyContent="space-evenly"
        alignItems="baseline"
        spacing={2}
      >
        {Projects.map((proposalType: any) => ProposalType(proposalType))}
      </Grid>

      {theProposal && (
        <Grid
          p={2}
          container
          direction="row"
          justifyContent="space-evenly"
          alignItems="baseline"
          spacing={2}
        >
          {theProposal?.subProjects[0].id > 0 &&
            theProposal?.subProjects?.map((proposalType: any) => ProposalSubType(proposalType))}
        </Grid>
      )}
    </Grid>
  );
}

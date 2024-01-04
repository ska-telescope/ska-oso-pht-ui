/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import React from 'react';
import { Avatar, Card, CardActionArea, CardHeader, Grid, Tooltip, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import AlertDialog from '../../../components/alertDialog/AlertDialog';
import {
  Projects,
  MAX_TITLE_LENGTH,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL,
  TITLE_ERROR_TEXT
} from '../../../utils/constants';
// import TextEntry from '../../../components/TextEntry/TextEntry/TextEntry';

interface TitleContentProps {
  page: number;
  setStatus: Function;
}

export default function TitleContent({ page, setStatus }: TitleContentProps) {
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
  const [theProposalTemp, setTheProposalTemp] = React.useState(emptyProposal);
  const [theSubProposal, setTheSubProposal] = React.useState(emptySubProposal);
  const [theSubProposalTemp, setTheSubProposalTemp] = React.useState(emptyProposal);
  const [subProposalChange, setSubProposalChange] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = 0;
    if (theTitle?.length > 0) {
      count++;
    }
    if (theSubProposal?.id !== 0) {
      count++;
    }
    setStatus([page, result[count]]);
  }, [theTitle, theSubProposal]);

  const handleDialogResponse = response => {
    if (response === 'continue') {
      if (!subProposalChange) {
        // set proposal and reset sub-proposal
        setTheProposal(theProposalTemp);
        setTheSubProposal(emptyProposal);
      } else {
        // set sub-proposal
        setTheSubProposal(theSubProposalTemp);
      }
    }
  };

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = 0;
    if (theTitle?.length > 0) {
      count++;
    }
    if (theSubProposal?.id !== 0) {
      count++;
    }
    setStatus([page, result[count]]);
  }, [theTitle]);

  function clickProposal(PROPOSAL: any) {
    if (theProposal.title === '') {
      // 1st time selecting a proposal
      setTheProposal(PROPOSAL);
    } else if (theProposal !== PROPOSAL) {
      // changing proposal type
      setSubProposalChange(false);
      setOpenDialog(true);
      // keep track of clicked proposal
      setTheProposalTemp(PROPOSAL);
    }
  }

  function clickSubProposal(PROPOSAL: any) {
    // setTheSubProposal(PROPOSAL);
    if (theSubProposal.title === '') {
      // 1st time selecting the sub-proposal
      setTheSubProposal(PROPOSAL);
    } else if (theSubProposal !== PROPOSAL) {
      // changing sub-proposal type
      setSubProposalChange(true);
      setOpenDialog(true);
      // keep track of clicked sub-proposal
      setTheSubProposalTemp(PROPOSAL);
    }
  }

  const validateTheTitle = e => {
    const title = e;
    // specify the pattern for allowed characters
    const pattern = /^[a-zA-Z0-9\s\-_.,!"'/$]+$/;
    // check if the input matches the pattern
    if (pattern.test(title)) {
      // if it does, update the title
      setTheTitle(title.substring(0, MAX_TITLE_LENGTH));
      setErrorText('');
    } else if (title.trim() === '') {
      // if input is empty, clear the error message
      setErrorText('');
    } else {
      // if input doesn't match the pattern, show an error message
      setErrorText(TITLE_ERROR_TEXT);
    }
  };

  const setCardBG = (in1: any, in2: any) =>
    in1 && in1 === in2 ? theme.palette.secondary.main : theme.palette.primary.main;
  const setCardFG = (in1: any, in2: any) =>
    in1 && in1 === in2 ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText;
  const setCardClassName = (in1: any, in2: any) => (in1 && in1 === in2 ? 'active' : 'inactive');

  function ProposalType(PROPOSAL: any) {
    return (
      <Grid key={PROPOSAL.id} item>
        <Card
          style={{
            color: setCardFG(theProposal, PROPOSAL),
            backgroundColor: setCardBG(theProposal, PROPOSAL),

            display: 'flex',
            justifyContent: 'center'
          }}
          className={setCardClassName(theProposal, PROPOSAL)}
          onClick={() => clickProposal(PROPOSAL)}
          variant="outlined"
          id={`ProposalType-${PROPOSAL.id}`}
        >
          <CardActionArea>
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
                <Typography variant="h6" component="div" maxWidth={200}>
                  <Tooltip title={PROPOSAL.description} arrow>
                    <Typography>{PROPOSAL.title}</Typography>
                  </Tooltip>
                </Typography>
              )}
            />
          </CardActionArea>
        </Card>
      </Grid>
    );
  }

  function ProposalSubType(PROPOSAL: any) {
    return (
      <Grid key={PROPOSAL.id} item xs={12} sm={6} md={3}>
        <Card
          style={{
            color: setCardFG(theSubProposal, PROPOSAL),
            backgroundColor: setCardBG(theSubProposal, PROPOSAL)
          }}
          className={setCardClassName(theSubProposal, PROPOSAL)}
          onClick={() => clickSubProposal(PROPOSAL)}
          variant="outlined"
          id={`SubProposalType-${PROPOSAL.id}`}
        >
          <CardActionArea>
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
          </CardActionArea>
        </Card>
      </Grid>
    );
  }

  return (
    <>
      <Grid container direction="column" alignItems="flex-start" justifyContent="space-evenly">
        <Grid
          pl={2}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={2}>
            <Typography variant="body2">Title</Typography>
          </Grid>
          <Grid item xs={4}>
            <TextEntry
              label="Title"
              testId="titleId"
              value={theTitle}
              setValue={validateTheTitle}
              disabled={false}
              errorText={errorText}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              This title should be used to allow for the
              <br />
              {' '}
              identification of this proposal in a list of proposals
            </Typography>
          </Grid>
        </Grid>

        <Grid
          pl={2}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 4, mb: 4 }}
          spacing={2}
        >
          <Grid item xs={2}>
            <Typography variant="body2">Proposal Type</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2">
              Below are the available Proposal Types that can be used as a basis for a new proposal.
            </Typography>
            <Typography variant="body2">
              A description of the different types is provided as an aid as to the correct type to
              be selected to allow the proposal to be completed as required
            </Typography>
            <Typography variant="body2" sx={{ paddingTop: '20px', fontStyle: 'italic' }}>
              It is possible to be able to change this at a later date, however be aware that this
              may cause information already entered to be lost.
            </Typography>
          </Grid>
        </Grid>

        <Grid
          p={2}
          container
          direction="row"
          justifyContent="center"
          alignItems="baseline"
          spacing={4}
        >
          {Projects.map((proposalType: any) => ProposalType(proposalType))}
        </Grid>

        {theProposal && (
          <Grid
            p={2}
            container
            direction="row"
            justifyContent="center"
            alignItems="baseline"
            spacing={2}
            id="SubProposalContainer"
          >
            {theProposal?.subProjects[0].id > 0 &&
              theProposal?.subProjects?.map((proposalType: any) => ProposalSubType(proposalType))}
          </Grid>
        )}
      </Grid>
      <AlertDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onDialogResponse={handleDialogResponse}
      />
    </>
  );
}

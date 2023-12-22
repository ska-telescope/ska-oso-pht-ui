/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import React from 'react';
import { Avatar, Button, Card, CardHeader, Grid, TextField, Tooltip, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import AlertDialog from '../../../components/alertDialog/AlertDialog';
import { Projects, MAX_TITLE_LENGTH } from '../../../utils/constants';


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

  const [theTitle, setTheTitle] = React.useState('default');
  const [theProposal, setTheProposal] = React.useState(emptyProposal);
  const [theSubProposal, setTheSubProposal] = React.useState(emptySubProposal);
  const [helperText, sethelperText] = React.useState('');
  const [error, setError] = React.useState(false);

  const [openDialog, setOpenDialog] = React.useState(false);
  const handleOpenAlert = () => {
    setOpenDialog(true);
  };
  const handleCloseAlert = () => {
    setOpenDialog(false);
  };

  function clickProposal(PROPOSAL: any) {
    // eslint-disable-next-line no-console
    console.log("Proposal change", theProposal, PROPOSAL);
  if (theProposal.title === '') {
    // eslint-disable-next-line no-console
    console.log("first time selecting proposal");
  } else if (theProposal !== PROPOSAL) {
    // eslint-disable-next-line no-console
    console.log("changing proposal type");
    setOpenDialog(true);
  } else {
    // eslint-disable-next-line no-console
    console.log("same proposal selected");
  }
  setTheProposal(PROPOSAL);
  }

  function clickSubProposal(PROPOSAL: any) {
    setTheSubProposal(PROPOSAL);
  }

  const validateTheTitle = (e) => {
    const title = e.target.value
    // specify the pattern for allowed characters
    const pattern = /^[a-zA-Z0-9\s\-_.,!"'/$]+$/;
    // check if the input matches the pattern
    if (pattern.test(title)) {
      // if it does, update the title
      setTheTitle(title.substring(0, MAX_TITLE_LENGTH));
      setError(false);
      sethelperText("");
    } else {
      // if it doesn't, show an error message
      setError(true);
      sethelperText("Invalid input: only alphanumeric characters, spaces, and some special characters are allowed.");
    }
  };

  const setCardBG = (in1: any, in2: any) =>
    in1 && in1 === in2 ? theme.palette.secondary.main : theme.palette.primary.main;
  const setCardFG = (in1: any, in2: any) =>
    in1 && in1 === in2 ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText;


  function ProposalType(PROPOSAL: any) {
    return (
      <>
        {/* 
        <Button variant="outlined" onClick={handleOpenAlert} sx={{backgroundColor: 'primary.light'}}>
          Open alert dialog
        </Button> 
        */}
        <Grid item>
          <Card
            style={{
            color: setCardFG(theProposal, PROPOSAL),
            backgroundColor: setCardBG(theProposal, PROPOSAL),
            minWidth: 300,
            minHeight: 200,
            display:"flex" ,
            justifyContent:"center"
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
                <Typography variant="h6" component="div" maxWidth={200}>
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
      </>
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
            {/* TODO: use TextEntry instead of TextField (TextField showing user input as NaN, was unable to fix it for now) */}
            {/* <TextEntry label="Title" testId="titleId" value={theTitle} setValue={validateTheTitle} disabled={false} /> */}
            <TextField
              required
              id="titleId"
              label="Title"
              variant="standard"
              fullWidth
              onChange={validateTheTitle}
              error={error}
              helperText={helperText}
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
          sx={{mt: 4, mb: 4}} 
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
        >
          {theProposal?.subProjects[0].id > 0 &&
            theProposal?.subProjects?.map((proposalType: any) => ProposalSubType(proposalType))}
        </Grid>
      )}
      </Grid>
      <AlertDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    </>
  );
}

/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Avatar, Card, CardActionArea, CardHeader, Grid, Tooltip, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import AlertDialog from '../../../components/alertDialog/AlertDialog';
import { Projects, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';
import { helpers } from '../../../utils/helpers';
import { Proposal } from '../../../services/types/proposal';

interface TitleContentProps {
  page: number;
  theProposal: Proposal;
  setProposal: Function;
  setStatus: Function;
}

export default function TitleContent({
  page,
  theProposal,
  setProposal,
  setStatus
}: TitleContentProps) {
  const theme = useTheme();

  const [validateToggle, setValidateToggle] = React.useState(false);
  const [tempValue, setTempValue] = React.useState(0);
  const [subProposalChange, setSubProposalChange] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [theProposal]);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_PARTIAL, STATUS_OK];
    let count = 0;
    if (theProposal?.title?.length > 0) {
      count++;
    }
    if (theProposal?.proposalType !== 0) {
      count++;
    }
    if (theProposal?.proposalSubType !== 0) {
      count++;
    }
    setStatus([page, result[count]]);
  }, [validateToggle]);

  const handleDialogResponse = response => {
    if (response === 'continue') {
      if (!subProposalChange) {
        setProposal({ ...theProposal, proposalType: tempValue, proposalSubType: 0 });
      } else {
        setProposal({ ...theProposal, proposalSubType: tempValue });
      }
    }
  };

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = 0;
    if (theProposal?.title?.length > 0) {
      count++;
    }
    if (theProposal?.proposalType !== 0) {
      count++;
    }
    if (theProposal?.proposalSubType !== 0) {
      count++;
    }
    setStatus([page, result[count]]);
  }, [theProposal]);

  const confirmChange = (id: number, isSubType: boolean) => {
    setTempValue(id);
    setSubProposalChange(isSubType);
    setOpenDialog(true);
  };

  function clickProposal(id: number) {
    if (theProposal.proposalType === 0 || theProposal.proposalSubType === 0) {
      setProposal({ ...theProposal, proposalType: id });
    } else if (theProposal.proposalType !== id) {
      confirmChange(id, false);
    }
  }

  function clickSubProposal(id: any) {
    if (theProposal.proposalSubType === 0) {
      setProposal({ ...theProposal, proposalSubType: id });
    } else if (theProposal.proposalSubType !== id) {
      confirmChange(id, true);
    }
  }

  const setCardBG = (in1: number, in2: number) =>
    in1 && in1 === in2 ? theme.palette.secondary.main : theme.palette.primary.main;
  const setCardFG = (in1: number, in2: number) =>
    in1 && in1 === in2 ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText;
  const setCardClassName = (in1: number, in2: number) =>
    in1 && in1 === in2 ? 'active' : 'inactive';

  function ProposalType(TYPE: any) {
    const { id, title, code, description } = TYPE;
    return (
      <Grid key={id} item>
        <Card
          style={{
            color: setCardFG(theProposal.proposalType, id),
            backgroundColor: setCardBG(theProposal.proposalType, id),

            display: 'flex',
            justifyContent: 'center'
          }}
          className={setCardClassName(theProposal.proposalType, id)}
          onClick={() => clickProposal(id)}
          variant="outlined"
          id={`ProposalType-${id}`}
        >
          <CardActionArea>
            <CardHeader
              avatar={(
                <Avatar
                  variant="rounded"
                  style={{
                    color: setCardBG(theProposal.proposalType, id),
                    backgroundColor: setCardFG(theProposal.proposalType, id)
                  }}
                >
                  <Typography variant="body2" component="div">
                    {code}
                  </Typography>
                </Avatar>
              )}
              title={(
                <Typography variant="h6" component="div" maxWidth={200}>
                  <Tooltip title={description} arrow>
                    <Typography>{title}</Typography>
                  </Tooltip>
                </Typography>
              )}
            />
          </CardActionArea>
        </Card>
      </Grid>
    );
  }

  function ProposalSubType(TYPE: any) {
    const { id, code, title, description } = TYPE;
    return (
      <Grid key={id} item xs={12} sm={6} md={3}>
        <Card
          style={{
            color: setCardFG(theProposal.proposalSubType, id),
            backgroundColor: setCardBG(theProposal.proposalSubType, id)
          }}
          className={setCardClassName(theProposal.proposalSubType, id)}
          onClick={() => clickSubProposal(id)}
          variant="outlined"
          id={`SubProposalType-${id}`}
        >
          <CardActionArea>
            <CardHeader
              avatar={(
                <Avatar
                  variant="rounded"
                  style={{
                    color: setCardBG(theProposal.proposalSubType, id),
                    backgroundColor: setCardFG(theProposal.proposalSubType, id)
                  }}
                >
                  <Typography variant="body2" component="div">
                    {code}
                  </Typography>
                </Avatar>
              )}
              title={(
                <Typography variant="h6" component="div">
                  <Tooltip title={description} arrow>
                    <Typography>{title}</Typography>
                  </Tooltip>
                </Typography>
              )}
            />
          </CardActionArea>
        </Card>
      </Grid>
    );
  }

  const titleField = () => {
    const setTitle = (e: string) => {
      setProposal({ ...theProposal, title: e });
    };

    return (
      <TextEntry
        label=""
        testId="titleId"
        value={theProposal?.title}
        setValue={(title: string) =>
          helpers.validate.validateTextEntry(title, setTitle, setErrorText)}
        errorText={errorText}
      />
    );
  };

  const label = (e: string) => <Typography variant="h6">{e}</Typography>;

  return (
    <>
      {theProposal && (
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
              {label('Title')}
            </Grid>
            <Grid item xs={4}>
              {titleField()}
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
              <Typography variant="h6">Proposal Type</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">
                Below are the available Proposal Types that can be used as a basis for a new
                proposal.
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

          <Grid
            p={2}
            container
            direction="row"
            justifyContent="center"
            alignItems="baseline"
            spacing={2}
            id="SubProposalContainer"
          >
            {theProposal.proposalType > 0 &&
              Projects[theProposal.proposalType - 1].subProjects[0].id > 0 &&
              Projects[theProposal.proposalType - 1].subProjects?.map((proposalType: any) =>
                ProposalSubType(proposalType)
              )}
          </Grid>
        </Grid>
      )}
      <AlertDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onDialogResponse={handleDialogResponse}
      />
    </>
  );
}

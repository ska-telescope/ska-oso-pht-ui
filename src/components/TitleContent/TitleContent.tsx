/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Avatar, Card, CardActionArea, CardHeader, Grid, Tooltip, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import AlertDialog from '../alerts/alertDialog/AlertDialog';
import { Projects, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { helpers } from '../../utils/helpers';
import { Proposal } from '../../services/types/proposal';

interface TitleContentProps {
  page: number;
}

export default function TitleContent({ page }: TitleContentProps) {
  const theme = useTheme();
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();

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
  }, [application.content2]);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(page === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_PARTIAL, STATUS_OK];
    let count = 0;
    if (getProposal()?.title?.length > 0) {
      count++;
    }
    if (getProposal()?.proposalType !== 0) {
      count++;
    }
    if (getProposal()?.proposalSubType !== 0) {
      count++;
    }
    setTheProposalState(result[count]);
  }, [validateToggle]);

  const handleDialogResponse = response => {
    if (response === 'continue') {
      if (!subProposalChange) {
        setProposal({ ...getProposal(), proposalType: tempValue, proposalSubType: 0 });
      } else {
        setProposal({ ...getProposal(), proposalSubType: tempValue });
      }
    }
  };

  const confirmChange = (id: number, isSubType: boolean) => {
    setTempValue(id);
    setSubProposalChange(isSubType);
    setOpenDialog(true);
  };

  function clickProposal(id: number) {
    if (getProposal().proposalType === 0 || getProposal().proposalSubType === 0) {
      setProposal({ ...getProposal(), proposalType: id });
    } else if (getProposal().proposalType !== id) {
      confirmChange(id, false);
    }
  }

  function clickSubProposal(id: any) {
    if (getProposal().proposalSubType === 0) {
      setProposal({ ...getProposal(), proposalSubType: id });
    } else if (getProposal().proposalSubType !== id) {
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
            color: setCardFG(getProposal().proposalType, id),
            backgroundColor: setCardBG(getProposal().proposalType, id),

            display: 'flex',
            justifyContent: 'center'
          }}
          className={setCardClassName(getProposal().proposalType, id)}
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
                    color: setCardBG(getProposal().proposalType, id),
                    backgroundColor: setCardFG(getProposal().proposalType, id)
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
      <Grid key={id} item>
        <Card
          style={{
            color: setCardFG(getProposal().proposalSubType, id),
            backgroundColor: setCardBG(getProposal().proposalSubType, id)
          }}
          className={setCardClassName(getProposal().proposalSubType, id)}
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
                    color: setCardBG(getProposal().proposalSubType, id),
                    backgroundColor: setCardFG(getProposal().proposalSubType, id)
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
    const MAX_CHAR = 50;

    const setTitle = (e: string) => {
      setProposal({ ...getProposal(), title: e.substring(0, MAX_CHAR) });
    };

    const helperFunction = (title:string) =>
      `character count ${  title?.length  }/${  MAX_CHAR}`;

    return (
      <TextEntry
        label=""
        testId="titleId"
        value={getProposal()?.title}
        setValue={(title: string) =>
          helpers.validate.validateTextEntry(title, setTitle, setErrorText)}
        errorText={errorText}
        helperText={helperFunction(getProposal()?.title)}
      />
    );
  };

  const label = (e: string) => <Typography variant="h6">{e}</Typography>;

  return (
    <>
      {getProposal() && (
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
              <Typography variant="body2" sx={{ paddingTop: '20px', fontStyle: 'italic' }}>
                Special characters !*+[] not allowed
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
            {getProposal().proposalType > 0 &&
              Projects[getProposal().proposalType - 1].subProjects[0].id > 0 &&
              Projects[getProposal().proposalType - 1].subProjects?.map((proposalType: any) =>
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

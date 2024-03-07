import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Card, CardActionArea, CardHeader, Grid, Tooltip, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LABEL_POSITION, TextEntry } from '@ska-telescope/ska-gui-components';
import AlertDialog from '../alerts/alertDialog/AlertDialog';
import { Projects, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { helpers } from '../../utils/helpers';
import { Proposal } from '../../services/types/proposal';

interface TitleContentProps {
  page: number;
}

export default function TitleContent({ page }: TitleContentProps) {
  const { t } = useTranslation('pht');
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
    const temp: number[] = [];
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

  const setTheErrorText = (str: string) => setErrorText(t(str));

  const handleDialogResponse = () => {
    if (!subProposalChange) {
      setProposal({ ...getProposal(), proposalType: tempValue, proposalSubType: 0 });
    } else {
      setProposal({ ...getProposal(), proposalSubType: tempValue });
    }
    setOpenDialog(false);
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
              avatar={
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
              }
              title={
                <Typography variant="h6" component="div" maxWidth={200}>
                  <Tooltip title={description} arrow>
                    <Typography>{title}</Typography>
                  </Tooltip>
                </Typography>
              }
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
              avatar={
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
              }
              title={
                <Typography variant="h6" component="div">
                  <Tooltip title={description} arrow>
                    <Typography>{title}</Typography>
                  </Tooltip>
                </Typography>
              }
            />
          </CardActionArea>
        </Card>
      </Grid>
    );
  }

  const alertContent = () => {
    return (
      <Grid
        p={2}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <Typography variant="body1">{t('changeProposal.content1')}</Typography>
        <Typography variant="body1">{t('changeProposal.content2')}</Typography>
      </Grid>
    );
  };

  const titleField = () => {
    const MAX_CHAR = Number(t('title.maxChar'));
    const MAX_WORD = Number(t('title.maxWord'));

    const setTitle = (e: string) => {
      setProposal({ ...getProposal(), title: e.substring(0, MAX_CHAR) });
    };

    const countWords = (text: string) => {
      return !text
        ? 0
        : text
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;
    };

    const helperFunction = (title: string) =>
      `${t('title.helper')} - ${t('specialCharacters.cntWord')} ${countWords(title)} / ${MAX_WORD}`;

    return (
      <TextEntry
        label={t('title.label')}
        labelPosition={LABEL_POSITION.START}
        testId="titleId"
        value={getProposal().title}
        setValue={(title: string) =>
          helpers.validate.validateTextEntry(title, setTitle, setTheErrorText)
        }
        errorText={errorText}
        helperText={helperFunction(getProposal().title)}
      />
    );
  };

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
            <Grid item xs={6}>
              {titleField()}
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">{t('help.title')}</Typography>
              <Typography variant="body2" sx={{ paddingTop: '20px', fontStyle: 'italic' }}>
                {t('specialCharacters.help')}
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
              <Typography variant="body2">{t('label.proposalType')}</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{t('help.proposalType1')}</Typography>
              <Typography variant="body2">{t('help.proposalType2')}</Typography>
              <Typography variant="body2" sx={{ paddingTop: '20px', fontStyle: 'italic' }}>
                {t('help.proposalType3')}
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
        title="changeProposal.label"
      >
        {alertContent()}
      </AlertDialog>
    </>
  );
}

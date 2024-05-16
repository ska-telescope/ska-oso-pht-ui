import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Card, CardActionArea, CardHeader, Grid, Tooltip, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LABEL_POSITION, TextEntry } from '@ska-telescope/ska-gui-components';
import AlertDialog from '../alerts/alertDialog/AlertDialog';
import { Projects, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { countWords, helpers } from '../../utils/helpers';
import { Proposal } from '../../utils/types/proposal';
import LatexPreviewModal from '../info/latexPreviewModal/latexPreviewModal';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';

interface TitleContentProps {
  page: number;
}

export default function TitleContent({ page }: TitleContentProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();

  const [validateToggle, setValidateToggle] = React.useState(false);

  const [tempValue, setTempValue] = React.useState(0);
  const [, setErrorText] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);

  const [openTitleLatexModal, setOpenTitleLatexModal] = React.useState(false);
  const handleOpenTitleLatexModal = () => setOpenTitleLatexModal(true);
  const handleCloseTitleLatexModal = () => setOpenTitleLatexModal(false);

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
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = 0;
    if (getProposal()?.title?.length > 0) {
      count++;
    }
    if (getProposal()?.proposalType !== 0) {
      count++;
    }
    setTheProposalState(result[count]);
  }, [validateToggle]);

  const setTheErrorText = (str: string) => setErrorText(t(str));

  const handleDialogResponse = () => {
    setProposal({ ...getProposal(), proposalType: tempValue, proposalSubType: [] });
    setOpenDialog(false);
  };

  const confirmChange = (id: number) => {
    setTempValue(id);
    setOpenDialog(true);
  };

  function clickProposal(id: number) {
    if (getProposal().proposalType === 0) {
      setProposal({ ...getProposal(), proposalType: id });
    } else if (getProposal().proposalType !== id) {
      confirmChange(id);
    }
  }

  function clickSubProposal(id: number) {
    let removed = false;
    const newList = [];
    getProposal().proposalSubType.forEach(subType => {
      if (subType !== id) {
        newList.push(subType);
      } else {
        removed = true;
      }
    });
    if (!removed) {
      newList.push(id);
    }
    setProposal({ ...getProposal(), proposalSubType: newList });
  }

  const setCardBG = (in1: number, in2: number) =>
    in1 && in1 === in2 ? theme.palette.secondary.main : theme.palette.primary.main;
  const setCardFG = (in1: number, in2: number) =>
    in1 && in1 === in2 ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText;
  const setCardClassName = (in1: number, in2: number) =>
    in1 && in1 === in2 ? 'active' : 'inactive';

  const setCardBG2 = (in1: number[], in2: number) => {
    const num = in1.findIndex(obj => obj === in2);
    return num !== -1 ? theme.palette.secondary.main : theme.palette.primary.main;
  };
  const setCardFG2 = (in1: number[], in2: number) => {
    const num = in1.findIndex(obj => obj === in2);
    return num !== -1 ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText;
  };
  const setCardClassName2 = (in1: number[], in2: number) => {
    const num = in1.findIndex(obj => obj === in2);
    return num !== -1 ? 'active' : 'inactive';
  };

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
            color: setCardFG2(getProposal().proposalSubType, id),
            backgroundColor: setCardBG2(getProposal().proposalSubType, id)
          }}
          className={setCardClassName2(getProposal().proposalSubType, id)}
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
                    color: setCardBG2(getProposal().proposalSubType, id),
                    backgroundColor: setCardFG2(getProposal().proposalSubType, id)
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

    function validateWordCount(title: string) {
      if (countWords(title) > MAX_WORD) {
        return `${t('title.error')} - ${t('specialCharacters.numWord')} ${countWords(
          title
        )} / ${MAX_WORD}`;
      }
    }

    const helperFunction = (title: string) =>
      `${t('title.helper')} - ${t('specialCharacters.cntWord')} ${countWords(title)} / ${MAX_WORD}`;

    return (
      <TextEntry
        label={t('title.label')}
        labelBold
        labelPosition={LABEL_POSITION.START}
        required
        testId="titleId"
        value={getProposal()?.title}
        setValue={(title: string) =>
          helpers.validate.validateTextEntry(title, setTitle, setTheErrorText, 'TITLE')
        }
        errorText={validateWordCount(getProposal()?.title)}
        helperText={helperFunction(getProposal()?.title)}
        suffix={<ViewIcon toolTip={t('latex.toolTip')} onClick={handleOpenTitleLatexModal} />}
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
            <Grid item xs={5}>
              {titleField()}
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={3}>
              <Typography variant="body2">{t('title.help')}</Typography>
              <Typography pr={2} variant="body2" sx={{ fontStyle: 'italic' }}></Typography>
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
              <Typography variant="subtitle1">{t('proposalType.label') + ' *'}</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{t('proposalType.help1')}</Typography>
              <Typography variant="body2">{t('proposalType.help2')}</Typography>
              <Typography variant="body2">{t('proposalType.help3')}</Typography>
              <Typography variant="body2" pt={2} sx={{ fontStyle: 'italic' }}>
                {t('proposalType.help4')}
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
      <LatexPreviewModal
        value={getProposal()?.title}
        open={openTitleLatexModal}
        onClose={handleCloseTitleLatexModal}
        title={t('latex.previewTitle')}
      />
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

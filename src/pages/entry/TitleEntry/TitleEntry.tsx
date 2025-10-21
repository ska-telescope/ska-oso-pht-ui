import React from 'react';
import { Avatar, Card, CardActionArea, CardHeader, Grid, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import AlertDialog from '../../../components/alerts/alertDialog/AlertDialog';
import { LAB_IS_BOLD, LAB_POSITION, PROJECTS } from '../../../utils/constants';
import { countWords, helpers } from '../../../utils/helpers';
import { Proposal } from '../../../utils/types/proposal';
import { validateTitlePage } from '../../../utils/validation/validation';
import LatexPreviewModal from '../../../components/info/latexPreviewModal/latexPreviewModal';
import ViewIcon from '../../../components/icon/viewIcon/viewIcon';
import CardTitle from '@/components/cards/cardTitle/CardTitle';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const LABEL_WIDTH = 2;
const FIELD_WIDTH = 10;
interface TitleEntryProps {
  page: number;
}

export default function TitleEntry({ page }: TitleEntryProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();

  const [validateToggle, setValidateToggle] = React.useState(false);

  const [tempValue, setTempValue] = React.useState(0);
  const [, setErrorText] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);

  const [openTitleLatexModal, setOpenTitleLatexModal] = React.useState(false);
  const handleOpenTitleLatexModal = () => setOpenTitleLatexModal(true);
  const handleCloseTitleLatexModal = () => setOpenTitleLatexModal(false);

  const MAX_CHAR = Number(t('title.maxChar'));
  const MAX_WORD = Number(t('title.maxWord'));

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
    const theState = getProposalState();
    if (theState) {
      for (let i = 0; i < theState?.length; i++) {
        temp.push(page === i ? value : getProposalState()[i]);
      }
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    setTheProposalState(validateTitlePage(getProposal()));
  }, [validateToggle]);

  const getTitle = () => (getProposal() ? getProposal().title : '');

  const setTheErrorText = (str: string) => setErrorText(str ? t(str) : '');

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
    getProposal().proposalSubType?.forEach(subType => {
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

  const displayLabel = (inValue: string) => (
    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
      {inValue}
    </Typography>
  );

  function ProposalType(TYPE: any) {
    const { id } = TYPE;
    return (
      <Grid key={id} size={{ md: 4, lg: 3 }}>
        <CardTitle
          className={setCardClassName(getProposal().proposalType, id)}
          code={t('proposalType.code.' + id)}
          colorAvatarBG={setCardFG(getProposal().proposalType, id)}
          colorAvatarFG={setCardBG(getProposal().proposalType, id)}
          colorCardBG={setCardBG(getProposal().proposalType, id)}
          colorCardFG={setCardFG(getProposal().proposalType, id)}
          id={`ProposalType-${id}`}
          onClick={() => clickProposal(id)}
          title={t('proposalType.title.' + id)}
          toolTip={t('proposalType.desc.' + id)}
        />
      </Grid>
    );
  }

  function Attributes(TYPE: any) {
    const { id } = TYPE;
    return (
      <Grid key={id} size={{ md: 6, lg: 3 }}>
        <Tooltip title={t('proposalAttribute.desc.' + id)} arrow>
          <Card
            style={{
              color: setCardFG2(getProposal().proposalSubType ?? [], id),
              backgroundColor: setCardBG2(getProposal().proposalSubType ?? [], id),
              display: 'flex',
              justifyContent: 'center',
              minHeight: '90px'
            }}
            className={setCardClassName2(getProposal().proposalSubType ?? [], id)}
            onClick={() => clickSubProposal(id)}
            variant="outlined"
            id={`proposalAttribute-${id}`}
          >
            <CardActionArea>
              <CardHeader
                avatar={
                  <Avatar
                    variant="rounded"
                    style={{
                      color: setCardBG2(getProposal().proposalSubType ?? [], id),
                      backgroundColor: setCardFG2(getProposal().proposalSubType ?? [], id)
                    }}
                  >
                    <Typography variant="body2" component="div">
                      {t('proposalAttribute.code.' + id)}
                    </Typography>
                  </Avatar>
                }
                title={
                  <Typography variant="h6" component="div">
                    <Typography>{t('proposalAttribute.title.' + id)}</Typography>
                  </Typography>
                }
              />
            </CardActionArea>
          </Card>
        </Tooltip>
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

  function validateWordCount(title: string) {
    if (!title || title?.length === 0) {
      return `${t('title.empty')}`;
    } else if (countWords(title) > MAX_WORD) {
      return `${t('specialCharacters.numWord')} ${countWords(title)} / ${MAX_WORD}`;
    }
  }

  const titleField = (ipad: boolean = false) => {
    const setTitle = (e: string) => {
      if (countWords(e) < MAX_WORD || (countWords(e) === MAX_WORD && !/\s$/.test(e))) {
        setProposal({ ...getProposal(), title: e.substring(0, MAX_CHAR) });
      }
    };

    const helperFunction = (title: string) => {
      const baseHelperText = t('title.helper', {
        current: countWords(title),
        max: MAX_WORD
      });
      return countWords(title) === MAX_WORD
        ? `${baseHelperText} (MAX WORD COUNT REACHED)`
        : baseHelperText;
    };

    return (
      <TextEntry
        label=""
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={0}
        testId={ipad ? 'titleIdIpad' : 'titleId'}
        value={getTitle()}
        setValue={(title: string) =>
          helpers.validate.validateTextEntry(title, setTitle, setTheErrorText, 'TITLE')
        }
        errorText={validateWordCount(getProposal().title)}
        helperText={helperFunction(getProposal().title as string)}
        suffix={<ViewIcon toolTip={t('latex.toolTip')} onClick={handleOpenTitleLatexModal} />}
      />
    );
  };

  const titleHelpDisplay = (title: string, description: string, labelWidth = LABEL_WIDTH) => {
    return (
      <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
        <Grid size={{ xs: labelWidth }}>{displayLabel(title)}</Grid>
        <Grid size={{ xs: 12 - labelWidth }}>
          <Typography variant="body2">{description}</Typography>
        </Grid>
      </Grid>
    );
  };

  const proposalTypes = () => {
    return (
      <Grid
        p={2}
        container
        direction="row"
        justifyContent="center"
        alignItems="baseline"
        spacing={4}
      >
        {PROJECTS.map((proposalType: any) => ProposalType(proposalType))}
      </Grid>
    );
  };

  const proposalAttributes = () => (
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
        PROJECTS[getProposal().proposalType - 1].subProjects[0].id > 0 &&
        PROJECTS[getProposal().proposalType - 1].subProjects?.map((proposalType: any) =>
          Attributes(proposalType)
        )}
    </Grid>
  );

  const row1 = () => {
    return (
      getProposal().title !== undefined && (
        <Grid
          pl={2}
          pb={4}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid size={{ xs: FIELD_WIDTH }} display={{ xs: 'block', lg: 'none' }}>
            <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Grid size={{ xs: LABEL_WIDTH }}>{displayLabel(t('title.label') + ' *')}</Grid>
              <Grid size={{ xs: 12 - LABEL_WIDTH }}>{titleField(true)}</Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: FIELD_WIDTH }} display={{ xs: 'none', lg: 'block' }}>
            <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Grid size={{ xs: LABEL_WIDTH }}>{displayLabel(t('title.label') + ' *')}</Grid>
              <Grid size={{ xs: 8 - LABEL_WIDTH }}>{titleField()}</Grid>
              <Grid size={{ md: 4 }}></Grid>
            </Grid>
          </Grid>
        </Grid>
      )
    );
  };

  const row2 = () => {
    return (
      <Grid
        pl={2}
        pt={3}
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid size={{ xs: FIELD_WIDTH }}>
          {titleHelpDisplay(t('proposalType.plural') + ' *', t('proposalType.help'))}
        </Grid>

        <Grid size={{ xs: FIELD_WIDTH }}>{proposalTypes()}</Grid>
      </Grid>
    );
  };

  const row3 = () => {
    return (
      <Grid
        pl={2}
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid size={{ xs: FIELD_WIDTH }}>
          {titleHelpDisplay(t('proposalAttribute.plural'), t('proposalAttribute.help'))}
        </Grid>

        <Grid size={{ xs: FIELD_WIDTH }}>{proposalAttributes()}</Grid>
      </Grid>
    );
  };

  return (
    <>
      {getProposal() && (
        <>
          {row1()}
          {row2()}
          {getProposal().proposalType > 0 && row3()}
        </>
      )}
      <LatexPreviewModal
        value={getTitle()}
        open={openTitleLatexModal}
        onClose={handleCloseTitleLatexModal}
        title={t('title.label')}
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

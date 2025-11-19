import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { GridRowSelectionModel } from '@mui/x-data-grid'; // TODO : Need to move this into the ska-gui-components
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Observation from '../../utils/types/observation';
import { Proposal } from '../../utils/types/proposal';
import {
  validateCalibrationPage,
  validateLinkingPage,
  validateObservationPage
} from '../../utils/validation/validation';
import {
  BANDWIDTH_TELESCOPE,
  PAGE_CALIBRATION,
  PAGE_LINKING,
  PAGE_OBSERVATION,
  PATH
} from '../../utils/constants';
import GroupObservation from '../../utils/types/groupObservation';
import DeleteObservationConfirmation from '../../components/alerts/deleteObservationConfirmation/deleteObservationConfirmation';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

const DATA_GRID_OBSERVATION = '62vh';
const PAGE = PAGE_OBSERVATION;

export default function ObservationPage() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currObs, setCurrObs] = React.useState<Observation | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [elementsO, setElementsO] = React.useState<any[]>([]);
  const loggedIn = isLoggedIn();
  const { isSV } = useAppFlow();

  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number, valueLinking: number, valueCalibration: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      // validate observation page, linking page & calibration page
      temp.push(
        PAGE === i
          ? value
          : PAGE_CALIBRATION === i
          ? valueCalibration
          : PAGE_LINKING === i
          ? valueLinking
          : getProposalState()[i]
      );
    }
    updateAppContent1(temp);
  };

  const popElementO = (rec: Observation) => {
    return {
      id: rec.id,
      id2: rec.id /* Only here to satisfy syntax of DataGrid headers */,
      rec: rec,
      telescope: rec.telescope,
      subarray: rec.subarray,
      type: rec.type,
      status: 0
    };
  };

  const editIconClicked = (row: any) => {
    setCurrObs(row.rec);
    navigate(PATH[2], { replace: true, state: row.rec });
  };

  const deleteIconClicked = (row: any) => {
    setCurrObs(row.rec);
    setOpenDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = (getProposal().observations ?? []).filter(e => e.id !== currObs?.id);
    const obs2 = (getProposal().targetObservation ?? []).filter(
      e => e.observationId !== currObs?.id
    );
    const obs3 = (getProposal().groupObservations ?? []).filter(
      e => e.observationId !== currObs?.id
    );
    const obs4 = getProposal().calibrationStrategy?.filter(e => e.observationIdRef !== currObs?.id);
    setProposal({
      ...getProposal(),
      observations: obs1,
      targetObservation: obs2,
      groupObservations: obs3,
      calibrationStrategy: obs4
    });
    setElementsO(elementsO.filter(e => e.id !== currObs?.id));
    setCurrObs(null);
    closeDeleteDialog();
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    setElementsO(getProposal().observations?.map(rec => popElementO(rec)) ?? []);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(
      validateObservationPage(getProposal()),
      validateLinkingPage(getProposal()),
      validateCalibrationPage(getProposal())
    );
  }, [validateToggle]);

  const observationGroupIds = (id: string) => {
    if (
      getProposal()?.groupObservations &&
      getProposal()?.groupObservations?.some(e => e.observationId === id)
    ) {
      const group: GroupObservation[] =
        getProposal().groupObservations?.filter(e => e.observationId === id) ?? [];
      return group[0]?.groupId;
    }
    return '';
  };

  const hasObservations = () => elementsO?.length > 0;

  const extendedColumnsObservations = [
    ...[
      {
        field: 'id',
        headerName: t('observations.id'),
        flex: 0.75,
        minWidth: 150,
        disableClickEventBubbling: true
      },
      {
        field: 'id2',
        headerName: t('observations.group'),
        flex: 0.75,
        minWidth: 150,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { id: number } }) => {
          return observationGroupIds((e.row.id as unknown) as string);
        }
      },
      {
        field: 'telescope',
        headerName: t('observingBand.label'),
        flex: 1.5,
        minWidth: 250,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { rec: { observingBand: string | number } } }) =>
          BANDWIDTH_TELESCOPE[Number(e.row.rec.observingBand)]?.label
      },
      {
        field: 'subarray',
        headerName: t('subArrayConfiguration.short'),
        flex: 1,
        minWidth: 150,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { telescope: number; subarray: number } }) => {
          if (e.row.telescope) {
            return t(`subArrayConfiguration.${e.row.subarray}`);
          }
          return t('arrayConfiguration.0');
        }
      },
      {
        field: 'type',
        headerName: t('observationType.short'),
        width: 140,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { type: number } }) =>
          t((isSV() ? 'scienceCategory.' : 'observationType.') + `${e.row.type}`)
      },
      {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        sortable: false,
        width: 100,
        disableClickEventBubbling: true,
        renderCell: (e: { row: Observation }) => {
          return (
            <>
              <EditIcon onClick={() => editIconClicked(e.row)} toolTip={t('observations.edit')} />
              <TrashIcon
                onClick={() => deleteIconClicked(e.row)}
                toolTip={t('observations.delete')}
              />
            </>
          );
        }
      }
    ]
  ];

  let deleteDialog: React.ReactElement | null = null;
  if (openDeleteDialog && currObs) {
    deleteDialog = (
      <DeleteObservationConfirmation
        action={deleteConfirmed}
        observation={currObs}
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
      />
    );
  }

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid size={{ md: 11 }}>
          <Grid container direction="column" alignItems="flex-start" justifyContent="space-around">
            <Grid container direction="row" alignItems="flex-start" justifyContent="space-between">
              <Grid pb={1}>
                <AddButton
                  action={PATH[2]}
                  primary={!hasObservations()}
                  testId="addObservationButton"
                  title="addObservation.button"
                />
              </Grid>
            </Grid>
            {hasObservations() ? (
              <DataGrid
                rows={elementsO}
                columns={extendedColumnsObservations}
                height={DATA_GRID_OBSERVATION}
                onRowClick={(e: { row: { rec: React.SetStateAction<Observation | null> } }) =>
                  setCurrObs(e.row.rec)
                }
                onRowSelectionModelChange={(
                  newRowSelectionModel: React.SetStateAction<GridRowSelectionModel>
                ) => {
                  setRowSelectionModel(newRowSelectionModel);
                }}
                rowSelectionModel={rowSelectionModel}
                testId="observationDetails"
              />
            ) : (
              <Alert
                color={AlertColorTypes.Error}
                text={loggedIn ? t('error.noObservations') : t('error.noObservationsLoggedOut')}
                testId="noObservationsNotification"
              />
            )}
          </Grid>
        </Grid>
      </Grid>
      {deleteDialog ?? <></>}
    </Shell>
  );
}

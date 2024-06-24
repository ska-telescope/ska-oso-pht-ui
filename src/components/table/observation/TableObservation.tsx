import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import GroupObservation from '../../../utils/types/groupObservation';
import { Proposal } from '../../../utils/types/proposal';
import { Box, TablePagination } from '@mui/material';

interface TableObservationProps {
  data?: any;
  rowsPage?: number;
}

export default function TableObservation({ data, rowsPage = 10 }: TableObservationProps) {
  const { t } = useTranslation('pht');
  const { application } = storageObject.useStore();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPage);

  const getProposal = () => application.content2 as Proposal;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /*********************************************/

  const observationGroupIds = (id: string) => {
    if (
      getProposal()?.groupObservations &&
      getProposal()?.groupObservations.some(e => e.observationId === id)
    ) {
      const group: GroupObservation[] = getProposal().groupObservations.filter(
        e => e.observationId === id
      );
      return group[0]?.groupId;
    }
    return '';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer component={Paper}>
          <Table aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>{t('observations.id')}</TableCell>
                <TableCell>{t('observations.group')}</TableCell>
                <TableCell>{t('arrayConfiguration.short')}</TableCell>
                <TableCell>{t('subArrayConfiguration.short')}</TableCell>
                <TableCell>{t('observationType.short')}</TableCell>
                <TableCell></TableCell>
                <TableCell>{t('actions.label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {row.id}
                  </TableCell>
                  <TableCell>{observationGroupIds((row.id as unknown) as string)}</TableCell>
                  <TableCell>{t(`arrayConfiguration.${row.telescope}`)}</TableCell>
                  <TableCell>{t(`subArrayConfiguration.${row.subarray}`)}</TableCell>
                  <TableCell>{t(`observationType.${row.type}`)}</TableCell>
                  <TableCell>{t(`observationType.${row.type}`)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}

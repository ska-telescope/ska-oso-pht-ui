import React from 'react';
import { Table, TableBody } from '@mui/material';

import TableContainer from '../tableContainer/TableContainer';
import TableReviewDecisionHeader from './tableReviewDecisionHeader/TableReviewDecisionHeader';
import TableReviewDecisionRow from './tableReviewDecisionRow.tsx/TableReviewDecisionRow';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { PANEL_DECISION_STATUS, REVIEW_TYPE } from '@/utils/constants';
import { trimText } from '@/utils/present/present';

interface TableReviewDecisionProps {
  data: any;
  excludeFunction: (detail: any) => void;
  updateFunction: (item: any) => void;
}

export default function TableReviewDecision({
  data,
  excludeFunction,
  updateFunction
}: TableReviewDecisionProps) {
  const { t } = useScopedTranslation();

  const expandButtonRefs = React.useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const [expandedRows, setExpandedRows] = React.useState(new Set<number>());

  const getReviews = (reviews: any[], reviewType: string) =>
    reviews?.filter(el => el?.reviewType?.kind === reviewType) ?? [];

  const getReviewsReviewed = (reviews: any[]) =>
    getReviews(reviews, REVIEW_TYPE.SCIENCE)?.filter(
      el => el?.status === PANEL_DECISION_STATUS.REVIEWED
    ) ?? [];

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    newExpandedRows.has(id) ? newExpandedRows.delete(id) : newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  const calculateScore = (details: Array<any>) => {
    if (!details || details.length === 0) return 0;
    const filtered = details.filter(
      el =>
        el?.reviewType.kind === 'Science Review' &&
        !el?.reviewType?.excludedFromDecision &&
        el?.status !== 'To Do'
    );
    if (filtered.length === 0) return 0;
    const average =
      filtered.reduce((sum, detail) => sum + detail?.reviewType?.rank, 0) / filtered.length;
    return Math.round((average + Number.EPSILON) * 100) / 100;
  };

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="Employee information table">
        <TableReviewDecisionHeader />
        <TableBody>
          {(data ?? []).map((item: any, index: number) => (
            <TableReviewDecisionRow
              key={item.id}
              item={item}
              index={index}
              expanded={expandedRows.has(item.id)}
              toggleRow={toggleRow}
              expandButtonRef={el => (expandButtonRefs.current[item.id] = el)}
              excludeFunction={excludeFunction}
              updateDecisionItem={updateFunction}
              getReviews={getReviews}
              getReviewsReviewed={getReviewsReviewed}
              calculateScore={calculateScore}
              trimText={trimText}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

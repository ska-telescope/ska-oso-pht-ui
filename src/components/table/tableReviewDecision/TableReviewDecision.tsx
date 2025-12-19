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
    if (!details || details.length === 0) return parseFloat('0').toFixed(1);
    const filtered = details.filter(
      el =>
        el?.reviewType.kind === 'Science Review' &&
        !el?.reviewType?.excludedFromDecision &&
        el?.status !== 'To Do'
    );
    if (filtered.length === 0) return parseFloat('0').toFixed(1);
    const average =
      filtered.reduce((sum, detail) => sum + detail?.reviewType?.rank, 0) / filtered.length;
    return (Math.round((average + Number.EPSILON) * 100) / 100).toFixed(1);
  };

  const scoredItems = React.useMemo(() => {
    if (!data) return [];

    // Step 1: Calculate scores
    const itemsWithScores = data.map((item: any) => ({
      ...item,
      score: calculateScore(item.reviews)
    }));

    // Step 2: Sort by score descending
    const sorted = [...itemsWithScores].sort((a, b) => b.score - a.score);

    // Step 3: Assign ranks with ties
    let rank = 1;
    let lastScore: number | null = null;
    const rankMap = new Map<number, number>();

    sorted.forEach((item, index) => {
      if (item.score === 0) return; // skip zero scores for now
      if (item.score !== lastScore) {
        rank = index + 1;
        lastScore = item.score;
      }
      rankMap.set(item.id, rank);
    });

    // Step 4: Apply ranks to all items
    const zeroScoreRank = data.length;

    const results = itemsWithScores.map((item: { score: number; id: number }) => ({
      ...item,
      displayRank: item.score === 0 ? zeroScoreRank : rankMap.get(item.id) ?? zeroScoreRank
    }));

    // checkForUpdatesForAPI(results);
    return results;
  }, [data]);

  return (
    <TableContainer>
      <Table aria-label="Review Decision Table">
        <TableReviewDecisionHeader />
        <TableBody>
          {scoredItems.map((item: any, index: number) => (
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
              tableLength={data.length}
              trimText={trimText}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

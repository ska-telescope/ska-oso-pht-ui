import { Box, Typography, Grid, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { ChoiceCards } from '@/components/fields/choiceCards/choiceCards';
import SubmitButton from '@/components/button/Submit/Submit';
import { FEASIBLE_YES, FEASIBLE_MAYBE, FEASIBLE_NO } from '@/utils/constants';

const FINAL_COMMENTS_HEIGHT = 43;

interface DecisionEntryProps {
  item: {
    id: string | number;
    title: string;
    reviews: any[];
    decisions: {
      recommendation: string;
    }[];
    comments: string;
  };
  calculateScore: (reviews: any[]) => number;
  updateItem: Function;
  submitFunctionClicked: (item: any) => void;
}

export default function DecisionEntry({
  item,
  calculateScore,
  updateItem,
  submitFunctionClicked
}: DecisionEntryProps) {
  const { t } = useTranslation('pht');

  const hasRecommendation = (recommendation: string) => {
    return (
      recommendation === FEASIBLE_YES ||
      recommendation === FEASIBLE_MAYBE ||
      recommendation === FEASIBLE_NO
    );
  };

  const recommendedYes = (recommendation: string) => recommendation === FEASIBLE_YES;

  const hasComments = (item: { recommendation: string; comments: string }) =>
    recommendedYes(item.recommendation) ? true : item.comments?.length > 0;

  const submitDisabled = (item: any) => {
    return !hasRecommendation(item?.recommendation) || !hasComments(item);
  };

  return (
    <Box p={2}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Stack>
            <Grid
              p={2}
              container
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
            >
              <Grid>
                <Typography variant="h6" fontWeight="bold">
                  {t('tableReviewDecision.decisionComments')}
                </Typography>
              </Grid>
              <Grid>
                <Typography variant="h6">
                  {`${t('tableReviewDecision.decisionScore')} ${calculateScore(item.reviews)}`}
                </Typography>
              </Grid>
              <Grid>
                <Box pt={2}>
                  <ChoiceCards
                    label=""
                    value={item?.decisions[item?.decisions?.length - 1]?.recommendation ?? ''}
                    noWrap
                    onChange={(val: string) => {
                      const rec = item;
                      rec.decisions[item.decisions.length - 1].recommendation = val;
                      updateItem(rec);
                    }}
                  />
                </Box>
              </Grid>
              <Grid>
                <SubmitButton
                  action={() => submitFunctionClicked(item)}
                  aria-label={`Submit review data for ${item.title}`}
                  data-testid={`submit-review-button-${item.id}`}
                  disabled={submitDisabled(item)}
                  toolTip="decisionSubmit.help"
                />
              </Grid>
            </Grid>

            <Box
              m={1}
              sx={{
                maxHeight: `calc(75vh - 100px)`,
                overflowY: 'auto',
                width: '99%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
                borderColor: 'divider',
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 2
              }}
            >
              <TextEntry
                label=""
                testId="finalCommentsId"
                rows={((FINAL_COMMENTS_HEIGHT / 100) * window.innerHeight) / 27}
                disabledUnderline
                setValue={(val: string) => {
                  const rec = item;
                  rec.comments = val;
                  updateItem(rec);
                }}
                value={item.comments}
              />
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

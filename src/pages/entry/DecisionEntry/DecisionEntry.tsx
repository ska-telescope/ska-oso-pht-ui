import { Box, Typography, Grid, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { CHOICE_TYPE, ChoiceCards } from '@/components/fields/choiceCards/choiceCards';
import SubmitButton from '@/components/button/Submit/Submit';
import {
  RECOMMENDATION_ACCEPT,
  RECOMMENDATION_ACCEPT_REVISION,
  RECOMMENDATION_REJECT
} from '@/utils/constants';
import { isReviewerAdminOnly } from '@/utils/aaa/aaaUtils';

const FINAL_COMMENTS_HEIGHT = 43;

interface DecisionEntryProps {
  item: {
    id: string | number;
    title: string;
    reviews: any[];
    decisions: {
      recommendation: string;
      comment: string;
    }[];
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
      recommendation === RECOMMENDATION_ACCEPT ||
      recommendation === RECOMMENDATION_ACCEPT_REVISION ||
      recommendation === RECOMMENDATION_REJECT
    );
  };

  const recommendedYes = (recommendation: string) => recommendation === RECOMMENDATION_ACCEPT;

  const hasComments = (item: any) =>
    recommendedYes(item?.decisions[item?.decisions?.length - 1]?.recommendation)
      ? true
      : item.comments?.length > 0;

  const submitDisabled = (item: any) => {
    return (
      isReviewerAdminOnly() ||
      !hasRecommendation(item?.decisions[item?.decisions?.length - 1]?.recommendation) ||
      !hasComments(item)
    );
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
                  {!isReviewerAdminOnly() && (
                    <ChoiceCards
                      choiceType={CHOICE_TYPE.RECOMMENDED}
                      label=""
                      value={item?.decisions[item?.decisions?.length - 1]?.recommendation ?? ''}
                      noWrap
                      onChange={(val: string) => {
                        const rec = item;
                        rec.decisions[item.decisions.length - 1].recommendation = val;
                        updateItem(rec);
                      }}
                    />
                  )}
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
                disabled={isReviewerAdminOnly()}
                label=""
                testId="finalCommentsId"
                rows={((FINAL_COMMENTS_HEIGHT / 100) * window.innerHeight) / 27}
                disabledUnderline
                setValue={(val: string) => {
                  // const rec = item;
                  // TODO : DB needs the field.
                  // rec.comments = val;
                  // updateItem(rec);
                }}
                value={item.decisions[0].comment}
              />
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

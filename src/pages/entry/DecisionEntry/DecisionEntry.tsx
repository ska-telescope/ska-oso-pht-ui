import { Box, Typography, Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import SubmitButton from '@/components/button/Submit/Submit';
import {
  RECOMMENDATION,
  RECOMMENDATION_ACCEPT,
  RECOMMENDATION_ACCEPT_REVISION,
  RECOMMENDATION_REJECT,
  RECOMMENDATION_STATUS_DECIDED,
  RECOMMENDATION_STATUS_IN_PROGRESS
} from '@/utils/constants';
import { isReviewerAdminOnly } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface DecisionEntryProps {
  item: {
    id: string | number;
    title: string;
    reviews: any[];
    decisions: {
      recommendation: string;
      status: string;
    }[];
  };
  calculateScore: (reviews: any[]) => number;
  updateItem: Function;
}

export default function DecisionEntry({ item, calculateScore, updateItem }: DecisionEntryProps) {
  const { t } = useScopedTranslation();

  const hasRecommendation = (recommendation: string) => {
    return (
      recommendation === RECOMMENDATION_ACCEPT ||
      recommendation === RECOMMENDATION_ACCEPT_REVISION ||
      recommendation === RECOMMENDATION_REJECT
    );
  };

  const submitDisabled = (item: any) => {
    return (
      isReviewerAdminOnly() ||
      !hasRecommendation(item?.decisions[item?.decisions?.length - 1]?.recommendation)
    );
  };

  const getOptions = () =>
    RECOMMENDATION.map(e => ({ label: t('recommendations.' + e), value: e }));

  return (
    <Box p={2}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
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
              {!isReviewerAdminOnly() && (
                <Box sx={{ minWidth: 300 }}>
                  <DropDown
                    label={t('recommendations.label')}
                    options={getOptions()}
                    required
                    setValue={(val: string) => {
                      const rec = item;
                      rec.decisions[item.decisions.length - 1].recommendation = val;
                      rec.decisions[
                        item.decisions.length - 1
                      ].status = RECOMMENDATION_STATUS_IN_PROGRESS;
                      updateItem(rec);
                    }}
                    testId={'recommendationDropdown'}
                    value={item?.decisions[item?.decisions?.length - 1]?.recommendation ?? ''}
                  />
                </Box>
              )}
            </Grid>
            <Grid>
              <SubmitButton
                action={() => {
                  const rec = item;
                  rec.decisions[item.decisions.length - 1].status = RECOMMENDATION_STATUS_DECIDED;
                  updateItem(rec);
                }}
                aria-label={`Submit review data for ${item.title}`}
                data-testid={`submit-review-button-${item.id}`}
                disabled={submitDisabled(item)}
                toolTip="decisionSubmit.help"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

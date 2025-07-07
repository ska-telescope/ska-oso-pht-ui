import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import BackButton from '@/components/button/Back/Back';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import { BANNER_PMT_SPACER, PMT } from '@/utils/constants';

export default function PanelReviewDecision() {
  const navigate = useNavigate();

  const backButton = () => (
    <BackButton
      action={() => navigate(PMT[4])}
      testId="reviewDecisionsListButtonTestId"
      title={'reviewDecisionsList.title'}
      toolTip="reviewDecisionsList.toolTip"
    />
  );

  return (
    <>
      <PageBannerPMT title={t('reviewDecision.title')} backBtn={backButton()} />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
    </>
  );
}

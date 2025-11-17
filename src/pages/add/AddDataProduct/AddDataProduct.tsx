import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import PageBannerPPT from '@/components/layout/pageBannerPPT/PageBannerPPT';
import { BANNER_PMT_SPACER, PAGE_DATA_PRODUCTS, PAGE_DATA_PRODUCTS_ADD } from '@/utils/constants';
import HelpShell from '@/components/layout/HelpShell/HelpShell';
import DataProduct from '@/pages/entry/DataProduct/DataProduct';

const BACK_PAGE = PAGE_DATA_PRODUCTS;
const PAGE = PAGE_DATA_PRODUCTS_ADD;

export default function AddDataProduct() {
  return (
    <HelpShell page={PAGE}>
      <Box pt={2} sx={{ height: '91vh', display: 'flex', flexDirection: 'column' }}>
        <PageBannerPPT backPage={BACK_PAGE} pageNo={PAGE} />
        <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
        <DataProduct />
      </Box>
    </HelpShell>
  );
}

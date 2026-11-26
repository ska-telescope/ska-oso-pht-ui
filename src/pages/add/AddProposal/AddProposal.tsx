import { Box } from '@mui/material';
import { PAGE_TITLE_ADD } from '@utils/constants.ts';
import Shell from '../../../components/layout/Shell/Shell';
import TitleEntry from '../../entry/TitleEntry/TitleEntry';

const PAGE = PAGE_TITLE_ADD;
const PAGE_INNER = 0;
const PAGE_FOOTER = -1;

// The new proposal template is set on cycle selection so here the
// form context is already populated and all we need to do is ask
// user to fill in the title and type before posting to the backend.
export default function AddProposal() {
  return (
    <Box
      sx={{
        pt: 2
      }}
    >
      <Shell page={PAGE} footerPage={PAGE_FOOTER} isNewProposal helpDisabled>
        <TitleEntry page={PAGE_INNER} />
      </Shell>
    </Box>
  );
}

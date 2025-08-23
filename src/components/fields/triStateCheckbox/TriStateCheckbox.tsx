import { Checkbox } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
type TriState = 'checked' | 'unchecked' | 'indeterminate';

interface TriStateCheckboxProps {
  state: TriState;
  setState: (newState: TriState) => void;
  colors?: boolean;
}

export default function TriStateCheckbox({
  state,
  setState,
  colors = false
}: TriStateCheckboxProps) {
  const theme = useTheme();

  const handleClick = () => {
    const nextState: TriState =
      state === 'unchecked' ? 'indeterminate' : state === 'indeterminate' ? 'checked' : 'unchecked';

    setState(nextState);
  };

  return (
    <Checkbox
      checked={state === 'checked'}
      indeterminate={state === 'indeterminate'}
      size={'medium'}
      onChange={handleClick}
      data-testId="triStateTestId"
      sx={{
        '& .MuiSvgIcon-root': { fontSize: 32 },
        color: colors ? theme.palette.error.main : theme.palette.secondary.main,
        '&.Mui-checked': {
          color: colors ? theme.palette.success.main : theme.palette.secondary.main
        },
        '&.MuiCheckbox-indeterminate': {
          color: colors ? theme.palette.warning.main : theme.palette.secondary.main
        }
      }}
    />
  );
}

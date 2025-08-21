import React from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import { Button, Grid2, Box, Typography, Paper } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { FEASIBLE_MAYBE, FEASIBLE_NO, FEASIBLE_YES } from '@/utils/constants';

interface ChoiceOption {
  value: string;
  label: string;
  icon: React.ComponentType;
  color: string;
  hoverColor: string;
}

interface ChoiceCardsProps {
  value?: string; // ChoiceValue;
  onChange?: (value: string) => void;
}

export function ChoiceCards({ value, onChange }: ChoiceCardsProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(value);

  React.useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const choices: ChoiceOption[] = [
    {
      value: FEASIBLE_YES,
      label: t(FEASIBLE_YES.toLowerCase()),
      icon: CheckIcon,
      color: theme.palette.success.main,
      hoverColor: theme.palette.success.main
    },
    {
      value: FEASIBLE_MAYBE,
      label: t(FEASIBLE_MAYBE.toLowerCase()),
      icon: HelpIcon,
      color: theme.palette.warning.main,
      hoverColor: theme.palette.warning.main
    },
    {
      value: FEASIBLE_NO,
      label: t(FEASIBLE_NO.toLowerCase()),
      icon: CloseIcon,
      color: theme.palette.error.main,
      hoverColor: theme.palette.error.main
    }
  ];

  const handleSelect = (choiceValue: string) => {
    setSelectedValue(choiceValue);
    onChange?.(choiceValue);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: '100%',
        height: '100px',
        backgroundColor: theme.palette.primary.main
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <Typography variant="h6" color="text.secondary">
          {t('feasibility.label')}
        </Typography>
      </Box>

      <Grid2 container spacing={2}>
        {choices.map(choice => {
          const Icon = choice.icon;
          const isSelected = selectedValue === choice.value;

          return (
            <Grid2 size={{ xs: 4 }} key={choice.value}>
              <Button
                onClick={() => handleSelect(choice.value)}
                fullWidth
                variant="outlined"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderRadius: 1,
                  borderWidth: 2,
                  borderColor: choice.color,
                  backgroundColor: isSelected ? choice.color : theme.palette.secondary.contrastText,
                  color: isSelected ? 'white' : choice.color,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'white',
                    backgroundColor: isSelected ? choice.color : choice.hoverColor,
                    borderColor: choice.color,
                    transform: 'scale(1.05)'
                  },
                  '&:active': {
                    borderColor: choice.color
                  },
                  '&:focus': {
                    outline: 'none',
                    boxShadow: `0 0 0 2px ${choice.color}40`
                  }
                }}
              >
                <Icon />
                <Typography variant="body1" fontWeight="medium">
                  {choice.label}
                </Typography>
              </Button>
            </Grid2>
          );
        })}
      </Grid2>
      {selectedValue && selectedValue !== FEASIBLE_YES && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('feasibility.info')}
        </Typography>
      )}
    </Paper>
  );
}

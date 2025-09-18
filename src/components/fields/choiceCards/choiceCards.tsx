import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import { Button, Grid, Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FEASIBLE_MAYBE, FEASIBLE_NO, FEASIBLE_YES } from '@/utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ChoiceOption {
  value: string;
  label: string;
  icon: React.ComponentType;
  color: string;
  hoverColor: string;
  styledIcon?: boolean;
}

interface ChoiceCardsProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function ChoiceCards({ value, onChange }: ChoiceCardsProps) {
  const { t } = useScopedTranslation();
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
      hoverColor: theme.palette.success.dark,
      styledIcon: true
    },
    {
      value: FEASIBLE_NO,
      label: t(FEASIBLE_NO.toLowerCase()),
      icon: CloseIcon,
      color: theme.palette.error.main,
      hoverColor: theme.palette.error.dark,
      styledIcon: true
    },
    {
      value: FEASIBLE_MAYBE,
      label: t(FEASIBLE_MAYBE.toLowerCase()),
      icon: HelpIcon,
      color: theme.palette.warning.main,
      hoverColor: theme.palette.warning.dark,
      styledIcon: false
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
        gap: 2,
        width: '100%',
        padding: 2,
        bgcolor: `${theme.palette.primary.main}`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" color="text.secondary">
          {t('feasibility.label')}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {choices.slice(0, 2).map(choice => {
          const Icon = choice.icon;
          const isSelected = selectedValue === choice.value;

          return (
            <Grid size={{ xs: 6 }} key={choice.value}>
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
                  backgroundColor: isSelected ? choice.color : theme.palette.background.default,
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
                <Box
                  sx={{
                    backgroundColor: choice.color,
                    borderRadius: '50%',
                    padding: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {choice.label}
                </Typography>
              </Button>
            </Grid>
          );
        })}
      </Grid>

      {/* Maybe button below */}
      {(() => {
        const maybe = choices.find(c => c.value === FEASIBLE_MAYBE);
        if (!maybe) return null;
        const Icon = maybe.icon;
        const isSelected = selectedValue === maybe.value;

        return (
          <Box key={maybe.value} sx={{ mt: 2 }}>
            <Button
              onClick={() => handleSelect(maybe.value)}
              fullWidth
              variant="outlined"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 1,
                borderWidth: 2,
                borderColor: maybe.color,
                backgroundColor: isSelected ? maybe.color : theme.palette.background.default,
                color: isSelected ? 'white' : maybe.color,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  color: 'white',
                  backgroundColor: isSelected ? maybe.color : maybe.hoverColor,
                  borderColor: maybe.color,
                  transform: 'scale(1.05)'
                },
                '&:active': {
                  borderColor: maybe.color
                },
                '&:focus': {
                  outline: 'none',
                  boxShadow: `0 0 0 2px ${maybe.color}40`
                }
              }}
            >
              <Icon sx={{ color: maybe.color, fontSize: 30 }} />
              <Typography variant="body1" fontWeight="medium">
                {maybe.label}
              </Typography>
            </Button>
          </Box>
        );
      })()}

      {selectedValue && selectedValue !== FEASIBLE_YES && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {t('feasibility.info')}
        </Typography>
      )}
    </Paper>
  );
}

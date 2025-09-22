import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import { Button, Grid, Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  FEASIBLE_MAYBE,
  FEASIBLE_NO,
  FEASIBLE_YES,
  RECOMMENDATION_ACCEPT,
  RECOMMENDATION_ACCEPT_REVISION,
  RECOMMENDATION_REJECT
} from '@/utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export const FEASIBLE = 'feasible';
export const RECOMMENDED = 'recommended';
export enum CHOICE_TYPE {
  FEASIBLE,
  RECOMMENDED
}

interface ChoiceOption {
  value: string;
  label: string;
  icon: React.ElementType;
  color: string;
  hoverColor: string;
  styledIcon?: boolean;
}

interface ChoiceCardsProps {
  choiceType?: CHOICE_TYPE;
  colorBG?: string;
  label?: string;
  noWrap?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export function ChoiceCards({
  choiceType = CHOICE_TYPE.FEASIBLE,
  colorBG = 'transparent',
  label = 'feasibility.label',
  noWrap = false,
  value,
  onChange
}: ChoiceCardsProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(value);

  React.useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const choicesFeasible: ChoiceOption[] = [
    {
      value: FEASIBLE_YES,
      label: t(FEASIBLE_YES.toLowerCase()),
      icon: CheckIcon,
      color: theme.palette.success.main,
      hoverColor: theme.palette.success.dark,
      styledIcon: true
    },
    {
      value: FEASIBLE_MAYBE,
      label: t(FEASIBLE_MAYBE.toLowerCase()),
      icon: HelpIcon,
      color: theme.palette.warning.main,
      hoverColor: theme.palette.warning.dark,
      styledIcon: false
    },
    {
      value: FEASIBLE_NO,
      label: t(FEASIBLE_NO.toLowerCase()),
      icon: CloseIcon,
      color: theme.palette.error.main,
      hoverColor: theme.palette.error.dark,
      styledIcon: true
    }
  ];

  const choicesRecommendation: ChoiceOption[] = [
    {
      value: RECOMMENDATION_ACCEPT,
      label: t('recommendations.' + RECOMMENDATION_ACCEPT),
      icon: CheckIcon,
      color: theme.palette.success.main,
      hoverColor: theme.palette.success.dark,
      styledIcon: true
    },
    {
      value: RECOMMENDATION_ACCEPT_REVISION,
      label: t('recommendations.' + RECOMMENDATION_ACCEPT_REVISION),
      icon: HelpIcon,
      color: theme.palette.warning.main,
      hoverColor: theme.palette.warning.dark,
      styledIcon: false
    },
    {
      value: RECOMMENDATION_REJECT,
      label: t('recommendations.' + RECOMMENDATION_REJECT),
      icon: CloseIcon,
      color: theme.palette.error.main,
      hoverColor: theme.palette.error.dark,
      styledIcon: true
    }
  ];

  const getChoices = () =>
    choiceType === CHOICE_TYPE.FEASIBLE ? choicesFeasible : choicesRecommendation;
  const handleSelect = (choiceValue: string) => {
    setSelectedValue(choiceValue);
    onChange?.(choiceValue);
  };

  const isMiddleChoice = (value: string) =>
    value === FEASIBLE_MAYBE || value === RECOMMENDATION_ACCEPT_REVISION;

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        padding: 2,
        bgcolor: colorBG
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" color="text.secondary">
          {label.length ? t(label) : ''}
        </Typography>
      </Box>

      {noWrap ? (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          {getChoices().map(choice => {
            const Icon = choice.icon;
            const isSelected = selectedValue === choice.value;

            return (
              <Button
                key={choice.value}
                onClick={() => handleSelect(choice.value)}
                variant="outlined"
                sx={{
                  flex: 1,
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
                {isMiddleChoice(choice.value) ? (
                  <Icon sx={{ color: isSelected ? 'white' : choice.color, fontSize: 30 }} />
                ) : (
                  <Box
                    sx={{
                      backgroundColor: isSelected ? 'white' : choice.color,
                      borderRadius: '50%',
                      padding: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon sx={{ color: isSelected ? choice.color : 'white', fontSize: 20 }} />
                  </Box>
                )}
                <Typography variant="body1" fontWeight="medium">
                  {choice.label}
                </Typography>
              </Button>
            );
          })}
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {getChoices()
              .filter(c => c.value !== FEASIBLE_MAYBE)
              .map(choice => {
                const Icon = choice.icon;
                const isSelected = selectedValue === choice.value;

                return (
                  <Grid size={{ xs: 6 }} key={choice.value}>
                    <Button
                      onClick={() => handleSelect(choice.value)}
                      fullWidth
                      variant="outlined"
                      sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        borderRadius: 1,
                        borderWidth: 2,
                        borderColor: choice.color,
                        backgroundColor: isSelected
                          ? choice.color
                          : theme.palette.background.default,
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
            const maybe = getChoices().find(c => c.value === FEASIBLE_MAYBE);
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
                  <Icon sx={{ color: isSelected ? 'white' : maybe.color, fontSize: 30 }} />
                  <Typography variant="body1" fontWeight="medium">
                    {maybe.label}
                  </Typography>
                </Button>
              </Box>
            );
          })()}
        </>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ minHeight: '25px' }}>
        {selectedValue && selectedValue !== FEASIBLE_YES ? t('feasibility.info') : ''}
      </Typography>
    </Paper>
  );
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pht from '@/locales/en/pht.json';
import sv from '@/locales/en/sv.json';

void i18n.use(initReactI18next).init({
  resources: {
    en: { pht, sv }
  },
  fallbackNS: 'pht',
  fallbackLng: 'en',
  lng: 'en',
  ns: ['sv', 'pht'],
  defaultNS: 'pht',
  initAsync: false,
  debug: false,
  interpolation: {
    escapeValue: false
  }
});

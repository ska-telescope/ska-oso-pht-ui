import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import moment from 'moment';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath:
        window.location.hostname === 'localhost'
          ? '/locales/{{lng}}/{{ns}}.json'
          : './locales/{{lng}}/{{ns}}.json'
    },
    fallbackNS: 'pht',
    fallbackLng: 'en',
    lng: 'en',
    ns: ['sv', 'pht'],
    defaultNS: 'pht',
    initImmediate: false,
    useSuspense: true,
    debug: false,
    interpolation: {
      escapeValue: false,
      format(value, format) {
        if (value instanceof Date) {
          return moment(value).format(format);
        }
        if (typeof value === 'number') {
          return new Intl.NumberFormat().format(value);
        }
        return typeof value;
      }
    }
  });

export default i18n;

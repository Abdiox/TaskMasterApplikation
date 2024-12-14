import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

import en from "./locales/en.json";
import da from "./locales/da.json";

const fallback = { languageTag: "en", isRTL: false };
const { languageTag } = RNLocalize.findBestAvailableLanguage(["en", "da"]) || fallback;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    da: { translation: da },
  },
  lng: languageTag,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

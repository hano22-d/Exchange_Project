import {
  US,
  EU,
  CH,
  TR,
  IQ,
  SY,
  GB,
  CA,
  AU,
  JP,
  CN,
  AE,
  SA,
  KW,
  QA,
  EG,
  JO,
  LB,
  BH,
  OM,
  NZ,
  SG,
  HK,
  IN,
  PK,
  KR,
  ZA,
  BR,
  MX,
  SE,
  NO,
  DK,
  PL,
  CZ,
  TH,
  MY,
  ID,
  PH,
  IL,
} from "country-flag-icons/react/3x2";

export const SUPPORTED_CURRENCIES = Object.freeze(
  [
    {
      code: "CHF",
      nameAr: "الفرنك السويسري",
      nameEn: "Swiss Franc",
      FlagComponent: CH,
    },
    { code: "EUR", nameAr: "اليورو", nameEn: "Euro", FlagComponent: EU },
    {
      code: "USD",
      nameAr: "الدولار الأمريكي",
      nameEn: "US Dollar",
      FlagComponent: US,
    },
    {
      code: "TRY",
      nameAr: "الليرة التركية",
      nameEn: "Turkish Lira",
      FlagComponent: TR,
    },
    {
      code: "IQD",
      nameAr: "الدينار العراقي",
      nameEn: "Iraqi Dinar",
      FlagComponent: IQ,
    },
    {
      code: "SYP",
      nameAr: "الليرة السورية",
      nameEn: "Syrian Pound",
      FlagComponent: SY,
    },
    {
      code: "GBP",
      nameAr: "الجنيه الإسترليني",
      nameEn: "Pound Sterling",
      FlagComponent: GB,
    },
    {
      code: "CAD",
      nameAr: "الدولار الكندي",
      nameEn: "Canadian Dollar",
      FlagComponent: CA,
    },
    {
      code: "AUD",
      nameAr: "الدولار الأسترالي",
      nameEn: "Australian Dollar",
      FlagComponent: AU,
    },
    {
      code: "JPY",
      nameAr: "الين الياباني",
      nameEn: "Japanese Yen",
      FlagComponent: JP,
    },
    {
      code: "CNY",
      nameAr: "اليوان الصيني",
      nameEn: "Chinese Yuan",
      FlagComponent: CN,
    },
    {
      code: "AED",
      nameAr: "الدرهم الإماراتي",
      nameEn: "UAE Dirham",
      FlagComponent: AE,
    },
    {
      code: "SAR",
      nameAr: "الريال السعودي",
      nameEn: "Saudi Riyal",
      FlagComponent: SA,
    },
    {
      code: "KWD",
      nameAr: "الدينار الكويتي",
      nameEn: "Kuwaiti Dinar",
      FlagComponent: KW,
    },
    {
      code: "QAR",
      nameAr: "الريال القطري",
      nameEn: "Qatari Riyal",
      FlagComponent: QA,
    },
    {
      code: "EGP",
      nameAr: "الجنيه المصري",
      nameEn: "Egyptian Pound",
      FlagComponent: EG,
    },
    {
      code: "JOD",
      nameAr: "الدينار الأردني",
      nameEn: "Jordanian Dinar",
      FlagComponent: JO,
    },
    {
      code: "LBP",
      nameAr: "الليرة اللبنانية",
      nameEn: "Lebanese Pound",
      FlagComponent: LB,
    },
    {
      code: "BHD",
      nameAr: "الدينار البحريني",
      nameEn: "Bahraini Dinar",
      FlagComponent: BH,
    },
    {
      code: "OMR",
      nameAr: "الريال العماني",
      nameEn: "Omani Rial",
      FlagComponent: OM,
    },
    {
      code: "NZD",
      nameAr: "الدولار النيوزيلندي",
      nameEn: "New Zealand Dollar",
      FlagComponent: NZ,
    },
    {
      code: "SGD",
      nameAr: "الدولار السنغافوري",
      nameEn: "Singapore Dollar",
      FlagComponent: SG,
    },
    {
      code: "HKD",
      nameAr: "دولار هونغ كونغ",
      nameEn: "Hong Kong Dollar",
      FlagComponent: HK,
    },
    {
      code: "INR",
      nameAr: "الروبية الهندية",
      nameEn: "Indian Rupee",
      FlagComponent: IN,
    },
    {
      code: "PKR",
      nameAr: "الروبية الباكستانية",
      nameEn: "Pakistani Rupee",
      FlagComponent: PK,
    },
    {
      code: "KRW",
      nameAr: "الوون الكوري الجنوبي",
      nameEn: "South Korean Won",
      FlagComponent: KR,
    },
    {
      code: "ZAR",
      nameAr: "الراند الجنوب أفريقي",
      nameEn: "South African Rand",
      FlagComponent: ZA,
    },
    {
      code: "BRL",
      nameAr: "الريال البرازيلي",
      nameEn: "Brazilian Real",
      FlagComponent: BR,
    },
    {
      code: "MXN",
      nameAr: "البيزو المكسيكي",
      nameEn: "Mexican Peso",
      FlagComponent: MX,
    },
    {
      code: "SEK",
      nameAr: "الكرونة السويدية",
      nameEn: "Swedish Krona",
      FlagComponent: SE,
    },
    {
      code: "NOK",
      nameAr: "الكرونة النرويجية",
      nameEn: "Norwegian Krone",
      FlagComponent: NO,
    },
    {
      code: "DKK",
      nameAr: "الكرونة الدنماركية",
      nameEn: "Danish Krone",
      FlagComponent: DK,
    },
    {
      code: "PLN",
      nameAr: "الزلوتي البولندي",
      nameEn: "Polish Zloty",
      FlagComponent: PL,
    },
    {
      code: "CZK",
      nameAr: "الكورونا التشيكية",
      nameEn: "Czech Koruna",
      FlagComponent: CZ,
    },
    {
      code: "THB",
      nameAr: "البات التايلندي",
      nameEn: "Thai Baht",
      FlagComponent: TH,
    },
    {
      code: "MYR",
      nameAr: "الرينغيت الماليزي",
      nameEn: "Malaysian Ringgit",
      FlagComponent: MY,
    },
    {
      code: "IDR",
      nameAr: "الروبية الإندونيسية",
      nameEn: "Indonesian Rupiah",
      FlagComponent: ID,
    },
    {
      code: "PHP",
      nameAr: "البيزو الفلبيني",
      nameEn: "Philippine Peso",
      FlagComponent: PH,
    },
    {
      code: "ILS",
      nameAr: "الشيكل الإسرائيلي",
      nameEn: "Israeli New Shekel",
      FlagComponent: IL,
    },
  ].map((currency) => Object.freeze(currency))
);

const supportedCurrencyCodes = new Set(
  SUPPORTED_CURRENCIES.map(({ code }) => code)
);

export function normalizeCurrencyCode(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toUpperCase();
}

/* التحقق من أن العملة موجودة في قائمة العملات المدعومة */
export function isSupportedCurrency(value) {
  const code = normalizeCurrencyCode(value);

  return supportedCurrencyCodes.has(code);
}

/* جلب بيانات عملة واحدة من القائمة */
export function getSupportedCurrency(code) {
  const normalizedCode = normalizeCurrencyCode(code);

  return SUPPORTED_CURRENCIES.find(
    (currency) => currency.code === normalizedCode
  );
}

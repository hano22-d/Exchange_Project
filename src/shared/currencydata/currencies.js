export const SUPPORTED_CURRENCIES = Object.freeze([
    { code: "CHF", nameAr: "الفرنك السويسري", nameEn: "Swiss Franc" },
    { code: "EUR", nameAr: "اليورو", nameEn: "Euro" },
    { code: "USD", nameAr: "الدولار الأمريكي", nameEn: "US Dollar" },
    { code: "TRY", nameAr: "الليرة التركية", nameEn: "Turkish Lira" },
    { code: "IQD", nameAr: "الدينار العراقي", nameEn: "Iraqi Dinar" },
    { code: "SYP", nameAr: "الليرة السورية", nameEn: "Syrian Pound" },
    { code: "GBP", nameAr: "الجنيه الإسترليني", nameEn: "Pound Sterling" },
    { code: "CAD", nameAr: "الدولار الكندي", nameEn: "Canadian Dollar" },
    { code: "AUD", nameAr: "الدولار الأسترالي", nameEn: "Australian Dollar" },
    { code: "JPY", nameAr: "الين الياباني", nameEn: "Japanese Yen" },
    { code: "CNY", nameAr: "اليوان الصيني", nameEn: "Chinese Yuan" },
    { code: "AED", nameAr: "الدرهم الإماراتي", nameEn: "UAE Dirham" },
    { code: "SAR", nameAr: "الريال السعودي", nameEn: "Saudi Riyal" },
    { code: "KWD", nameAr: "الدينار الكويتي", nameEn: "Kuwaiti Dinar" },
    { code: "QAR", nameAr: "الريال القطري", nameEn: "Qatari Riyal" },
    { code: "EGP", nameAr: "الجنيه المصري", nameEn: "Egyptian Pound" },
    { code: "JOD", nameAr: "الدينار الأردني", nameEn: "Jordanian Dinar" },
    { code: "LBP", nameAr: "الليرة اللبنانية", nameEn: "Lebanese Pound" },
    { code: "BHD", nameAr: "الدينار البحريني", nameEn: "Bahraini Dinar" },
    { code: "OMR", nameAr: "الريال العماني", nameEn: "Omani Rial" },
    { code: "NZD", nameAr: "الدولار النيوزيلندي", nameEn: "New Zealand Dollar" },
    { code: "SGD", nameAr: "الدولار السنغافوري", nameEn: "Singapore Dollar" },
    { code: "HKD", nameAr: "دولار هونغ كونغ", nameEn: "Hong Kong Dollar" },
    { code: "INR", nameAr: "الروبية الهندية", nameEn: "Indian Rupee" },
    { code: "PKR", nameAr: "الروبية الباكستانية", nameEn: "Pakistani Rupee" },
    { code: "KRW", nameAr: "الوون الكوري الجنوبي", nameEn: "South Korean Won" },
    { code: "ZAR", nameAr: "الراند الجنوب أفريقي", nameEn: "South African Rand" },
    { code: "BRL", nameAr: "الريال البرازيلي", nameEn: "Brazilian Real" },
    { code: "MXN", nameAr: "البيزو المكسيكي", nameEn: "Mexican Peso" },
    { code: "SEK", nameAr: "الكرونة السويدية", nameEn: "Swedish Krona" },
    { code: "NOK", nameAr: "الكرونة النرويجية", nameEn: "Norwegian Krone" },
    { code: "DKK", nameAr: "الكرونة الدنماركية", nameEn: "Danish Krone" },
    { code: "PLN", nameAr: "الزلوتي البولندي", nameEn: "Polish Zloty" },
    { code: "CZK", nameAr: "الكورونا التشيكية", nameEn: "Czech Koruna" },
    { code: "THB", nameAr: "البات التايلندي", nameEn: "Thai Baht" },
    { code: "MYR", nameAr: "الرينغيت الماليزي", nameEn: "Malaysian Ringgit" },
    { code: "IDR", nameAr: "الروبية الإندونيسية", nameEn: "Indonesian Rupiah" },
    { code: "PHP", nameAr: "البيزو الفلبيني", nameEn: "Philippine Peso" },
    { code: "ILS", nameAr: "الشيكل الإسرائيلي", nameEn: "Israeli New Shekel" },
  ].map((currency) => Object.freeze(currency)));
  
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
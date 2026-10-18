import {
  SUPPORTED_CURRENCIES,
  normalizeCurrencyCode,
  isSupportedCurrency,
} from "./currencies.js";

function generateExchangePairs() {
  const currencyCodes = SUPPORTED_CURRENCIES.map(({ code }) => code);

  const pairs = [];

  for (let i = 0; i < currencyCodes.length; i++) {
    for (let j = i + 1; j < currencyCodes.length; j++) {
      const referenceFromCurrency = currencyCodes[i];
      const referenceToCurrency = currencyCodes[j];

      // الاتجاه المرجعي ضرب
      pairs.push({
        fromCurrency: referenceFromCurrency,
        toCurrency: referenceToCurrency,
        calculationType: "multiply",

        referenceFromCurrency,
        referenceToCurrency,
      });

      // الاتجاه المعاكس قسمة
      pairs.push({
        fromCurrency: referenceToCurrency,
        toCurrency: referenceFromCurrency,
        calculationType: "divide",

        referenceFromCurrency,
        referenceToCurrency,
      });
    }
  }

  return Object.freeze(pairs.map((pair) => Object.freeze(pair)));
}

export const EXCHANGE_PAIRS = generateExchangePairs();

/* إنشاء فهرس سريع للبحث عن قاعدة الزوج
    المفتاح:
    "USD-SYP"
   
    القيمة:
     كائن يحتوي على طريقة الحساب واتجاه السعر المرجعي.
   */
const exchangePairsByKey = new Map(
  EXCHANGE_PAIRS.map((pair) => [
    `${pair.fromCurrency}-${pair.toCurrency}`,
    pair,
  ])
);

/*
    جلب قاعدة زوج العملات واتجاه السعر المرجعي.
   
    تعيد undefined عندما تكون العملة غير مدعومة،
    أو عندما تكون العملتان متماثلتين
   */
export function getExchangePairRule(fromCurrency, toCurrency) {
  const from = normalizeCurrencyCode(fromCurrency);
  const to = normalizeCurrencyCode(toCurrency);

  if (!isSupportedCurrency(from) || !isSupportedCurrency(to)) {
    return undefined;
  }

  if (from === to) {
    return undefined;
  }

  return exchangePairsByKey.get(`${from}-${to}`);
}

/*
    إرجاع طريقة الحساب فقط لتبسيط استخدام الخدمة.
    النتيجة: "multiply" أو"divide"
 */
export function getExchangeCalculationType(fromCurrency, toCurrency) {
  return getExchangePairRule(fromCurrency, toCurrency)?.calculationType;
}

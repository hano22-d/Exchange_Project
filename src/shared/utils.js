import { getSupportedCurrency } from "./currencydata/currencies";
import { getExchangeCalculationType } from "./currencydata/exchange-pairs";

/* ==================== 
   دالة تنسيق الارقام 
   ==================== */
const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return numberFormatter.format(number);
}

// ============ دالة حساب المبلغ الناتج ============ //
export function calculateTargetAmount(fromAmount, rate, calculationType) {
  const amount = Number(fromAmount);
  const exchangeRate = Number(rate);

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(exchangeRate) ||
    amount <= 0 ||
    exchangeRate <= 0
  ) {
    throw new RangeError("Amount and rate must be valid positive numbers.");
  }

  let result;

  if (calculationType === "multiply") {
    result = amount * exchangeRate;
  } else if (calculationType === "divide") {
    result = amount / exchangeRate;
  } else {
    throw new Error(`Invalid calculation type: ${calculationType}`);
  }

  if (!Number.isFinite(result) || result <= 0) {
    throw new RangeError("Calculated target amount is invalid.");
  }

  const roundedResult = Number(result.toFixed(4));

  if (!Number.isFinite(roundedResult) || roundedResult <= 0) {
    throw new RangeError("Calculated target amount is too small or invalid.");
  }

  return roundedResult;
}

// حساب toAmount
export function calculateToAmount(exchangeForm) {
  const fromCurrency = exchangeForm.fromCurrency.trim().toUpperCase();
  const toCurrency = exchangeForm.toCurrency.trim().toUpperCase();
  const fromAmount = Number(exchangeForm.fromAmount);
  const rate = Number(exchangeForm.rate);

  if (!fromCurrency || !toCurrency || !fromAmount || !rate) {
    return null;
  }

  const calulateType = getExchangeCalculationType(fromCurrency, toCurrency);

  return calculateTargetAmount(fromAmount, rate, calulateType);
}

// دالة استخراج عملات الصناديق المنشأة
export function viewCreatedCashboxes(cashboxes) {
 return cashboxes.map((cashbox) => {
    if (!cashbox) {
      return null;
    }
    const getNameAr = getSupportedCurrency(cashbox.currency).nameAr;
    const currencyLabel = `${cashbox.currency} - ${getNameAr}`;

    return {
      value: cashbox.currency,
      currencyLabel,
    };
  });
}

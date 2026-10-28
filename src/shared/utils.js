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
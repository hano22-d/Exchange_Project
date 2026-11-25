import { useState, useCallback } from "react";

function roundBalance(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Number(numericValue.toFixed(2));
}

export default function useReconcileBalances(cashboxes = []) {
  const [mismatchedBalances, setMismatchedBalances] = useState([]);

  // ========================================
  // التحقق من مطابقة الأرصدة
  // ========================================

  const reconcileBalances = useCallback(
    (currenciesForm = {}) => {
      // التأكد من وجود صناديق يمكن مطابقتها
      if (!Array.isArray(cashboxes) || cashboxes.length === 0) {
        setMismatchedBalances([]);

        return {
          status: "unavailable",
          matched: false,
          mismatches: [],
        };
      }

      const mismatches = [];

      for (const cashbox of cashboxes) {
        const enteredBalance = currenciesForm[cashbox.currency] ?? "";

        // الرصيد الفعلي
        const actualBalance = roundBalance(cashbox.balance);

        // الرصيد الذي أدخله المستخدم
        const formBalance = roundBalance(enteredBalance);

        const isActualBalanceValid = actualBalance !== null;

        const isFormBalanceValid = formBalance !== null;

        // هل الرصيدان متطابقان؟
        const isMatched =
          isActualBalanceValid &&
          isFormBalanceValid &&
          actualBalance === formBalance;

        if (!isMatched) {
          // حساب الفرق عندما تكون القيمتان صالحتين
          const balanceDifference =
            isActualBalanceValid && isFormBalanceValid
              ? roundBalance(actualBalance - formBalance)
              : null;

          const mismatchData = {
            currency: cashbox.currency,
            currencyName: cashbox.currencyNameAr,
            balance: cashbox.balance,
            formBalance: enteredBalance,
            difference: balanceDifference,
          };

          mismatches.push(mismatchData);
        }
      }

      // استبدال نتائج المطابقة السابقة
      setMismatchedBalances(mismatches);

      // إعادة نتيجة العملية
      return {
        status: "completed",
        matched: mismatches.length === 0,
        mismatches,
      };
    },
    [cashboxes]
  );

  return {
    mismatchedBalances,
    reconcileBalances,
  };
}

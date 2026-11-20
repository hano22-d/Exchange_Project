import { useEffect, useState } from "react";
import { getTodayDateRange } from "../../shared/utilsDate";

export default function useTodayDateRange() {
  const [dateRange, setDateRange] = useState(getTodayDateRange);

  useEffect(() => {
    const timeUntilTomorrow = dateRange.dateToExclusiveTimestamp - Date.now();

    const timeoutId = setTimeout(() => {
      setDateRange(getTodayDateRange());
    }, Math.max(timeUntilTomorrow + 100, 1000));

    return () => clearTimeout(timeoutId);
  }, [dateRange.dateToExclusiveTimestamp]);

  return dateRange;
}

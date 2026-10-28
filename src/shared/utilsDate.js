export const SYRIA_TIME_ZONE = "Asia/Damascus";

const formattersCache = new Map();

function getDateTimeFormatter(timeZone) {
  if (!formattersCache.has(timeZone)) {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    formattersCache.set(timeZone, formatter);
  }

  return formattersCache.get(timeZone);
}

// إنشاء Timestamp لتاريخ ووقت نعتبرهما UTC مؤقتًا.
function createUtcTimestamp(
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0
) {
  const date = new Date(0);

  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);

  return date.getTime();
}

// تحليل تاريخ بصيغة YYYY-MM-DD والتحقق من صحته
function parseDateOnly(dateString) {
  if (typeof dateString !== "string") {
    throw new TypeError("Date must be a string.");
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    throw new RangeError("Date must use YYYY-MM-DD format.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const validationDate = new Date(0);
  validationDate.setUTCFullYear(year, month - 1, day);
  validationDate.setUTCHours(0, 0, 0, 0);

  if (
    validationDate.getUTCFullYear() !== year ||
    validationDate.getUTCMonth() !== month - 1 ||
    validationDate.getUTCDate() !== day
  ) {
    throw new RangeError("Invalid calendar date.");
  }

  return { year, month, day };
}

/* استخراج التاريخ والوقت اللذين يقابلهما Timestamp داخل المنطقة الزمنية المطلوبة */
function getZonedDateTimeParts(timestamp, timeZone) {
  const parts = getDateTimeFormatter(timeZone).formatToParts(
    new Date(timestamp)
  );

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  }

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

// حساب فرق المنطقة الزمنية عند لحظة محددة
function getTimeZoneOffsetMilliseconds(timestamp, timeZone) {
  const wholeSecondTimestamp = Math.floor(timestamp / 1000) * 1000;

  const parts = getZonedDateTimeParts(wholeSecondTimestamp, timeZone);

  const equivalentUtcTimestamp = createUtcTimestamp(
    parts.year,
    parts.month,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return equivalentUtcTimestamp - wholeSecondTimestamp;
}

// تحويل تاريخ ووقت في منطقة زمنية معينة إلى Timestamp.
function getTimestampForZonedDateTime(parts, timeZone = SYRIA_TIME_ZONE) {
  const desiredTimestamp = createUtcTimestamp(
    parts.year,
    parts.month,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  let candidate = desiredTimestamp;
  let converged = false;

  // نحسب الفرق الزمني ثم نصحح القيمة حتى نصل إلى اللحظة المطلوبة.
  for (let attempt = 0; attempt < 6; attempt++) {
    const offset = getTimeZoneOffsetMilliseconds(candidate, timeZone);

    const nextCandidate = desiredTimestamp - offset;

    if (nextCandidate === candidate) {
      converged = true;
      break;
    }

    candidate = nextCandidate;
  }

  if (!converged) {
    throw new RangeError(`Could not resolve this date in ${timeZone}.`);
  }

  // نتأكد أن التحويل أعاد التاريخ والوقت المطلوبين فعلًا.
  const actual = getZonedDateTimeParts(candidate, timeZone);

  const fields = ["year", "month", "day", "hour", "minute", "second"];

  const matches = fields.every((field) => actual[field] === parts[field]);

  if (!matches) {
    throw new RangeError(
      `The requested local time could not be resolved in ${timeZone}.`
    );
  }

  return candidate;
}

// بداية اليوم وفق المنطقة الزمنية المطلوبة، وليس توقيت الجهاز.
export function getStartOfDayTimestamp(dateString, timeZone = SYRIA_TIME_ZONE) {
  const { year, month, day } = parseDateOnly(dateString);

  return getTimestampForZonedDateTime(
    {
      year,
      month,
      day,
      hour: 0,
      minute: 0,
      second: 0,
    },
    timeZone
  );
}

// تكوين تاريخ اليوم التالي دون الاعتماد على توقيت الجهاز.
function getNextCalendarDate(dateString) {
  const { year, month, day } = parseDateOnly(dateString);

  const nextDate = new Date(0);

  nextDate.setUTCFullYear(year, month - 1, day + 1);
  nextDate.setUTCHours(0, 0, 0, 0);

  const nextYear = String(nextDate.getUTCFullYear()).padStart(4, "0");
  const nextMonth = String(nextDate.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(nextDate.getUTCDate()).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

// بداية اليوم التالي، وهو الحد الأعلى غير المشمول.
export function getStartOfNextDayTimestamp(
  dateString,
  timeZone = SYRIA_TIME_ZONE
) {
  const nextDateString = getNextCalendarDate(dateString);

  return getStartOfDayTimestamp(nextDateString, timeZone);
}

// تحويل فلاتر التاريخ القادمة من الواجهة إلى حدود رقمية.
export function buildTimestampDateRange(
  { dateFrom, dateTo },
  timeZone = SYRIA_TIME_ZONE
) {
  const hasDateFrom = Boolean(dateFrom);
  const hasDateTo = Boolean(dateTo);

  if (hasDateFrom) {
    parseDateOnly(dateFrom);
  }

  if (hasDateTo) {
    parseDateOnly(dateTo);
  }

  if (hasDateFrom && hasDateTo && dateFrom > dateTo) {
    throw new RangeError("The start date cannot be after the end date.");
  }

  return {
    dateFromTimestamp: hasDateFrom
      ? getStartOfDayTimestamp(dateFrom, timeZone)
      : undefined,

    dateToExclusiveTimestamp: hasDateTo
      ? getStartOfNextDayTimestamp(dateTo, timeZone)
      : undefined,
  };
}

/* تحويل قيمة datetime-local إلى لحظة زمنية 
نحتاج هذه الدالة إذا سمحنا للمستخدم بتحديد وقت الحركة يدويًا */
export function getTimestampFromDateTimeLocal(
  dateTimeString,
  timeZone = SYRIA_TIME_ZONE
) {
  if (typeof dateTimeString !== "string") {
    throw new TypeError("Date-time must be a string.");
  }

  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    dateTimeString
  );

  if (!match) {
    throw new Error(
      "تاريخ الحركة غير صالح، يرجى إدخال التاريخ والوقت بالشكل الصحيح."
    );
  }

  const { year, month, day } = parseDateOnly(match[1]);
  const hour = Number(match[2]);
  const minute = Number(match[3]);
  const second = Number(match[4] ?? 0);

  if (hour > 23 || minute > 59 || second > 59) {
    throw new RangeError("Invalid time.");
  }

  return getTimestampForZonedDateTime(
    { year, month, day, hour, minute, second },
    timeZone
  );
}

// تنسيق التاريخ والساعة والدقائق وفق توقيت سوريا (تستخدم اثناءالعرض)
export function formatSyriaDateTime(timestamp, locale = "en-SY") {
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return new Date(timestamp).toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: SYRIA_TIME_ZONE,
  });
}

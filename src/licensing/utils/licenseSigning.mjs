/*
وتطبيق رياكت ايضا  node هذا الملف يستخدم في أداة
(التوقيع في فيnode, التحقق في رياكت) لانه يجعل شكل كائن الترخيص موحدا عند الاثنين
*/

//ثابت سياق التوقيع واصداره
export const LICENSE_SIGNING_CONTEXT = "exchange-office-license:v1";

// دالة ترتيب مفاتيح بيانات الترخيص
function sortJsonKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }

  if (value !== null && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);

    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(
        "License payload must contain plain JSON objects only."
      );
    }

    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortJsonKeys(value[key])])
    );
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  throw new TypeError("License payload contains a non-JSON value.");
}

//دالة تجهيز نص بيانات الترخيص مع ثابت الترخيص بعد عملية الترتيب
export function serializeLicensePayloadForSigning(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("License payload must be a plain object.");
  }

  return `${LICENSE_SIGNING_CONTEXT}\n${JSON.stringify(sortJsonKeys(payload))}`;
}

const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const DEFAULT_FILE_FIELDS =
  "id,name,mimeType,parents,createdTime,modifiedTime,size,webViewLink,trashed,capabilities(canDownload)";
const SMALL_UPLOAD_LIMIT = 5 * 1024 * 1024;

// ================= دوال مساعدة =================

// التحقق من وجود Access Token
function validateAccessToken(accessToken) {
  if (typeof accessToken !== "string" || !accessToken.trim()) {
    throw new Error("Access Token غير موجود");
  }
}

// التحقق من وجود Blob صالح
function validateBlob(blob) {
  if (typeof Blob === "undefined" || !(blob instanceof Blob)) {
    throw new Error("يجب تمرير Blob صالح");
  }
}

// التحقق من وجود File ID
function validateFileId(fileId) {
  if (typeof fileId !== "string" || !fileId.trim()) {
    throw new Error("File ID غير صالح");
  }
}

// معالجة أخطاء Google Drive API
async function createDriveError(response) {
  const responseText = await response.text();

  let result = null;

  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    result = null;
  }

  const apiError = result?.error;

  const error = new Error(
    apiError?.message || `Google Drive request failed: ${response.status}`
  );

  error.status = response.status;

  error.code = apiError?.code ?? response.status;

  error.reason = apiError?.errors?.[0]?.reason ?? apiError?.status ?? null;

  return error;
}

// تنفيذ طلب HTTP إلى Google Drive
async function requestDrive(
  url,
  { accessToken, method = "GET", headers = {}, body } = {}
) {
  validateAccessToken(accessToken);

  let response;

  try {
    response = await fetch(url, {
      method,

      headers: {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      },

      body,
    });
  } catch (error) {
    const networkError = new Error("تعذر الاتصال بـ Google Drive");

    networkError.cause = error;

    throw networkError;
  }

  if (!response.ok) {
    throw await createDriveError(response);
  }

  return response;
}

// رفع ملف باستخدام Resumable Upload
async function uploadResumableFile({
  fileId = null,
  metadata = null,
  blob,
  mimeType,
  accessToken,
}) {
  const isUpdate = Boolean(fileId);

  const endpoint = isUpdate
    ? `${DRIVE_UPLOAD_URL}/${encodeURIComponent(fileId)}`
    : DRIVE_UPLOAD_URL;

  const params = new URLSearchParams({
    uploadType: "resumable",
    fields: DEFAULT_FILE_FIELDS,
  });

  const headers = {
    "X-Upload-Content-Type": mimeType,
    "X-Upload-Content-Length": String(blob.size),
  };

  if (metadata) {
    headers["Content-Type"] = "application/json; charset=UTF-8";
  }

  // بدء جلسة الرفع
  const initiationResponse = await requestDrive(`${endpoint}?${params}`, {
    accessToken,
    method: isUpdate ? "PATCH" : "POST",
    headers,
    body: metadata ? JSON.stringify(metadata) : undefined,
  });

  // الحصول على رابط جلسة الرفع
  const sessionUrl = initiationResponse.headers.get("Location");

  if (!sessionUrl) {
    throw new Error("لم تُرجع Google رابط جلسة رفع الملف");
  }

  // إرسال محتوى الملف إلى جلسة الرفع
  let uploadResponse;

  try {
    uploadResponse = await fetch(sessionUrl, {
      method: "PUT",

      headers: {
        "Content-Type": mimeType,
      },

      body: blob,
    });
  } catch (error) {
    const networkError = new Error(
      "انقطع الاتصال أثناء رفع الملف إلى Google Drive"
    );

    networkError.cause = error;

    throw networkError;
  }

  if (!uploadResponse.ok) {
    throw await createDriveError(uploadResponse);
  }

  return readJsonResponse(uploadResponse);
}

// قراءة استجابة JSON
async function readJsonResponse(response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("تعذر قراءة استجابة Google Drive بصيغة JSON");
  }
}

// حماية قيم البحث داخل Google Drive Query
function escapeDriveQueryValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// ================= إنشاء مجلد =================

export async function createFolder(name, accessToken, parentId = null) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("اسم المجلد غير صالح");
  }

  const metadata = {
    name: name.trim(),
    mimeType: DRIVE_FOLDER_MIME_TYPE,
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const params = new URLSearchParams({
    fields: DEFAULT_FILE_FIELDS,
  });

  const response = await requestDrive(`${DRIVE_FILES_URL}?${params}`, {
    accessToken,
    method: "POST",

    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },

    body: JSON.stringify(metadata),
  });

  return readJsonResponse(response);
}

// ================= جلب قائمة الملفات =================

export async function listFiles(
  accessToken,
  {
    query = "",
    pageSize = 100,
    pageToken = null,
    orderBy = "name",
    includeTrashed = false,
  } = {}
) {
  const safePageSize = Number.isInteger(pageSize)
    ? Math.min(Math.max(pageSize, 1), 1000)
    : 100;

  const params = new URLSearchParams();

  const queryParts = [];

  if (typeof query === "string" && query.trim()) {
    queryParts.push(query.trim());
  }

  if (!includeTrashed) {
    queryParts.push("trashed = false");
  }

  if (queryParts.length > 0) {
    params.set("q", queryParts.join(" and "));
  }

  params.set("pageSize", String(safePageSize));

  params.set(
    "fields",
    `nextPageToken,incompleteSearch,files(${DEFAULT_FILE_FIELDS})`
  );

  params.set("spaces", "drive");

  if (orderBy) {
    params.set("orderBy", orderBy);
  }

  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const response = await requestDrive(`${DRIVE_FILES_URL}?${params}`, {
    accessToken,
    method: "GET",
  });

  return readJsonResponse(response);
}

// ================= البحث عن ملفات بالاسم =================

export async function findFilesByName(
  name,
  accessToken,
  parentId = "root",
  mimeType = null
) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("اسم الملف غير صالح");
  }

  if (typeof parentId !== "string" || !parentId.trim()) {
    throw new Error("Parent Folder ID غير صالح");
  }

  const queryParts = [
    `name = '${escapeDriveQueryValue(name.trim())}'`,
    `'${escapeDriveQueryValue(parentId)}' in parents`,
  ];

  if (mimeType) {
    queryParts.push(`mimeType = '${escapeDriveQueryValue(mimeType)}'`);
  }

  const query = queryParts.join(" and ");

  const files = [];

  let pageToken = null;

  do {
    const result = await listFiles(accessToken, {
      query,
      pageSize: 100,
      pageToken,
    });

    files.push(...(result.files ?? []));

    pageToken = result.nextPageToken ?? null;
  } while (pageToken);

  return files;
}

// ================= إنشاء ملف ورفع محتواه =================

export async function createFile(
  { name, blob, parentId = null, mimeType = "application/json" },
  accessToken
) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("اسم الملف غير صالح");
  }

  validateBlob(blob);

  const metadata = {
    name: name.trim(),
    mimeType,
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const boundary = `fx_backup_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2)}`;

  const mediaType = blob.type || mimeType;

  if (blob.size > SMALL_UPLOAD_LIMIT) {
    return uploadResumableFile({
      metadata,
      blob,
      mimeType: mediaType,
      accessToken,
    });
  }

  const requestBody = new Blob([
    `--${boundary}\r\n`,

    "Content-Type: application/json; charset=UTF-8\r\n\r\n",

    JSON.stringify(metadata),

    `\r\n--${boundary}\r\n`,

    `Content-Type: ${mediaType}\r\n\r\n`,

    blob,

    `\r\n--${boundary}--`,
  ]);

  const params = new URLSearchParams({
    uploadType: "multipart",
    fields: DEFAULT_FILE_FIELDS,
  });

  const response = await requestDrive(`${DRIVE_UPLOAD_URL}?${params}`, {
    accessToken,
    method: "POST",

    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },

    body: requestBody,
  });

  return readJsonResponse(response);
}

// ================= تحديث محتوى ملف موجود =================

export async function updateFile(
  fileId,
  blob,
  accessToken,
  mimeType = "application/json"
) {
  validateFileId(fileId);
  validateBlob(blob);

  const params = new URLSearchParams({
    uploadType: "media",
    fields: DEFAULT_FILE_FIELDS,
  });

  const mediaType = blob.type || mimeType;

  if (blob.size > SMALL_UPLOAD_LIMIT) {
    return uploadResumableFile({
      fileId,
      blob,
      mimeType: mediaType,
      accessToken,
    });
  }

  const response = await requestDrive(
    `${DRIVE_UPLOAD_URL}/${encodeURIComponent(fileId)}?${params}`,
    {
      accessToken,
      method: "PATCH",

      headers: {
        "Content-Type": blob.type || mimeType,
      },

      body: blob,
    }
  );

  return readJsonResponse(response);
}

// ================= جلب معلومات ملف =================

export async function getFile(fileId, accessToken) {
  validateFileId(fileId);

  const params = new URLSearchParams({
    fields: DEFAULT_FILE_FIELDS,
  });

  const response = await requestDrive(
    `${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}?${params}`,
    {
      accessToken,
      method: "GET",
    }
  );

  return readJsonResponse(response);
}

// ================= تنزيل محتوى ملف =================

export async function downloadFile(fileId, accessToken) {
  validateFileId(fileId);

  const params = new URLSearchParams({
    alt: "media",
  });

  const response = await requestDrive(
    `${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}?${params}`,
    {
      accessToken,
      method: "GET",
    }
  );

  return response.blob();
}

// ================= نقل ملف إلى سلة المهملات =================

export async function trashFile(fileId, accessToken) {
  validateFileId(fileId);

  const params = new URLSearchParams({
    fields: DEFAULT_FILE_FIELDS,
  });

  const response = await requestDrive(
    `${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}?${params}`,
    {
      accessToken,
      method: "PATCH",

      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },

      body: JSON.stringify({
        trashed: true,
      }),
    }
  );

  return readJsonResponse(response);
}

// ================= حذف ملف نهائيًا =================

export async function deleteFile(fileId, accessToken) {
  validateFileId(fileId);

  await requestDrive(`${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}`, {
    accessToken,
    method: "DELETE",
  });

  return {
    fileId,
    deleted: true,
  };
}

const googleDriveService = {
  createFolder,
  listFiles,
  findFilesByName,
  createFile,
  updateFile,
  getFile,
  downloadFile,
  trashFile,
  deleteFile,
};

export default googleDriveService;

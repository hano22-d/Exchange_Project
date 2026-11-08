const GSI_URL = "https://accounts.google.com/gsi/client";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

const TOKEN_SAFETY_WINDOW = 60 * 1000;

const TOKEN_REQUEST_TIMEOUT = 120 * 1000;

// ================= المتغيرات المشتركة =================
let gsiPromise = null;
let initializationPromise = null;

let tokenClient = null;
let pendingTokenRequest = null;

let accessToken = null;
let tokenExpiresAt = 0;

// ================= دوال مساعدة =================
// إنشاء Error مع Code اختياري
function createOAuthError(message, code) {
  const error = new Error(message);

  if (code) {
    error.code = code;
  }

  return error;
}

// إنهاء طلب Token المعلق وإزالة مؤقته
function takePendingTokenRequest() {
  const pending = pendingTokenRequest;

  if (!pending) {
    return null;
  }

  pendingTokenRequest = null;

  if (pending.timeoutId !== null) {
    window.clearTimeout(pending.timeoutId);
  }

  return pending;
}

// التحقق من منح صلاحية Google Drive المطلوبة
function hasDriveScope(response) {
  const oauth = window.google?.accounts?.oauth2;

  if (typeof oauth?.hasGrantedAllScopes === "function") {
    return oauth.hasGrantedAllScopes(response, DRIVE_SCOPE);
  }

  // بديل احتياطي عند عدم توفر دالة الفحص
  const grantedScopes = String(response.scope ?? "")
    .split(/\s+/)
    .filter(Boolean);

  return grantedScopes.includes(DRIVE_SCOPE);
}

// ================= تحميل Google Identity Services =================
function loadGoogleIdentityServices() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(
      new Error("Google Identity Services تحتاج إلى بيئة متصفح")
    );
  }

  // إذا كانت المكتبة محملة مسبقًا
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  // منع إنشاء أكثر من Promise لتحميل المكتبة
  if (gsiPromise) {
    return gsiPromise;
  }

  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = GSI_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve();
      } else {
        script.remove();

        reject(new Error("تعذر تهيئة Google Identity Services"));
      }
    };

    script.onerror = () => {
      script.remove();

      reject(new Error("فشل تحميل Google Identity Services"));
    };

    document.head.appendChild(script);
  }).catch((error) => {
    gsiPromise = null;
    throw error;
  });

  return gsiPromise;
}

// ================= استقبال نتيجة Access Token =================
function handleTokenResponse(response) {
  const pending = pendingTokenRequest;

  if (!pending) {
    return;
  }

  // معالجة أخطاء OAuth
  if (response?.error) {
    const request = takePendingTokenRequest();

    clearAccessToken();

    request.reject(
      createOAuthError(
        response.error_description ||
          `فشل الحصول على Access Token: ${response.error}`,
        response.error
      )
    );

    return;
  }

  // التأكد من وجود Access Token
  if (!response?.access_token) {
    const request = takePendingTokenRequest();

    clearAccessToken();

    request.reject(new Error("لم يتم استلام Access Token"));

    return;
  }

  // التأكد من منح صلاحية Google Drive
  if (!hasDriveScope(response)) {
    const request = takePendingTokenRequest();

    clearAccessToken();

    request.reject(
      new Error("لم يتم منح التطبيق صلاحية الوصول إلى Google Drive")
    );

    return;
  }

  // التحقق من مدة صلاحية Token
  const expiresIn = Number(response.expires_in);

  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    const request = takePendingTokenRequest();

    clearAccessToken();

    request.reject(new Error("مدة صلاحية Access Token غير صالحة"));

    return;
  }

  // تخزين Access Token في الذاكرة
  accessToken = response.access_token;

  tokenExpiresAt = Date.now() + expiresIn * 1000;

  // إنهاء الطلب وإعادة الاستجابة إلى المستدعي
  const request = takePendingTokenRequest();

  request.resolve(response);
}

// ================= معالجة أخطاء نافذة Google =================
function handleTokenError(error) {
  const request = takePendingTokenRequest();

  if (!request) {
    return;
  }

  const errorType = error?.type;

  let message = error?.message || "تعذر إكمال المصادقة مع Google";

  if (errorType === "popup_closed") {
    message = "أغلق المستخدم نافذة مصادقة Google";
  } else if (errorType === "popup_failed_to_open") {
    message = "تعذر فتح نافذة مصادقة Google";
  }

  request.reject(createOAuthError(message, errorType));
}

// ================= تهيئة Token Client =================
async function initializeGoogleAuth() {
  // إذا تمت التهيئة مسبقًا
  if (tokenClient) {
    return tokenClient;
  }

  // إذا كانت عملية التهيئة جارية
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    if (typeof CLIENT_ID !== "string" || !CLIENT_ID.trim()) {
      throw new Error("Google Client ID غير موجود في ملف البيئة");
    }

    await loadGoogleIdentityServices();

    // إنشاء Token Client
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,

      scope: DRIVE_SCOPE,

      include_granted_scopes: true,

      prompt: "",

      callback: handleTokenResponse,

      error_callback: handleTokenError,
    });

    return tokenClient;
  })();

  try {
    return await initializationPromise;
  } catch (error) {
    initializationPromise = null;
    tokenClient = null;

    throw error;
  }
}

// ================= طلب Access Token =================
function requestGoogleAccessToken() {
  if (!tokenClient) {
    return Promise.reject(new Error("يجب تهيئة Google Authentication أولًا"));
  }

  if (pendingTokenRequest) {
    return Promise.reject(new Error("يوجد طلب مصادقة مع Google قيد التنفيذ"));
  }

  return new Promise((resolve, reject) => {
    const pending = {
      resolve,
      reject,
      timeoutId: null,
    };

    pendingTokenRequest = pending;

    // مهلة احتياطية إذا لم تصل أي استجابة
    pending.timeoutId = window.setTimeout(() => {
      if (pendingTokenRequest !== pending) {
        return;
      }

      pendingTokenRequest = null;

      reject(new Error("انتهت مهلة انتظار استجابة Google Authentication"));
    }, TOKEN_REQUEST_TIMEOUT);

    try {
      tokenClient.requestAccessToken();
    } catch (error) {
      const request = takePendingTokenRequest();

      request.reject(error);
    }
  });
}

// ================= الحصول على Token صالح =================
function getValidAccessToken() {
  const isValid =
    accessToken && Date.now() < tokenExpiresAt - TOKEN_SAFETY_WINDOW;

  if (!isValid) {
    clearAccessToken();
    return null;
  }

  return accessToken;
}

// ================= مسح Token من الذاكرة =================
function clearAccessToken() {
  accessToken = null;
  tokenExpiresAt = 0;
}

// ================= إلغاء تفويض Google =================
function revokeGoogleAccess() {
  const oauth = window.google?.accounts?.oauth2;

  if (typeof oauth?.revoke !== "function") {
    return Promise.reject(
      new Error("Google Identity Services غير مهيأة لإلغاء التفويض")
    );
  }

  // نحتاج إلى Token ما زال صالحًا فعليًا للإلغاء
  if (!accessToken || Date.now() >= tokenExpiresAt) {
    clearAccessToken();

    return Promise.reject(
      new Error("لا يوجد Access Token صالح لإلغاء التفويض")
    );
  }

  return new Promise((resolve, reject) => {
    try {
      oauth.revoke(accessToken, (response) => {
        if (response?.successful) {
          clearAccessToken();
          resolve(response);
          return;
        }

        // قد يكون التوكن منتهيًا أو أُلغي سابقًا
        if (response?.error === "invalid_token") {
          clearAccessToken();
        }

        reject(
          createOAuthError(
            response?.error_description ||
              `تعذر إلغاء تفويض Google: ${response?.error || "Unknown error"}`,
            response?.error
          )
        );
      });
    } catch (error) {
      reject(error);
    }
  });
}

const googleAuthService = {
  initializeGoogleAuth,
  requestGoogleAccessToken,
  getValidAccessToken,
  clearAccessToken,
  revokeGoogleAccess,
};

export default googleAuthService;

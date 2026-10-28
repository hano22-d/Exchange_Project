
import { createPortal } from "react-dom";
import "../styles/transfer-receipt.css";
import { formatNumber } from "../shared/utils.js";
import { formatSyriaDateTime } from "../shared/utilsDate.js";


// تنسيق المبلغ مع رمز العملة.
function formatAmountWithCurrency(amount, currency) {
  const formattedAmount = formatNumber(amount);

  if (!currency) {
    return formattedAmount;
  }

  return `${formattedAmount} ${currency}`;
}

// تنسيق التاريخ حسب توقيت سوريا.
function formatReceiptDate(timestamp) {
  if (
    typeof timestamp !== "number" ||
    !Number.isFinite(timestamp)
  ) {
    return "—";
  }

  return formatSyriaDateTime(timestamp, "ar-SY");
}


export default function TransferReceipt({ transfer }) {
  if (!transfer) {
    return null;
  }

  const isOutgoing = transfer.direction === "صادر";
  const isIncoming = transfer.direction === "وارد";

  const note =
    typeof transfer.note === "string"
      ? transfer.note.trim()
      : "";

  const amount = Number(transfer.amount);
  const wages = Number(transfer.wages ?? 0);

  const wagesIncluded =
    isOutgoing && transfer.wagesIncluded === true;


  const netTransferAmount = amount - wages;

  const totalReceived = amount + wages;

  const receiptTitle = isOutgoing
    ? "سند حوالة صادرة"
    : isIncoming
      ? "سند حوالة واردة"
      : "سند حوالة";

  const receipt = (
    <section
      className="receipt-print-root transfer-receipt-print-root"
      dir="rtl"
      lang="ar"
      aria-label="إيصال الحوالة المالية"
    >
      {/* رأس الإيصال */}
      <header className="transfer-receipt-header">
      <img src="src/assets/printLogo.png" alt="" width={"150px"} />

        <h1 className="transfer-receipt-shop-name">
          مكتب علي كرازة للصرافة
        </h1>

        <h2 className="transfer-receipt-title">
          {receiptTitle}
        </h2>
      </header>

      <div className="transfer-receipt-divider" />

      {/* معلومات الحوالة */}
      <div className="transfer-receipt-meta">
        <div className="transfer-receipt-row">
          <span>رقم الحوالة</span>

          <bdi
            dir="ltr"
            className="transfer-receipt-value"
          >
            {transfer.id ?? "—"}
          </bdi>
        </div>

        <div className="transfer-receipt-row">
          <span>تاريخ الحوالة</span>

          <span className="transfer-receipt-value">
            {formatReceiptDate(transfer.date)}
          </span>
        </div>

        <div className="transfer-receipt-row">
          <span>اتجاه الحوالة</span>

          <strong className="transfer-receipt-value">
            {transfer.direction}
          </strong>
        </div>
      </div>

      <div className="transfer-receipt-divider" />

      {/* بيانات الشخص والوجهة */}
      <div className="transfer-receipt-person">
        <p className="transfer-receipt-label">
          الاسم
        </p>

        <p className="transfer-receipt-person-name">
          {transfer.fullname || "—"}
        </p>

        <div className="transfer-receipt-row">
          <span>وجهة الحوالة</span>

          <strong className="transfer-receipt-value">
            {transfer.destination || "—"}
          </strong>
        </div>
      </div>

      <div className="transfer-receipt-divider" />

      {/* التفاصيل المالية للحوالة الصادرة */}
      {isOutgoing && (
        <>
          {wagesIncluded ? (
            <>
              <section className="transfer-receipt-amount-block">
                <p className="transfer-receipt-label">
                  المبلغ الإجمالي
                </p>

                <strong
                  className="transfer-receipt-amount"
                  dir="ltr"
                >
                  <bdi>
                    {formatAmountWithCurrency(
                      amount,
                      transfer.currency
                    )}
                  </bdi>
                </strong>
              </section>

              <div className="transfer-receipt-row">
                <span>أجور الحوالة (متضمنة)</span>

                <bdi
                  dir="ltr"
                  className="transfer-receipt-value"
                >
                  {formatAmountWithCurrency(
                    wages,
                    transfer.currency
                  )}
                </bdi>
              </div>

              <div className="transfer-receipt-divider" />

              <section className="transfer-receipt-amount-block">
                <p className="transfer-receipt-label">
                  المبلغ الصافي
                </p>

                <strong
                  className="transfer-receipt-amount"
                  dir="ltr"
                >
                  <bdi>
                    {formatAmountWithCurrency(
                      netTransferAmount,
                      transfer.currency
                    )}
                  </bdi>
                </strong>
              </section>
            </>
          ) : (
            <>
              <section className="transfer-receipt-amount-block">
                <p className="transfer-receipt-label">
                  قيمة الحوالة
                </p>

                <strong
                  className="transfer-receipt-amount"
                  dir="ltr"
                >
                  <bdi>
                    {formatAmountWithCurrency(
                      amount,
                      transfer.currency
                    )}
                  </bdi>
                </strong>
              </section>

              <div className="transfer-receipt-row">
                <span>أجور الحوالة (غير متضمنة)</span>

                <bdi
                  dir="ltr"
                  className="transfer-receipt-value"
                >
                  {formatAmountWithCurrency(
                    wages,
                    transfer.currency
                  )}
                </bdi>
              </div>

              <div className="transfer-receipt-divider" />

              <section className="transfer-receipt-amount-block">
                <p className="transfer-receipt-label">
                  المبلغ الإجمالي
                </p>

                <strong
                  className="transfer-receipt-amount"
                  dir="ltr"
                >
                  <bdi>
                    {formatAmountWithCurrency(
                      totalReceived,
                      transfer.currency
                    )}
                  </bdi>
                </strong>
              </section>
            </>
          )}
        </>
      )}

      {/* التفاصيل المالية للحوالة الواردة */}
      {isIncoming && (
        <section className="transfer-receipt-amount-block">
          <p className="transfer-receipt-label">
            المبلغ
          </p>

          <strong
            className="transfer-receipt-amount"
            dir="ltr"
          >
            <bdi>
              {formatAmountWithCurrency(
                amount,
                transfer.currency
              )}
            </bdi>
          </strong>
        </section>
      )}

      {/* الملاحظات اختيارية */}
      {note && (
        <>
          <div className="transfer-receipt-divider" />

          <div className="transfer-receipt-note">
            <p className="transfer-receipt-label">
              ملاحظات
            </p>

            <p className="transfer-receipt-note-value">
              {note}
            </p>
          </div>
        </>
      )}

      <div className="transfer-receipt-divider" />

      {/* تذييل الإيصال */}
      <footer className="transfer-receipt-footer">
        <p>
          يرجى الاحتفاظ بهذا السند للرجوع إليه عند الحاجة.
        </p>

        <p className="transfer-receipt-thanks">
          شكرًا لتعاملكم معنا
        </p>

        <p className="transfer-receipt-shop-footer">
          مكتب علي كرازة للصرافة
        </p>
      </footer>
    </section>
  );

  return createPortal(receipt, document.body);
}

import { createPortal } from "react-dom";
import "../printing/exchange-reseipt.css";
import { formatSyriaDateTime } from "../shared/utilsDate";
import { formatNumber } from "../shared/utils";

function formatAmountWithCurrency(amount, currency) {
  const formattedAmount = formatNumber(amount);

  if (!currency) {
    return formattedAmount;
  }

  return `${formattedAmount} ${currency}`;
}

function formatReceiptDate(timestamp) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return "—";
  }

  return formatSyriaDateTime(timestamp, "en-SY");
}

export default function ExchangeReceipt({ exchange }) {
  if (!exchange) {
    return null;
  }

  const note = typeof exchange.note === "string" ? exchange.note.trim() : "";

  const receipt = (
    <section
      className="receipt-print-root"
      dir="rtl"
      lang="ar"
      aria-label="إيصال عملية الصرف"
    >
      {/* رأس الإيصال */}
      <header className="receipt-header">
        <img src="src/assets/printLogo.png" alt="" width={"150px"} />

        <h1 className="receipt-shop-name">مكتب علي كرازة للصرافة</h1>

        <h2 className="receipt-title">سند عملية صرف</h2>
      </header>

      <div className="receipt-divider" />

      {/* بيانات العملية */}
      <div className="receipt-meta">
        <div className="receipt-meta-row">
          <span>رقم العملية</span>

          <bdi dir="ltr" className="receipt-meta-value">
            {exchange.id ?? "—"}
          </bdi>
        </div>

        <div className="receipt-meta-row">
          <span>تاريخ العملية</span>

          <span className="receipt-meta-value">
            {formatReceiptDate(exchange.date)}
          </span>
        </div>
      </div>

      <div className="receipt-divider" />

      {/* المبلغ الذي استلمه المكتب */}
      <section className="receipt-amount-block">
        <p className="receipt-field-label">المبلغ المستلم من العميل</p>

        <strong className="receipt-amount" dir="ltr">
          <bdi>
            {formatAmountWithCurrency(
              exchange.fromAmount,
              exchange.fromCurrency
            )}
          </bdi>
        </strong>
      </section>

      {/* المبلغ الذي سلّمه المكتب */}
      <section className="receipt-amount-block">
        <p className="receipt-field-label">المبلغ المسلّم للعميل</p>

        <strong className="receipt-amount" dir="ltr">
          <bdi>
            {formatAmountWithCurrency(exchange.toAmount, exchange.toCurrency)}
          </bdi>
        </strong>
      </section>

      <div className="receipt-divider" />

      {/* سعر الصرف */}
      <div className="receipt-meta-row receipt-rate-row">
        <span>سعر الصرف</span>

        <bdi dir="ltr" className="receipt-meta-value">
          {formatNumber(exchange.rate)}
        </bdi>
      </div>

      {note && (
        <>
          <div className="receipt-divider" />

          <div className="receipt-note">
            <p className="receipt-field-label">ملاحظات</p>

            <p className="receipt-note-value">{note}</p>
          </div>
        </>
      )}

      <div className="receipt-divider" />

      {/* تذييل الإيصال */}
      <footer className="receipt-footer">
        <p>يرجى الاحتفاظ بهذا السند للرجوع إليه عند الحاجة.</p>

        <p className="receipt-thanks">شكرًا لتعاملكم معنا</p>

        <p className="receipt-shop-footer">مكتب علي كرازة للصرافة</p>
      </footer>

      <span style={{ position: "absolute", right: "42%" }}>----------</span>
    </section>
  );

  // نضع عنصر الإيصال مباشرة داخل body لعزله عن واجهة الموقع عند الطباعة.
  return createPortal(receipt, document.body);
}

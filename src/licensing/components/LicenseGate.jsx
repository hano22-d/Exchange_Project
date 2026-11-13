import { useLicense } from "../../context/LicenseContext.jsx";
import { ActivationPage } from "./ActivationPage.jsx";

export function LicenseGate({ children }) {
  const { status } = useLicense();

  if (status === "checking" || status === "activating") {
    return (
      <main className="license-gate-loading" role="status" aria-live="polite">
        <span className="license-gate-spinner" aria-hidden="true" />
        <p>جارٍ التحقق من ترخيص التطبيق...</p>
      </main>
    );
  }

  if (status === "licensed") {
    return children;
  }

  return <ActivationPage />;
}

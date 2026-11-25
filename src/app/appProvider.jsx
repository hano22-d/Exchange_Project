import { BackupProvider } from "../context/BackupContext";
import CashboxProvider from "../context/cashboxContext";
import { ReconciliationProvider } from "../context/ReconcilliationContext";
import DatabaseConnectionNotice from "../db/DatabaseConnectionNotice";

export default function AppProvider({ children }) {
  return (
    <BackupProvider>
      <ReconciliationProvider>
        <CashboxProvider>
          <DatabaseConnectionNotice />
          {children}
        </CashboxProvider>
      </ReconciliationProvider>
    </BackupProvider>
  );
}

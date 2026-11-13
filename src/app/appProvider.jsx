import { BackupProvider } from "../context/BackupContext";
import CashboxProvider from "../context/cashboxContext";

export default function AppProvider({ children }) {
  return (
    <BackupProvider>
      <CashboxProvider>{children}</CashboxProvider>
    </BackupProvider>
  );
}

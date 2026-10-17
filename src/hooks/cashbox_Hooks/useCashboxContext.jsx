import { useContext } from "react";
import { CashboxContext } from "../../context/cashboxContext";


function useCashboxContext() {
  const context = useContext(CashboxContext);

  if (!context) {
    throw new Error("cashboxProvider داخل cashboxContext يجب استخدام");
  }
  return context;
}
export default useCashboxContext;

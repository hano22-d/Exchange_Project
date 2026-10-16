import CashboxProvider from "../context/cashboxContext";

export default function AppProvider({children}) {
    return(
        <CashboxProvider>
            {children}
        </CashboxProvider>
    )
}
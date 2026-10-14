import CashboxProvider from "../context/cashboxContext";

function AppProvider({children}) {
    return(
        <CashboxProvider>
            {children}
        </CashboxProvider>
    )
}
export default AppProvider
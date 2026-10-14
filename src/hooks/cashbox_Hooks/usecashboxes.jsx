import useCashboxContext from "./useCashboxContext";

function useCashboxces() {
    const {cashboxes,loading,error,getCashboxes} = useCashboxContext();

    return {
        cashboxes,
        loading,
        error,
        getCashboxes
    }
}
export default useCashboxces
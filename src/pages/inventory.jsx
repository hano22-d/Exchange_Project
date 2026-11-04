import { Box } from "@mui/material";
import DeptDetails from "../featuers/archive/depts_details_archive";
import TransferDetails from "../featuers/archive/transfers_details_archive";


export default function Inventory() {
  return (
    <Box sx={{p: 4}}>
      <TransferDetails/>
      <DeptDetails/>
    </Box>
  );
}

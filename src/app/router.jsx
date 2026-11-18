import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Operations from "../pages/operations";
import Inventory from "../pages/inventory";
import Archive from "../pages/archive";
import Depts from "../pages/depts";
import MainLayout from "./mainLayout";
import Exchange from "../featuers/operations/exchange_operations";
import Transfer from "../featuers/operations/transfer_operations";
import Dept from "../featuers/operations/dept_operations";
import ArchiveDetailsSwitcher from "../featuers/archive/archiveDetailsSwicher";
import PartyAccount from "../featuers/depts/accountStatement_depts";
import ElectronicWallets from "../pages/wallet";
import ElectronicWalletDetails from "../featuers/electronicWallets/electronicWalletDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "operations",
        element: <Operations />,
        children: [
          {
            index: true,
            element: <Exchange />,
          },
          {
            path: "transfer",
            element: <Transfer />,
          },
          {
            path: "dept",
            element: <Dept />,
          },
        ],
      },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "archive",
        element: <Archive />,
      },
      { path: "/archive/:type/:id", element: <ArchiveDetailsSwitcher /> },
      {
        path: "depts",
        element: <Depts />,
      },
      {
        path: "/debts/:partyId",
        element: <PartyAccount/>
      },
      {
        path: "electronic-wallets",
        element: <ElectronicWallets />,
      },
      {
        path: "electronic-wallets/:walletId",
        element: <ElectronicWalletDetails />,
      },
    ],
  },
]);

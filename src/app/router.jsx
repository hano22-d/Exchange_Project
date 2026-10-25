import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Operations from "../pages/operations";
import Inventory from "../pages/inventory";
import Archive from "../pages/archive";
import Depts from "../pages/depts";
import MainLayout from "./mainLayout";
import Exchange from "../featuers/exchange/cashbox/exchange_operations";
import Transfer from "../featuers/exchange/cashbox/transfer_operations";
import Dept from "../featuers/exchange/cashbox/dept_operations";

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
          element: <Exchange/>
        },
        {
          path: 'transfer',
          element: <Transfer/>
        },
        {
          path: 'dept',
          element: <Dept/>
        }
        ]
      },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "archive",
        element: <Archive />,
      },
      {
        path: "depts",
        element: <Depts />,
      },
    ],
  },
]);

import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Operations from "../pages/operations";
import Inventory from "../pages/inventory";
import Archive from "../pages/archive";
import Depts from "../pages/depts";
import MainLayout from "./mainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "operations",
        element: <Operations />,
      },
      { path: "inventory", element: <Inventory /> },
      { path: "archive", element: <Archive /> },
      { path: "depts", element: <Depts /> },
    ],
  },
]);

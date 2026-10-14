import { Outlet } from "react-router-dom";
import Navbar from "../layout/navbar";

export default function MainLayout() {
  return (
    <>
      <Navbar />

      <Outlet />
    </>
  );
}

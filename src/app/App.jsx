import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./App.css";
import AppProvider from "./appProvider";
import { LicenseProvider } from "../context/LicenseContext";
import { LicenseGate } from "../licensing/components/LicenseGate";

function App() {
  return (
    <>
      <LicenseProvider>
        <LicenseGate>
          <AppProvider>
            <RouterProvider router={router} />
          </AppProvider>
        </LicenseGate>
      </LicenseProvider>
    </>
  );
}

export default App;

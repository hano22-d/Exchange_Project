import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./App.css";
import AppProvider from "./appProvider";

function App() {
  return (
    <>
    <AppProvider>
    <RouterProvider router={router}/>
    </AppProvider>
    </>
  );
}

export default App;

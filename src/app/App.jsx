import { Outlet, RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./App.css";

function App() {
  return (
    <>
      <div className="App">
        <Outlet />
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;

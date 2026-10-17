import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import "./App.css";
import Login from "./Login";
import Users from "./Users";

const router = createBrowserRouter([
   {
      path: "/",
      element: <DirectoryView />,
   },
   {
      path: "/register",
      element: <Register />,
   },
   {
      path: "/login",
      element: <Login />,
   },
   {
      path: "/users",
      element: <Users />,
   },
   {
      path: "/directory/:dirId",
      element: <DirectoryView />,
   },
]);

function App() {
   return <RouterProvider router={router} />;
}

export default App;

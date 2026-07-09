import Login from "./login/Login.jsx"
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route ,Routes } from "react-router-dom";
import Register from "./register/Register.jsx";
import Home from "./home/Home.jsx";
import Landing from "./landing/Landing.jsx";
import { VerifyUser } from "./utils/VerifyUser.jsx";

function App() {
  return (
    <>
      <div className="w-full h-full min-h-screen">
        <Routes>
          <Route path="/" element={<Landing/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route element={<VerifyUser/>}>
            <Route path="/chat" element={<Home/>}/>
          </Route>
        </Routes>
        <ToastContainer/>
      </div>
    </>
  )
}

export default App

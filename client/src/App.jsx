import { Routes, Route } from "react-router";
import { Register, GroupChat } from "./pages"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return(
    <div>
    <ToastContainer position='top-center' autoClose={2000}/>
    <Routes>
   <Route index element={<Register />} />
   <Route path="groupchat" element={<GroupChat />} />
  </Routes>
    </div>
  
  )
}


export default App

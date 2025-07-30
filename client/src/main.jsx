import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from  'react-router-dom'
import './index.css'
import App from './App'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);



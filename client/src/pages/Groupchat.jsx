import React, { useEffect, useRef, useState } from 'react'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from 'react-router-dom';

const GroupChat = () => {
  const [messages, setMessages] = useState([])
  const [inputText , setInputText] = useState("")
  const messagesEndRef = useRef(null);
   const ws = useRef(null)

  const location = useLocation();
  const username = location.state?.userName;
  const now = new Date().toLocaleTimeString()

  useEffect(()=>{
   if (!username) {
      console.error("Username is not available, cannot establish WebSocket connection.");
      return;
    }
    const baseUrl = import.meta.env.VITE_WS_URL;
    ws.current = new WebSocket(`${baseUrl}?userName=${encodeURIComponent(username)}`);
    
    ws.current.onopen=()=>{
      toast.success(`connected as ${username}`)
    }
    
    ws.current.onmessage = (e) =>{
      try {
        const message = JSON.parse(e.data)
        
        switch (message.type) {
          case "welcome":
            setTimeout(()=>{
              toast.success(`Welcome  to the chat, ${message.name}`)
            },3000)
            break;

          case "user-connected":
              toast.success(`${message.username} joined`)
            break;

          case "message-ack":
              setMessages(prev=>prev.map((msg)=>msg.tempId === message.tempId?{...msg, status:"delivered"} :msg))
            break;

          case "user-message":
              setMessages(prev=>[...prev, {
                name:message.username,
                text:message.content,
                time:new Date(message.time ||  Date.now()).toLocaleTimeString(),
               status: 'received'
              }])
            break;
          
          case "user-disconnected":
              toast.info(`${message.username} disconnected`)
            break;
          
          default:
            console.log("Unknown message type:", message.type);
            break;
        }
        
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    }
    ws.current.onerror = () =>{
      console.log("WebSocket error", error);
      toast.error("connection error")
    }

    ws.current.onclose = () =>{
      console.log("WebSocket disconnected");
      toast.warn("Disconnected from chat")
    }

    return  ()=>{
      if(ws.current?.readyState === WebSocket.OPEN){
          ws.current.close()
      }
    }
  },[username])

   useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages])
  

  const handleSubmit= (e) =>{
      e.preventDefault()
     if(!inputText || !ws.current || ws.current.readyState !== WebSocket.OPEN)return

     try {
      const tempId  = Date.now()
    const msg = {
      tempId,
      text:inputText,
      name:username,
      time:new Date().toLocaleTimeString(),
      status:"sending"
    }

    setMessages(prev =>[...prev, msg])
    setInputText("")

    ws.current.send(JSON.stringify({
      type:"user-message",
      text:inputText,
      time: new Date().toISOString(),
      tempId
    }))
     } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages(prev => prev.map(msg => 
      msg.tempId === tempId 
        ? { ...msg, status: 'failed' } 
        : msg
    )) }
         
    
  }
  return (
    <div className='container'>
      <h1 style={{textAlign:"center"}}>CHAT ROOM</h1>
      <p>{username} joined {now}</p> 
      <div className="chatarea">
        {messages.map((message, index)=>{
          const {name, text, tempId, time,status } = message
          return(
            <div key={tempId || index} className={status}>
              <p>
                <strong>{name}: </strong>{text}
                <span>
                  {status === 'sending' && <span className="status">🔄</span>}
                {status === 'delivered' && <span className="status">✓</span>}
                {status === 'failed' && <span className="status">❌</span>}
                </span>
                
                <span className='time'>{time}</span>
              </p>

            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div>
        <form className='chatform'  onSubmit={handleSubmit}>
           <div >
            <input 
            type="text" 
            placeholder='type here'  
            name='name' id='input'  
            value={inputText} onChange={(e)=>setInputText(e.target.value)}
            />
            <button type='submit'>send</button>
           </div>
        </form>
      </div>
    </div>

  )
}

export default GroupChat

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userName.trim()) {
    toast.error("Please input name")
    return;
    }
    navigate('/groupchat', { state: {  userName } });
  };

  return (
    <div className='form-control'>
      <form action='localhost/3000' method='post' className='form' onSubmit={handleSubmit}>
        <h3>Welcome! Chat with people now</h3>
        <label>Please input your name to enter group</label>
        <input 
          type="text" 
          name='userName'
          id='userName'
          placeholder='e.g Emmanuel' 
          value={userName}
          onChange={(e) => setUserName(e.target.value)} 
        />
        <button type='submit'>Enter Room</button>
      </form>
    </div>
  );
};

export default Register
import React, {useState} from 'react';
import { Link,NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import authService from '../../service/authService.js'
import toast from 'react-hot-toast';
import { BrainCircuit, Mail, Lock, ArrowRight} from 'lucide-react';

const LoginPage = () => {

const [email, setEmail] = useState('alex@timetoprogram.com');
const [password, setPassword] = useState('Test@123');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [focusedField, setFocusedField] = useState(null);

const navigate = useNavigate();
const { login } = useAuth();

const handleSubmit = async (e:any) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const { token, user } = await authService.login(email, password);
    login(user, token);
    toast.success('Logged in successfully');
    navigate('/dashboard');
  } catch (err:any) {
    setError(err.response?.data?.message || 'Login failed');
    toast.error('Login failed');
  } finally {
    setLoading(false);
  }
};



  return (
    <div>LoginPage</div>
  )
}

export default LoginPage
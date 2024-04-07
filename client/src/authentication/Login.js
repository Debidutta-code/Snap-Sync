import React, { useState, useRef } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { useVideo } from '../pages/VideoContext';

const Login = () => {
    const { setUserLoggedIn, setUserId, setUserName, setAvatarUrl } = useVideo();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const handleEmail = (e) => {
        setEmail(e.target.value);
    }

    const handlePassword = (e) => {
        setPassword(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('https://snap-sync-tau.vercel.app/login', {
            method : 'POST',
            headers: { 
                "Content-Type": "application/json"
             },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json();

        if(data.success){
            setUserLoggedIn(true);
            setUserId(data.userId);
            setUserName(data.username);
            setAvatarUrl(data.userAvatarUrl);
            navigate('/');
        } else {
            // Show alert message for invalid email or password
            window.alert("Invalid email or password");

            // Clear input fields using refs
            emailRef.current.value = '';
            passwordRef.current.value = '';
        }
    };

    return (
        <div className='login-container'>
            <div className='login-content'>
                <h2 className='login-heading'>Welcome Back!</h2>
                <form className='login-form' onSubmit={handleSubmit}>
                    <div className='login-form-group'>
                        <label htmlFor='username' className='login-label'>Email</label>
                        <input ref={emailRef} type='text' id='username' name='email' className='login-input' placeholder='Enter your Email' required onChange={handleEmail}/>
                    </div>
                    <div className='login-form-group'>
                        <label htmlFor='password' className='login-label'>Password</label>
                        <input ref={passwordRef} type='password' id='password' name='password' className='login-input' placeholder='Enter your password' required onChange={handlePassword}/>
                    </div>
                    <button type='submit' className='login-button'>Login</button>
                </form>
                <p className='login-signup-link'>Don't have an account? <Link to='/register' className='login-signup-link-a'>Sign up</Link></p>
            </div>
        </div>
    );
};

export default Login;

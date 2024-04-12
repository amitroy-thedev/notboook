import React from 'react'
import "../pages/Dashboard.css";
import RandomAvatar from "./RandomAvatar";
import { useAuth } from '../contexts/AuthContext';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const { currentUser } = useAuth();
  
  return (
    <>
    <div className="navbar">
    <NavLink to="/"><img src="https://firebasestorage.googleapis.com/v0/b/notboook-v2.appspot.com/o/animatedlogo1.gif?alt=media&token=19ba4858-aac2-4194-992e-cd4acf1adfcd" width="200px" alt="logo"/></NavLink>
    <NavLink to="Account">
    <div className="profile">
    <div className="user_info">{<RandomAvatar sex="man"/>}
      <p>{currentUser.displayName}</p></div>
    </div>
    </NavLink>
    </div>
    </>
  )
}

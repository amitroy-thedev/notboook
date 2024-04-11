import React from 'react'
import "../pages/Dashboard.css";
import RandomAvatar from "./RandomAvatar";
import { useAuth } from '../contexts/AuthContext';
import { NavLink } from 'react-router-dom';

import animatedlogo from "../images/animatedlogo1.gif";


export default function Navbar() {
  const { currentUser } = useAuth();
  
  return (
    <>
    <div className="navbar">
    <NavLink to="/"><img src={animatedlogo} width="200px" alt="logo"/></NavLink>
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

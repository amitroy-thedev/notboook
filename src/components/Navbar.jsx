import React, { useState } from 'react'
import Logo from './Logo'
import "../pages/Dashboard.css";
import RandomAvatar from "./RandomAvatar";
import { useAuth } from '../contexts/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const { currentUser } = useAuth();
  const [showNot, setShowNot] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const showNotification = () => {
    setShowNot(!showNot);
  }
  return (
    <>
    <div className="navbar">
      <h2>Notboook</h2>
    {/* <form onSubmit={(e)=>{e.preventDefault()}}>
      <input type="text" placeholder='Search your work' className={showSearchBar ? "" : 'hide'}/>
      <button type='submit' onClick={() => setShowSearchBar(!showSearchBar)}><MagnifyingGlassIcon className='icon'/></button>
    </form> */}
    <NavLink to="Account">
    <div className="profile">
    {/* <button className="notification" onClick={showNotification}><span></span><BellIcon className='l-icon'/></button> */}
    <div className="user_info">{<RandomAvatar sex="man"/>}
      <p>{currentUser.displayName}</p></div>
    </div>
    </NavLink>
    </div>
    {showNot && <div className="notificationBox h100">
      <button type="button" onClick={showNotification}><XMarkIcon className='l-icon'/></button>
      <h2>No notification</h2>
    </div>
    }
    </>
  )
}

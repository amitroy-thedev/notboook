import React from 'react';
import pencil from "../images/pencil.png";
import { NavLink } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <>
      <div className="page-not-found">
        <img src={pencil} alt="broken pencil" width="150px"/>
        <h2>404</h2>
        <h3>Oops! Page Not Found.</h3>
        <button className='primary'><NavLink to="/">Go Home</NavLink></button>
      </div>
    </>
  );
}

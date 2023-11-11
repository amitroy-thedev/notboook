import React from 'react'
import icon from "../images/iconn.png";
import { Link } from 'react-router-dom';


export default function Logo({size="80px"}) {
  return (
    <Link to="/" ><img src={icon} height={size} width={size} alt=""/></Link>
  )
}

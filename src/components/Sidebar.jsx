import React, { useEffect, useState } from "react";
import "../pages/Dashboard.css";
import { useAuth } from "../contexts/AuthContext";
import { NavLink } from "react-router-dom";
import {
  Cog6ToothIcon,
  Squares2X2Icon,
  BookmarkSquareIcon,
  PhotoIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

export default function Sidebar() {
  const { signUserOut } = useAuth();
  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [hideSidebar, setHideSidebar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      if (prevScrollPos > currentScrollPos) {
        setHideSidebar(false);
      } else {
        setHideSidebar(true);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos]);

  return (
    <div className={`sidebar ${hideSidebar ? "hide" : ""}`}>
      <ul>
        <li>
          <NavLink to="Main" className="links">
            <Squares2X2Icon className="l-icon sidebar-icon" />
            <p>Dashboard</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="Favourite" className="links">
            <BookmarkSquareIcon className="l-icon sidebar-icon" />
            <p>Marked</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="notes" className="links">
            <PlusIcon className="l-icon add-icon" />
            <p>Add</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="snaps" className="links">
            <PhotoIcon className="l-icon sidebar-icon" />
            <p>Snapshots</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="Account" className="links">
            <Cog6ToothIcon className="l-icon add-icon" />
            <p>Account</p>
          </NavLink>
        </li>
      </ul>
      <ul>
        <li>
          <button onClick={signUserOut} className="primary">
            SignOut
          </button>
        </li>
      </ul>
    </div>
  );
}

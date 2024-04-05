import React, { useEffect, useState } from "react";
import "../pages/Dashboard.css";
import { useAuth } from "../contexts/AuthContext";
import { NavLink } from "react-router-dom";
import {
  Squares2X2Icon,
  BookmarkSquareIcon,

  PlusIcon,
} from "@heroicons/react/24/solid";
import { ArrowRightOnRectangleIcon, UserIcon } from "@heroicons/react/24/outline";

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
          <NavLink to="Search" className="links">
          <svg className="svgIcon" viewBox="0 0 512 512" height="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path></svg>
            {/* <MagnifyingGlassIcon className="icon sidebar-icon searchtool"/>
            <UserIcon className="l-icon" /> */}
            <p>Explore</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="notes" className="links">
            <PlusIcon className="l-icon add-icon" />
            <p>Add</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="Favourite" className="links">
            <BookmarkSquareIcon className="l-icon sidebar-icon" />
            <p>Marked</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="PublicNotes" className="links">
            <UserIcon className="l-icon user-icon" />
            <p>Public Notes</p>
          </NavLink>
        </li>
      </ul>
      <ul>
        <li>
          <button onClick={signUserOut} className="primary"
        style={{ display: "flex", alignItems: "center" }}>
          <ArrowRightOnRectangleIcon
          className="icon"
          style={{ marginRight: "5px" }}
        /> Log out
          </button>
        </li>
      </ul>
    </div>
  );
}

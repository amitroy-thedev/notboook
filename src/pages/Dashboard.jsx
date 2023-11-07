import React from "react";
import "./Dashboard.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";


export default function Dashboard() {

  return (
    <>
      <div className="dashbody">
        <div className="dashboard_container">
          <Navbar/>
        </div>
        <div className="dashboard_main h100">
          <Sidebar />
          <div className="main w100">
          <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

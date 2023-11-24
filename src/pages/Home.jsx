import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import Logo from "../components/Logo";
import book from "../images/book.png";
import reminder from "../images/reminder.png";
import gallery from "../images/gallery.png";
import record from "../images/record.jpg";
import scan from "../images/scan.png";
import RandomAvatar from '../components/RandomAvatar';


import "./Home.css";

export default function Home() {
  const {currentUser} = useAuth();
  return (
    <>
      <nav>
        <Logo/>
      </nav>
      <div className="home-container">
        <section>
          <div className="homeleft">
            <h2>
              Never worry about <br />
              losing your notes <br />
              again.
          </h2>
          {currentUser?<RandomAvatar uniqueUser={currentUser.uid}/>:<RandomAvatar sex="man"/>}
            {!currentUser ? <button className="primary"><NavLink to="/LoginPage" style={{color: "white"}} >Go to Login</NavLink></button>: <button className="primary"><NavLink to="/Dashboard/Main" style={{color: "white"}}>Go to Dashboard</NavLink></button>}
          </div>
          <div className="homeright">
            <img src={book} alt="book" />
          </div>
        </section>
        <section>
          <div className="homeleft">
            <img src={reminder} alt="reminder" />
          </div>
          <div className="homeright">
            <h2>
              Helps you to note <br />
              down your <br />
              Reminders.
            </h2>
          </div>
        </section>
        <section>
          <div className="homeleft">
            <h2>
              Add images to your <br />
              Notes.
            </h2>
          </div>
          <div className="homeright">
            <img src={gallery} alt="gallery" width="350px" />
          </div>
        </section>
        <section>
          <div className="homeleft">
            <img src={record} alt="record" />
          </div>
          <div className="homeright">
            <h2>
              Enhance your note <br />
              taking experience <br />
              by adding audio recording <br />
              to your notes.
            </h2>
          </div>
        </section>
        <section>
          <div className="homeleft">
            <h2>
              Easily shareable <br />
              with your classmates <br />
              with the generated <br />
              QR code / unique ID.
            </h2>
          </div>
          <div className="homeright">
            <img src={scan} alt="scan" />
          </div>
        </section>
      </div>
    </>
  );
}

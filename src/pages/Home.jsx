import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import Logo from "../components/Logo";
import scanqr from "../images/scanqr.svg";
import searchbar from "../images/searchbar.gif";
import markdown from "../images/markdown.png";
import handwrittingnote from "../images/handwritingnote.gif";
import markdownfavicon from "../images/markdown-favicon.png"


import "./Home.css";
import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon, Bars3Icon, MoonIcon, ShareIcon, SpeakerWaveIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const {currentUser, signUserOut} = useAuth();
  const [menuclicked, setMenuclicked] = useState(false);
  return (
    <>
      <nav>
        <Logo/>
        <img src="https://firebasestorage.googleapis.com/v0/b/notboook-v2.appspot.com/o/animatedlogo1.gif?alt=media&token=19ba4858-aac2-4194-992e-cd4acf1adfcd" width="200px" alt="logo"/>
        <div className="menuicon" onClick={() => setMenuclicked(!menuclicked)}>
          {menuclicked ? <XMarkIcon/> : <Bars3Icon/>}
        </div>
      <ul className={`menu-list ${menuclicked ? '' : 'nav-closed'}`}>
        <li>{!currentUser ? <Link to="/RegisterPage">Sign up</Link> : <Link onClick={signUserOut}>Sign out</Link>}</li>
        <li><a href="#howtouse">How to use ?</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#about">About</a></li>
      </ul>
      </nav>
      
      <div className="home-container">
        <section>
          <div className="homeright">
            {/* <img src={handandnote} alt="book"/> */}
            <img src={handwrittingnote} alt="book"/>
          </div>
          <div className="homeleft">
            {/* <img src={noteanimation} width="200px"alt="note"/> */}
            <h2>
              Never worry  <br />about
              losing <br />your notes <br />
              again .
          </h2>
            {!currentUser ? <button className="primary"><NavLink to="/LoginPage" style={{color: "white"}} >Go to Login</NavLink></button>: <button className="primary"><NavLink to="/Dashboard/Main" style={{color: "white"}}>Go to Dashboard</NavLink></button>}
          </div>
        </section>
        <section>
          <div className="homeleft">
            <h2>
             Explore 
             other <br />publicly 
             awail  <br /> notes or add<br /> yours .
          </h2>
          </div>
          <div className="homeright" style={{marginTop: "50px"}}>
            <img src={searchbar} alt="search"/>
          </div>
        </section>
        <section>
          <div className="homeleft">
          <img src={markdown} alt="markdown"/>
          </div>
          <div className="homeright">
            <h2>
              Supports <br />Markdown <br />Formatting 
            </h2>
          </div>
        </section>
        <section>
          <div className="homeright"><h2>
              Share notes <br />
              with generated <br />
              QR code /  <br />unique ID.
            </h2>
            
          </div>
          <div className="homeleft">
            <img src={scanqr} alt="scan" />
          </div>
        </section>
        <section id="howtouse">
        <div className="homeleft">
        <h2 style={{marginBottom: "15px"}}>How to use</h2>
          </div>
          <div className="homeright"><video
        controls
        src="https://firebasestorage.googleapis.com/v0/b/notboook-v2.appspot.com/o/howtouse.mp4?alt=media&token=a1e47015-7a11-495d-b9d3-3531981fda8d"
        width="240">
        Sorry, your browser doesn't support embedded videos, but don't worry, you can
        </video></div>
        </section>
        <section id="features">
          <div className="homeright"><h2>More <br/> Features</h2></div>
          <ul>
            <li><span><ShareIcon className="l-icon"/>Effortless Sharing</span><p> Seamlessly share and add notes with a simple QR Code, ensuring easy collaboration and access for everyone involved.</p></li>
            <li><span><MoonIcon className="l-icon"/>Adaptive Modes</span><p> Switch between Night and Day modes to customize your viewing experience, ensuring optimal readability in any environment.</p></li>
            <li><span><SpeakerWaveIcon className="l-icon"/>Text-to-Speech Functionality</span><p> Listen to your notes with the integrated TTS functionality, providing full accessibility and control over your content.</p></li>
            <li><span><ArrowDownTrayIcon className="l-icon"/>Download Capability</span><p> Export your notes as .txt files, enabling offline access and preserving your information for future reference.</p></li>
            <li><span><img src={markdownfavicon} alt="markdown"/>Markdown support</span><p> Format your notes with headings, - lists, <b>bold text</b>, <i>italics</i>, <a href="/">links</a>, images.</p></li>
          </ul>
        </section>
        <div id="about">Made with &#129782; by <a href="https://in.linkedin.com/in/amitroy-thedev" target="_blank" rel="noreferrer"><b>&nbsp;Amit Roy</b><ArrowTopRightOnSquareIcon className="icon"/></a></div>
      </div>
    </>
  );
}

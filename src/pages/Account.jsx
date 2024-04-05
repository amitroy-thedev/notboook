import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";
import "./Account.css";
import { ArrowRightOnRectangleIcon, CheckIcon, PencilIcon } from "@heroicons/react/24/outline";
import { updateProfile, verifyBeforeUpdateEmail } from "firebase/auth";

export default function Account() {
  const { currentUser, signUserOut } = useAuth();
  const [newUsername, setnewUsername] = useState("");
  const [newEmail, setnewEmail] = useState("");
  const [message, setMessage] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  const updateUsername = async () => {
    try {
      await updateProfile(currentUser, {
        displayName: newUsername,
      });
      setBgColor("yellow")
      setMessage("Your username has been updated");
    } catch (e) {
      setBgColor("red")
      setMessage(e.message);
    }
  };
  const updateEmail = async () => {
    try {
      await verifyBeforeUpdateEmail(currentUser, newEmail);
      setBgColor("yellow")
      setMessage(`Check your email ${newEmail} to update the older email with the new one`);
    } catch (e) {
      if(e.code === "auth/requires-recent-login"){
        setBgColor("red")
        setMessage("For security reason , please login again before completing this action");
        return;
      }else if(e.code === "auth/missing-new-email"){
        setBgColor("red")
        setMessage("Please provide a new email for the update");
        return;
      }
      setBgColor("red")
      setMessage(e.message);
    }
  };

  return (
    <>
      Account
      {message && <div className="message-while-edit" style={{backgroundColor: `${bgColor}`}}>{message}</div> }
      <div className="right">
        <label htmlFor="username">Username : </label>
        <div className="input-field">
        {!editName ? <div className="input-box">{currentUser.displayName}</div> : <input
          type="text"
          id="username"
          placeholder={`${currentUser.displayName}`}
          onChange={(e) => setnewUsername(e.target.value)}
          required
          />}
            <div className="icon-right">
            {!editName ? (
        <PencilIcon className="icon" onClick={() => setEditName(true)} />
          ) : (
          <CheckIcon className="icon" onClick={() => {setEditName(false); updateUsername();}} />
          )}
            </div>
        </div>
      </div>

      <div className="right">
        <label htmlFor="username">Email : </label>
        <div className="input-field">
        {!editEmail ? <div className="input-box">{currentUser.email}</div>: <input
          type="email"
          id="username"
          placeholder={`${currentUser.email}`}
          onChange={(e) => setnewEmail(e.target.value)}
          // onBlur={(e) => verifyBeforeUpdateEmail(currentUser, e.target.value)}
          required
          />}

            <div className="icon-right">
                {!editEmail ? <PencilIcon className="icon" onClick={() => setEditEmail(!editEmail)}/> : <CheckIcon className="icon" onClick={() => {setEditEmail(!editEmail); updateEmail()}}/>}
            </div>
      </div>
      </div>
      <button
        onClick={signUserOut}
        className="primary"
        style={{ display: "flex", alignItems: "center" }}>
        <ArrowRightOnRectangleIcon
          className="icon"
          style={{ marginRight: "5px" }}
        />
        Log out
      </button>
    </>
  );
}

import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import LeftContainer from "../components/LeftContainer";

import Alert from "../components/Alert";

import { AtSymbolIcon, LockClosedIcon, LockOpenIcon, UserIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  async function handleRegSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    
    if (password !== confirmPassword) {
      setError('password-not-same');
      setIsLoading(false);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setError(''); 
      }, 3000);
      return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        setIsLoading(false);
        await updateProfile(user, {
          displayName: username,
        })
        navigate("/LoginPage");
      } catch (err) {
        setError(err.code);
        setIsLoading(false);
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setError(''); 
        }, 3000);
      }
  }
  return (
    <>
      {showAlert && <Alert error={error}/>}
      <div className="container">
        <div className="left">
          <LeftContainer />
        </div>
        <div className="right">
          <div className="title">
            <h2>Create account</h2>
          </div>
          <form onSubmit={handleRegSubmit}>
            <div className="input-field">
            <input
              type="text"
              id="username"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              required
              placeholder="Name"
              autoComplete="off"
            />
              <div className="icon-right"><UserIcon className="icon"/></div>
            </div>
            <div className="input-field">
            <input
              type="email"
              id="Email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              placeholder="Email"
              autoComplete="off"
            />
              <div className="icon-right"><AtSymbolIcon className="icon"/></div>

            </div>
            <div className="input-field">
            <input
              type="password"
              id="pass"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
              placeholder="Password"
            />
            <div className="icon-right"><LockClosedIcon className="icon"/></div>
            </div>
            <div className="input-field">
              <input
                type={showPassword ? "text" : "password" }
                id="confirmPassword"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
                required
                placeholder="Confirm Password"
              />
              <div className="icon-right">
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <LockOpenIcon className="icon"/> : <LockClosedIcon className="icon"/>}
                </button>
              </div>
            </div>
            <button type="submit" className="primary" style={{ width: "100%", marginTop: "25px" }} disabled={isLoading && true}>
              {isLoading ? (
                <>
                  Creating <span className="dots">.</span>
                  <span className="dots">.</span>
                  <span className="dots">.</span>
                </>
              ) : (
                "Create"
              )}
            </button>
          </form>
          <div className="login_text">
            <Link to="/LoginPage">
              Already have an account ?<span>Login</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

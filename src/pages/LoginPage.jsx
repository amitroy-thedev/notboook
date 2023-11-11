import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { signInWithEmailAndPassword, getAuth, sendPasswordResetEmail } from "firebase/auth";
import LeftContainer from "../components/LeftContainer";
import Alert from "../components/Alert";

import { LockClosedIcon, AtSymbolIcon, LockOpenIcon } from "@heroicons/react/24/outline";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRem, setShowRem] = useState(false);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const auth = getAuth();

  async function handleLogSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setIsLoading(false);
      navigate("/Dashboard/Main");
      // localStorage.setItem("isAuth", true);
    } catch (err) {
      setError(err.code);
      setIsLoading(false);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setError("");
      }, 3000);
    }
  }

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try{
      await sendPasswordResetEmail(auth, email)
      setError("reset-sent");
      setIsLoading(false);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setError("");
      }, 5000);
    }catch(err){
      setError(err.code);
      setIsLoading(false);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setError("");
      }, 3000);
    }
  }
  return (
    <>
      {showAlert && <Alert error={error} />}
      <div className="container">
        <div className="left">
          <LeftContainer />
        </div>
        <div
          className="right"
        >
          <div className="title">
            <h2>{showRem ? "Forgot Password" : "Welcome Back !"}</h2>
          </div>
          {showRem ? <form onSubmit={handleReset}>
            <div className="input-field">
            <input
              type="email"
              id="Email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              placeholder="Email"
            />
            <div className="icon-right">
                <AtSymbolIcon className="icon"/>
              </div>
            </div>
            <button
              type="submit"
              className="primary w100"
              style={{ marginTop: "25px" }}
              disabled={isLoading && true}
            >
              {isLoading ? (
                <>
                  Requesting <span className="dots">.</span>
                  <span className="dots">.</span>
                  <span className="dots">.</span>
                </>
              ) : (
                "Request Reset Link"
              )}
            </button>
            </form> : 
          <form onSubmit={handleLogSubmit}>
            <div className="input-field">
            <input
              type="email"
              id="Email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              placeholder="Email"
            />
            <div className="icon-right">
                <AtSymbolIcon className="icon"/>
              </div>
            </div>
            <div className="input-field">
              <input
                type={showPassword ? "text" : "password" }
                id="pass"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
                placeholder="Password"
              />
              <div className="icon-right">
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <LockOpenIcon className="icon"/> : <LockClosedIcon className="icon"/>}
                </button>
              </div>
            </div>
            <div className="input-field">
              <button type="button" onClick={() => setShowRem(true)}>Forgot password ?</button>
            </div>
            <button
              type="submit"
              className="primary w100"
              style={{ marginTop: "25px" }}
              disabled={isLoading && true}
            >
              {isLoading ? (
                <>
                  Logging <span className="dots">.</span>
                  <span className="dots">.</span>
                  <span className="dots">.</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>}
          {!showRem && <div className="pass-info">
            Click on the <LockClosedIcon className="icon"/> icon to <LockOpenIcon className="icon"/> and see password
          </div>}
          <div className="login_text">
            {showRem ? <Link to="/LoginPage">
              I remember my password <span>Login</span>
            </Link> : 
            <Link to="/RegisterPage">
              Don't have any account yet <span>Create one</span>
            </Link>}
          </div>
        </div>
      </div>
    </>
  );
}

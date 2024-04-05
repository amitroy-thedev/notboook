import React from "react";

export default function Alert({ error }) {
  let errorMessage = "";
  let backgroundColor = "orange";

  switch (error) {
    // For Login
    case "auth/wrong-password":
      errorMessage = ("You typed wrong password.");
      backgroundColor = "red";
      break;
    case "auth/user-not-found":
      errorMessage = "There is no user record corresponding to this email.";
      backgroundColor = "red";
      break;
    case "auth/too-many-requests":
      errorMessage =
        "Too many unsuccessful login attempts. Please try again later.";
      break;

    // For Reset Password
    case "reset-sent":
      errorMessage =
        "Reset Instruction has been sent to your email ID";
      break;
      
    // For Registration
    case "auth/invalid-email":
      errorMessage = "The email address is badly formatted.";
      backgroundColor = "red";
      break;
    case "auth/email-already-in-use":
      errorMessage = "The email address is already in use.";
      break;
    case "auth/weak-password":
      errorMessage = "The password must be at least 6 characters long.";
      break;
    case "password-not-same":
      errorMessage = "Confirm password should be same";
      break;
    case "auth/network-request-failed":
      errorMessage =
        "A network error has occurred. Please check your internet connection.";
      break;
    default:
      errorMessage =
        "There is some issue from our side please come back after some time.";
      break;

      // For Note
      case "note-already-added":
        errorMessage = "The note is already added please check your public folder.";
        break;
      case "note-added":
        errorMessage = "Note added successfully !!";
        backgroundColor = "green";
        break;
      case "note-marked":
        errorMessage = "Note marked successfully !!";
        backgroundColor = "green";
        break;
      case "note-unmarked":
        errorMessage = "Note unmarked successfully !!";
        backgroundColor = "red";
        break;
  }

  return (
    <>
      <div className="alert" style={{ backgroundColor: `${backgroundColor}` }}>
        {errorMessage}
      </div>
    </>
  );
}

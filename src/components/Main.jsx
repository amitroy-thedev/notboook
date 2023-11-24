import React, { useState, useEffect } from "react";
import "../pages/Dashboard.css";
import { useAuth } from "../contexts/AuthContext";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { collection, onSnapshot, where, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ShowExtended from '../components/ShowExtended';


export default function Main() {
  const { currentUser } = useAuth();
  const [totalNoOfNotes, setTotalNoOfNotes] = useState();
  const [totalNoOfSnaps, setTotalNoOfSnaps] = useState();
  const [snapsList, setSnapsList] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [showExtendedNote, setShowExtendedNote] = useState("");
  const [selectedNote, setSelectedNote] = useState("");


  ChartJS.register(ArcElement, Tooltip, Legend);

  const data = {
    labels: ["Notes", "Snaps", "QnA", "Reminders"],
    datasets: [
      {
        label: "completed",
        data: [totalNoOfNotes, totalNoOfSnaps, 1, 1],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    const notesQuery = query(
      collection(db, "notes"),
      where("userID", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const snapsQuery = query(
      collection(db, "snaps"),
      where("userID", "==", currentUser.uid)
    );

    const unsubscribeNotes = onSnapshot(
      notesQuery,
      (notesSnapshot) => {
        const notesData = notesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setNotesList(notesData);
        setTotalNoOfNotes(notesSnapshot.size);
      },
      (err) => {
        console.log("Error fetching notes:", err);
      }
    );

    const unsubscribeSnaps = onSnapshot(
      snapsQuery,
      (snapsSnapshot) => {
        const snapsData = snapsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setSnapsList(snapsData);
        setTotalNoOfSnaps(snapsSnapshot.size);
      },
      (err) => {
        console.log("Error fetching snaps:", err);
      }
    );

    return () => {
      unsubscribeNotes();
      unsubscribeSnaps();
    };
  // eslint-disable-next-line
  }, []);

  const extendNote = (note) => {
    setShowExtendedNote(!showExtendedNote);
    setSelectedNote(note);
  }

  return (
    <>
    {showExtendedNote && <ShowExtended 
      selectedNote={selectedNote}
      setShowExtendedNote={setShowExtendedNote} 
      />}

      <p>
        Hey,{" "}
        <span style={{ fontWeight: "bold" }}>{currentUser.displayName}</span>
      </p>
      <div className="wrapper w100">
        <div className="box">
          <div className="header">
            <h2>Overall Information</h2>
          </div>
          <div className="chart">
            <Doughnut data={data} />
          </div>
        </div>
        <div className="mainbody">
          <h2>Your Recent Works</h2>
          <h3>Note :</h3>
          <div className="no-note-templete">
      {notesList.length === 0 && <img src="../static/media/norecentnote.00b4d2eb7ec862d178cd.png" alt="no notes" height="200px"/>}
          </div>
          <div className="recent-note">
          {notesList
            .slice(0, 5)
            .map((note) => (
              <div className="note" key={note.id} onClick={() => extendNote(note)}>
                <h3 dangerouslySetInnerHTML={{__html: (note.title === "" ? "No Title" : note.title.length > 15 ? `${note.title.slice(0, 15).replace('<br>' , ' ')}...` : note.title)}}/>
                <p dangerouslySetInnerHTML={{__html: (note.note.length > 30 ? `${note.note.slice(0, 30).replace('<br>' , ' ')}...` : note.note)}}/>
              </div>
            ))}
          </div>
          <h3>Snaps :</h3>
          <div className="recent-snaps">
          {snapsList
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5)
            .map((snap) => (
              <div className="note" key={snap.id}>
               <img src={snap.image} alt={snap.subject}/>
               <p>{snap.desc === "" ? "No Desc" : (snap.desc.length > 25 ? `${snap.desc.slice(0, 25)}...` : snap.desc)}</p>
             </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

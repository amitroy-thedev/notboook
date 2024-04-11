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
  const [totalNoOfMarkedNote, setTotalNoOfMarkedNote] = useState();
  const [totalNoOfPublicNotes, setTotalNoOfPublicNotes] = useState();
  const [markedList, setMarkedList] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [publicList, setPublicList] = useState([]);
  const [showExtendedNote, setShowExtendedNote] = useState("");
  const [selectedNote, setSelectedNote] = useState("");
  const [isPubliclyAddedNote, setIsPubliclyAddedNote] = useState(false);


  ChartJS.register(ArcElement, Tooltip, Legend);

  const data = {
    labels: ["Notes", "Marked", "Added from Public"],
    datasets: [
      {
        label: "completed",
        data: [totalNoOfNotes, totalNoOfMarkedNote, totalNoOfPublicNotes],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  useEffect(() => {
    const notesQuery = query(
      collection(db, "notes"),
      where("userID", "==", currentUser.uid),
      orderBy("createdAt", "desc")
      );
      
    const markedQuery = query(
      collection(db, "notes"),
      where("userID", "==", currentUser.uid),
      where("markedBy", "array-contains", currentUser.uid)
      );

    const publicQuery = query(
      collection(db, "publiclyAccessNotes"),
      where("userID", "==", currentUser.uid),
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

    const unsubscribeMarked = onSnapshot(
      markedQuery,
      (markedSnapshot) => {
        const markedData = markedSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMarkedList(markedData);
        setTotalNoOfMarkedNote(markedSnapshot.size);
      },
      (err) => {
        console.log("Error fetching marked notes:", err);
      }
    );

    const unsubscribePublic = onSnapshot(
      publicQuery,
      (publicSnapshot) => {
        const publicData = publicSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPublicList(publicData);
        setTotalNoOfPublicNotes(publicSnapshot.size);
      },
      (err) => {
        console.log("Error fetching publicly added notes:", err);
      }
    );

    return () => {
      unsubscribeNotes();
      unsubscribeMarked();
      unsubscribePublic();
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
      isPubliclyAddedNote={isPubliclyAddedNote}
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
          <div className="recent">
          <div className="recent-note">
          <h3>Note :</h3>
      {totalNoOfNotes === 0 && <><p>No recent note</p> <img src="../static/media/norecentnote.9a74f4fe4508a3f090e9.png" alt="no recent note" /> </>}
          {notesList
            .slice(0, 5)
            .map((note) => (
              <div className="note" key={note.id} onClick={() => extendNote(note)}>
                <h3 dangerouslySetInnerHTML={{__html: (note.title > 15 ? `${note.title.slice(0, 15).replace('<br>' , ' ')}...` : note.title)}}/>
                <p dangerouslySetInnerHTML={{__html: (note.note.length > 30 ? `${note.note.slice(0, 30).replace('<br>' , ' ')}...` : note.note)}}/>
              </div>
            ))}
          </div>
          <div className="recent-note">
          <h3>Marked :</h3>
      {totalNoOfMarkedNote === 0 && <><p>No recent marked</p> <img src="../static/media/norecentnote.9a74f4fe4508a3f090e9.png" alt="no recent note" /> </>}
          {markedList
            .slice(0, 5)
            .map((marked) => (
              <div className="note" key={marked.id} onClick={() => extendNote(marked)}>
                <h3 dangerouslySetInnerHTML={{__html: (marked.title === "" ? "No Title" : marked.title.length > 15 ? `${marked.title.slice(0, 15).replace('<br>' , ' ')}...` : marked.title)}}/>
                <p dangerouslySetInnerHTML={{__html: (marked.note === "" ? "No Description" : marked.note.length > 30 ? `${marked.note.slice(0, 30).replace('<br>' , ' ')}...` : marked.note)}}/>
              </div>
            ))}
          </div>
          <div className="recent-note">
          <h3>Public :</h3>
      {totalNoOfPublicNotes === 0 && <><p>No recent public</p> <img src="../static/media/norecentnote.9a74f4fe4508a3f090e9.png" alt="no recent note"/> </>}
          {publicList
            .slice(0, 5)
            .map((note) => (
              <div className="note" key={note.id} onClick={() => { extendNote(note); setIsPubliclyAddedNote(true)}}>
                <h3 dangerouslySetInnerHTML={{__html: (note.title > 15 ? `${note.title.slice(0, 15).replace('<br>' , ' ')}...` : note.title)}}/>
                <p dangerouslySetInnerHTML={{__html: (note.note.length > 30 ? `${note.note.slice(0, 30).replace('<br>' , ' ')}...` : note.note)}}/>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

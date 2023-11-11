import React, { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  where,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../contexts/AuthContext';
import ShowExtended from '../components/ShowExtended';

export default function Favourite() {
  const { currentUser } = useAuth();
  const [ markedNotes, setMarkedNotes ] = useState([]);
  const [ markedSnaps, setMarkedSnaps ] = useState([]);
  const [showExtendedNote, setShowExtendedNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");

  useEffect(() => {
    const notesQuery = query(
      collection(db, "notes"),
      where("userID", "==", currentUser.uid),
      where("isMarked", "==", true)
    );  
    const snapsQuery = query(
      collection(db, "snaps"),
      where("userID", "==", currentUser.uid),
      where("isMarked", "==", true)
    );  

    const unsubscribeNotes = onSnapshot(
      notesQuery,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMarkedNotes(notesData);
      },
      (err) => {
        console.log('Error fetching snaps:', err);
      }
    );

    const unsubscribeSnaps = onSnapshot(
      snapsQuery,
      (snapshot) => {
        const snapsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMarkedSnaps(snapsData);
      },
      (err) => {
        console.log('Error fetching snaps:', err);
      }
    );
    return () => {
      unsubscribeNotes();
      unsubscribeSnaps();
    };
  }, [currentUser.uid]);
 
  const extendNote = (note) => {
    setShowExtendedNote(!showExtendedNote);
    setSelectedNote(note);
  }

  return (
    <div>
      {showExtendedNote && <ShowExtended 
      selectedNote={selectedNote}
      setShowExtendedNote={setShowExtendedNote} 
      />}

      <p>Total marked Notes: {markedNotes.length}</p>
      <div className="marked-list">
      {markedNotes
      .sort((a,b) => b.markedAt - a.markedAt)
      .map((note) => (
        <div className="marked-note" key={note.id} onClick={() => extendNote(note)}>
          <h3>{note.title === "" ? "No Title" : (note.title.length > 20 ? `${note.title.slice(0, 20)}...` : note.title)}</h3>
          <p>{note.note && note.note.length > 15 ? `${note.note.slice(0, 15)}...` : note.note}</p>
        </div>
      ))}
      </div>

      <p>Total marked Snaps: {markedSnaps.length}</p>
      <div className="marked-list">
      {markedSnaps.map((snap) => (
        <div className="marked-snap marked-note" key={snap.id} onClick={() => extendNote(snap)}>
          <img src={snap.image} alt={snap.subject}/>
          <p>{snap.desc === "" ? "No Desc" : (snap.desc.length > 20 ? `${snap.desc.slice(0, 20)}...` : snap.desc)}</p>
        </div>
      ))}
      </div>
    </div>
  );
  
}

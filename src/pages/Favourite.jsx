import React, { useEffect, useState } from 'react';
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
  const [publicList, setPublicList] = useState([]);
  const [showExtendedNote, setShowExtendedNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [isPubliclyAddedNote, setIsPubliclyAddedNote] = useState(false);

  useEffect(() => {
    const notesQuery = query(
      collection(db, "notes"),
      // where("userID", "==", currentUser.uid),
      where("markedBy", "array-contains", currentUser.uid)
      );    
      const publicQuery = query(
        collection(db, "publiclyAccessNotes"),
        where("userID", "==", currentUser.uid),
        where("markedBy", "array-contains", currentUser.uid)
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
          alert('Error fetching marked notes:', err);
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
          },
          (err) => {
            alert("Error fetching publicly available notes:", err);
          }
        );

        return () => {
      unsubscribePublic();
      unsubscribeNotes();
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
      <p >Private and Explore <span className='no-of-notes'>{markedNotes.length}</span></p>
      <div className="marked-list">
      {markedNotes
      .sort((a,b) => b.markedAt - a.markedAt)
      .map((note) => (
        <div className="marked-note" key={note.id} style={{display: "flex"}}>
          <div className="marked-body" onClick={() => extendNote(note)}>
            <h3>{note.title === "" ? "No Title" : (note.title.length > 20 ? `${note.title.slice(0, 20)}...` : note.title)}</h3>
            <p>{note.note && note.note.length > 15 ? `${note.note.slice(0, 15)}...` : note.note}</p>
          </div>
        </div>
        ))}
      </div>
      <p>Public <span className='no-of-notes'>{publicList.length}</span></p>
      <div className="marked-list">
      {publicList
      .sort((a,b) => b.markedAt - a.markedAt)
      .map((note) => (
        <div className="marked-note" key={note.id} style={{display: "flex"}}>
          <div className="marked-body" onClick={() => { extendNote(note); setIsPubliclyAddedNote(true)}}>
            <h3>{note.title === "" ? "No Title" : (note.title.length > 20 ? `${note.title.slice(0, 20)}...` : note.title)}</h3>
            <p>{note.note && note.note.length > 15 ? `${note.note.slice(0, 15)}...` : note.note}</p>
          </div>
        </div>
        ))}
      </div>
    </>
  );
  
}

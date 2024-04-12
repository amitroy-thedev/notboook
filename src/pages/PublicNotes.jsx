import { arrayRemove, arrayUnion, collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import ShowExtended from "../components/ShowExtended";
import { BookmarkIcon, TagIcon } from "@heroicons/react/24/outline";

export default function PublicNotes() {
  const [publicList, setPublicList] = useState([]);
  const [isMarked, setIsMarked] = useState(false);
  const [showExtendedNote, setShowExtendedNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");

  const {currentUser} = useAuth();
  useEffect(() => {
    const publicQuery = query(
      collection(db, "publiclyAccessNotes"),
      where("userID", "==", currentUser.uid),
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
        console.log("Error fetching publicly added notes:", err);
      }
    );

    return () => {
      unsubscribePublic();
    };
  // eslint-disable-next-line
  }, []);

  const extendNote = (note) => {
    setShowExtendedNote(!showExtendedNote);
    setSelectedNote(note);
  }

  const markNote = async (noteId) => {
    setIsMarked(!isMarked);
    await updateDoc(doc(db, 'publiclyAccessNotes', noteId), {
      'markedBy': isMarked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    })
  }

    return(
        <>
        {showExtendedNote && <ShowExtended 
            selectedNote={selectedNote} 
            setShowExtendedNote={setShowExtendedNote} 
            setIsMarked={setIsMarked} 
            isMarked={isMarked}
            isPubliclyAddedNote="true"
        />}
        <div className="no-note-templete">
      {publicList.length === 0 && 
      <p className="no-notes">
         No Public notes
      </p>}
      {publicList.length === 0 && <><img src="https://firebasestorage.googleapis.com/v0/b/notboook-v2.appspot.com/o/addnewnote.gif?alt=media&token=69180ab5-d62f-4c6f-9b37-808f320cf804" alt="No notes" height="300px" style={{marginTop: "20px"}}/>
          <div className="steps">
            <h3>Steps to add a note</h3>
      <ol>
        <li>Go to <svg className="svgIcon" viewBox="0 0 512 512" height="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path></svg></li>
        <li>Click on a note you want to add</li>
        <li>Then click on + icon</li>
      </ol>
          </div></>}
      </div>
        <div className="explore-list">
      {publicList
        // .filter((note) => note.title?.toLowerCase().includes(searchWord.toLowerCase()))
        .map((note) => (
        <div className="explore"
        key={note.id}
        >
        <div className="header">
        <button className="markbtn" onClick={() => markNote(note.id)} style={{right: "0"}}>
          {note?.markedBy?.includes(currentUser.uid) ? (
            <BookmarkIcon className="icon" style={{fill: "black"}} />
            ) : (
            <BookmarkIcon className="icon" />
          )}
        </button>
          <h3>{note.title === "" ? "No Title" : (note.title.length > 20 ? `${note.title.slice(0, 20)}...` : note.title)}</h3>
        </div>
          <div className="note-body" onClick={() => extendNote(note)}>
            <p
              dangerouslySetInnerHTML={{
                __html:
                  note.note && note.note.length > 100 ? `${note.note.slice(0, 100)}...` : note.note
              }}
            />
          </div>
          <div className="tag-container">
              {note.tag && 
              <div className="tag">
              <TagIcon className="icon"/>
              <p>{note.tag}</p>
              </div>}
            </div>
          <div className="bottom">
            <p>{note.addedOn.toDate().toDateString()}</p>
            {/* <button className="publicbtn" onClick={() => markPublic(note.id)} style={{marginRight:"30px"}}>
          {note.isPublic ? (
            <LockOpenIcon className="icon"/>
            ) : (
            <LockClosedIcon className="icon"/>
          )}
        </button> */}

          </div>
          {note.addedFrom && <p className="addedfrom">Added From {note.addedFrom}</p>}
            
          </div>
          ))}
      </div>
      </>
    );
}
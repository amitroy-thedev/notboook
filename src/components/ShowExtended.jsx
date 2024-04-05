import React, { useState,  useEffect, useRef } from "react";
import { saveAs } from "file-saver";

import {
  ArrowDownTrayIcon,
  BookOpenIcon,
  BookmarkIcon,
  CheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  MoonIcon,
  PencilIcon,
  PlusIcon,
  StopIcon,
  SunIcon,
  TagIcon,
  TrashIcon,
  WrenchIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { updateDoc, doc, deleteDoc, addDoc, collection, getDoc, onSnapshot, where, query, arrayRemove, arrayUnion} from "firebase/firestore";
import { db } from "../firebase";
import ShareQR from "./ShareQR";
import { useAuth } from "../contexts/AuthContext";
import Alert from "./Alert";
import Markdown from "react-markdown";

export default function ShowExtended({ selectedNote, setShowExtendedNote, isPubliclyAddedNote }) {
  const [isEditable, setIsEditable] = useState(false);
  const [editableNote, setEditableNote] = useState(selectedNote.note);
  const [showTagInput, setShowTagInput] = useState(false);
  const [incFontsize, setIncFontsize] = useState(false);
  const [fontsize, setFontsize] = useState(16);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [publiclyAddedNotesList, SetPubliclyAddedNotesList] = useState([]);
  const [split, setSplit] = useState(false); 
  const [generatedQR, setGeneratedQR] = useState("");
  const [tag, setTag] = useState("");
  const [error, setError] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const noteRef = doc(db, isPubliclyAddedNote ? "publiclyAccessNotes" : "notes", selectedNote.id);

  const { currentUser } = useAuth();

  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState(null);

  const downloadNoteRef = useRef(null);
  
  const downloadNote = () => {
    const title = selectedNote.title === "" ? "No Title" : selectedNote.title;
  
    // Replace <br> tags with new lines in selectedNote.note
    const plainNote = selectedNote.note.replace(/<br\s*\/?>/g, "\n").replace(/&nbsp;/g, " ");
  
    const noteContent = `
      Title: ${title}
      Note: ${plainNote}
    `;
  
    try {
      const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${title}.txt`);
    } catch (error) {
      alert("Error while downloading Note", error);
    }
  };

  useEffect(() => {
    const filtered = query(
      collection(db, "publiclyAccessNotes"),
      where("userID", "==", currentUser.uid),
    );

    const unsubscribe = onSnapshot(
      filtered,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        SetPubliclyAddedNotesList(notesData);
      },
      (err) => {
        alert("Error fetching notes:", err);
      }
    );

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(selectedNote.note);
    setUtterance(u);
    return () => {
      synth.cancel();
    };
  }, [selectedNote.note]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;
    if (isPaused) {
      synth.resume();
    }
    synth.speak(utterance);
    setIsPaused(false);
    setIsPlaying(!isPlaying);
    utterance.onend = () => {
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPaused(false);
    setIsPlaying(!isPlaying);
  };


  const handleEditNote = () => {
    setIsEditable(!isEditable);
  };

  const shareNote = () => {
    setGeneratedQR(selectedNote.id);
    const handleKeyDown = (event) => {
      if (event.keyCode === 27) {
        setGeneratedQR("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
  };

  async function deleteNote() {
    await deleteDoc(noteRef);
    setShowExtendedNote(false);
  }

  const addTag = async (e) => {
    e.preventDefault();
    if (tag) {
      await updateDoc(noteRef, { tag: tag });
      setTag("");
      setShowTagInput(!showTagInput);
    }
  };

  const markNote = async () => {
    await updateDoc(noteRef, {
      'markedBy': selectedNote?.markedBy?.includes(currentUser.uid) ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    })
    setError(selectedNote?.markedBy?.includes(currentUser.uid) ? "note-unmarked" : "note-marked");
    setTimeout(() => {
      setError("");
    }, 2000);
  }

  const splitTheme = () => {
    setSplit(!split);
  }
  async function addNote() {
    const findNoteSnapshot = await getDoc(noteRef);
    
      const addNoteData = {
        title: findNoteSnapshot.data().title || '',
        note: findNoteSnapshot.data().note || '',
        // tag,
        isMarked: false,
        user: currentUser.displayName,
        userID: currentUser.uid,
        addedFrom: findNoteSnapshot.data().user,
        addedOn: new Date()
      }
      const isNoteAlreadyAdded = publiclyAddedNotesList.some(
        (note) =>
          note.title === addNoteData.title &&
          note.note === addNoteData.note
      );
      if(!isNoteAlreadyAdded){
        await addDoc(collection(db, "publiclyAccessNotes"), addNoteData);
        setError("note-added");
      setTimeout(() => {
        setError("");
      }, 3000);
      }else{
        setError("note-already-added");
      setTimeout(() => {
        setError("");
      }, 3000);
      }
  }

  const components = {
    image: ({ src, alt }) => <img src={src} alt={alt} />,
  }; 
  const removeTag = async () => {
    await updateDoc(noteRef, { tag: "" });
  };

  return (
    <>
    {error && <Alert error={error} />}
    <div className="back">
      <ShareQR setGeneratedQR={setGeneratedQR} generatedQR={generatedQR}/>

      <div className={`note-card note-container ${split ? "night" : ""}`}>
        <button onClick={() => setShowExtendedNote(false)} className="card-closebtn">
          <XMarkIcon className="icon" />
        </button>
        <button className="markbtn" onClick={() => markNote()}>
          {selectedNote?.markedBy?.includes(currentUser.uid) ? (
            <BookmarkIcon className="icon" style={{ fill: `${split ? "white" : "black"}`}} />
            ) : (
            <BookmarkIcon className="icon" />
          )}
        </button>
        <button className="publicbtn">
          {selectedNote.isPublic ? (
            <LockOpenIcon className="icon"/>
            ) : (
            <LockClosedIcon className="icon"/>
          )}
        </button>
        <div className="download-note" ref={downloadNoteRef}>
        <div className="note-title">
          <h3
            contentEditable={isEditable}
            onBlur={(e) => updateDoc(noteRef, { title: e.target.textContent })}
          >
            {selectedNote.title === "" ? "No Title" : selectedNote.title}
          </h3>
        </div>
        <div className="extended-note w100 h100">
          <div className="note-body">
            {isEditable ? <p
            contentEditable={isEditable}
            onBlur={(e) => updateDoc(noteRef, { note: e.target.innerHTML.replace(/<div>/g, '<br>').replace(/<\/div>/g, '') })}
            onChange={(e) => setEditableNote(e.target.innerHTML)}
            style={{ fontSize: `${fontsize}px` }}
            dangerouslySetInnerHTML={{ __html: editableNote }}
            />: 
            <Markdown className="markdown" components={components}>{editableNote.replace(/<br>/g, '\n')}</Markdown>
            }
          </div>
        </div>
      </div>
      </div>
      <div className="option w100">
      <div className="menu">
      {showTagInput && (
        <div className="tag-container">
        <form onSubmit={(e) => addTag(e)}>
          <input
            type="text"
            placeholder="Add you tag here"
            onChange={(e) => setTag(e.target.value)}
          />
          <button type="submit"><PlusIcon className="icon"/></button>
        </form>
        </div>
      )}</div>
      <div className="menu">
      {incFontsize && (<>
        <p style={{fontSize: "16px"}}>T</p>
        <input type="range" min="16" max="26" value={fontsize} onChange={(e) => setFontsize(e.target.value)} className="custom-range"/>
        <p style={{fontSize: "26px"}}>T</p></>
        )}
      </div>
      <div className="tools w100">
        {!showSetting && (
          <>
            {(selectedNote.isPublic && !(selectedNote.userID === currentUser.uid ))?
            <button onClick={addNote}><PlusIcon className="icon"/></button> :
            <button onClick={handleEditNote}>
              {isEditable ? (
                <CheckIcon className="icon" />
              ) : (
                <PencilIcon className="icon" />
              )}
            </button>
          }
            <button onClick={shareNote}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
              {/* <ShareIcon className="icon" /> */}
            </button>
           <button onClick={splitTheme}>
              {split ? <SunIcon className="icon" /> : <MoonIcon className="icon" />}
            </button>
            <button onClick={downloadNote}>
              <ArrowDownTrayIcon className="icon"/>
            </button>
          </>
        )}
        {showSetting && (
          <>
            {(selectedNote.tag) ? (
              <button onClick={removeTag} disabled={!(selectedNote.userID === currentUser.uid )}>
                <TagIcon className="icon" style={{ fill: "black" }} />
              </button>
            ) : (
              <button onClick={() => setShowTagInput(!showTagInput)} disabled={!(selectedNote.userID === currentUser.uid )}>
                <TagIcon className="icon" />
              </button>
            )}
            {isPlaying ? 
            <button  onClick={handleStop}><StopIcon className="icon"/></button> : 
            <button onClick={handlePlay}><BookOpenIcon className="icon" /></button>
            }
            <button onClick={() => setIncFontsize(!incFontsize)}>
              <p className="icon">T</p>
            </button>
            {confirmDelete ? <button onClick={deleteNote} onBlur={() => setConfirmDelete(!confirmDelete)}>
              <CheckIcon className="icon" />
            </button>: <button onClick={() => setConfirmDelete(!confirmDelete)} disabled={!(selectedNote.userID === currentUser.uid )}>
              <TrashIcon className="icon" />
            </button>}
          </>
        )}
        <button onClick={() => setShowSetting(!showSetting)}>
        {showSetting ? <XMarkIcon className="icon" /> : <WrenchIcon className="icon" />}
      </button>
        </div>
      </div>
    </div>
    </>
  );
}

import React, { useState,  useEffect, useRef } from "react";
import { saveAs } from "file-saver";

import {
  ArrowDownTrayIcon,
  BookOpenIcon,
  BookmarkIcon,
  CheckIcon,
  MoonIcon,
  PencilIcon,
  PlusIcon,
  ShareIcon,
  StopIcon,
  SunIcon,
  TagIcon,
  TrashIcon,
  WrenchIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import ShareQR from "./ShareQR";

export default function ShowExtended({ selectedNote, setShowExtendedNote }) {
  const [isEditable, setIsEditable] = useState(false);
  const [editableNote, setEditableNote] = useState(selectedNote.note);
  const [showTagInput, setShowTagInput] = useState(false);
  const [incFontsize, setIncFontsize] = useState(false);
  const [fontsize, setFontsize] = useState(16);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [split, setSplit] = useState(false); 
  const [generatedQR, setGeneratedQR] = useState("");
  const [tag, setTag] = useState("");
  const [showSetting, setShowSetting] = useState(false);
  const noteRef = doc(db, "notes", selectedNote.id);

  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState(null);

  const downloadNoteRef = useRef(null);
  
  const downloadNote = () => {
    const title = selectedNote.title === "" ? "No Title" : selectedNote.title;
  
    // Replace <br> tags with new lines in selectedNote.note
    const plainNote = selectedNote.note.replace(/<br\s*\/?>/g, "\n");
  
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

  const splitTheme = () => {
    setSplit(!split);
  }
  const removeTag = async () => {
    await updateDoc(noteRef, { tag: "" });
  };

  return (
    <div className="back">
      <ShareQR setGeneratedQR={setGeneratedQR} generatedQR={generatedQR}/>

      <div className={`note-card note-container ${split ? "night" : ""}`}>
        <button onClick={() => setShowExtendedNote(false)} className="card-closebtn">
          <XMarkIcon className="icon" />
        </button>
        <button className="markbtn">
          {selectedNote.isMarked ? (
            <BookmarkIcon className="icon" style={{fill: "black"}} />
            ) : (
            <BookmarkIcon className="icon" />
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
            <p
            contentEditable={isEditable}
            onBlur={(e) => updateDoc(noteRef, { note: e.target.innerHTML.replace(/<div>/g, '<br>').replace(/<\/div>/g, '') })}
            onChange={(e) => setEditableNote(e.target.innerHTML)}
            style={{ fontSize: `${fontsize}px` }}
            dangerouslySetInnerHTML={{ __html: editableNote }}
            />
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
            <button onClick={handleEditNote}>
              {isEditable ? (
                <CheckIcon className="icon" />
              ) : (
                <PencilIcon className="icon" />
              )}
            </button>
            <button onClick={shareNote}>
              <ShareIcon className="icon" />
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
            {!selectedNote.tag ? (
              <button onClick={() => setShowTagInput(!showTagInput)}>
                <TagIcon className="icon" />
              </button>
            ) : (
              <button onClick={removeTag}>
                <TagIcon className="icon" style={{ fill: "black" }} />
              </button>
            )}
            {isPlaying ? 
            <button  onClick={handleStop}><StopIcon className="icon"/></button> : 
            <button onClick={handlePlay}><BookOpenIcon className="icon" /></button>
            }
            <button onClick={() => setIncFontsize(!incFontsize)}>
              <p className="icon">T</p>
            </button>
            {confirmDelete ?  <button onClick={deleteNote} onBlur={() => setConfirmDelete(!confirmDelete)}>
              <CheckIcon className="icon" />
            </button>: <button onClick={() => setConfirmDelete(!confirmDelete)}>
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
  );
}

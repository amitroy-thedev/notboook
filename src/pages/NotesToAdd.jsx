import React, { useRef } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  where,
  query,
  getDoc,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import QrScanner from "qr-scanner";
import { CheckBadgeIcon, ExclamationTriangleIcon, XCircleIcon, XMarkIcon, BookmarkIcon, QrCodeIcon, MagnifyingGlassIcon, BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/24/outline";
import ShowExtended from "../components/ShowExtended";

export default function NotesToAdd() {
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  // const [tag, setTag] = useState("");
  const [searchWord, setSearchWord] = useState("");
  const [addShared, setAddShared] = useState("");
  const [notesList, setNotesList] = useState([]);
  const notesCollectionRef = collection(db, "notes");
  const { currentUser } = useAuth();
  const [isMarked, setIsMarked] = useState(false);
  const [whileAdding, setWhileAdding] = useState("");
  const [whileScan, setWhileScan] = useState("");
  // const [showTagInput, setShowTagInput] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showShared, setShowShared] = useState(false);
  const [showExtendedNote, setShowExtendedNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [file, setFile] = useState();
  const [sortOrder, setSortOrder] = useState('desc'); // Initial sort order is descending (newest first)
  const [showSearchNote, setShowSearchNote] = useState(false);
  const [changeViewType, setChangeViewType] = useState(false);

  
  const scanFileRef = useRef();

  useEffect(() => {
    const filtered = query(
      notesCollectionRef,
      where("userID", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      filtered,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setNotesList(notesData);
      },
      (err) => {
        alert("Error fetching notes:", err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser.uid, notesCollectionRef]);

  async function sendNote(e) {
    e.preventDefault();
    const noteToAdd = {
      title,
      note,
      // tag,
      isMarked: false,
      user: currentUser.displayName,
      userID: currentUser.uid,
      createdAt: new Date(),
      markedAt: "",
    };
    await addDoc(notesCollectionRef, noteToAdd);
    setNote("");
    setTitle("");
    setShowAdd(!showAdd)
  }

  const clearAll = () => {
    setTitle("");
    setNote("");
  }

  const addSharedNote = async (e) => {
    e.preventDefault();
    const findNoteRef = doc(db, 'notes', addShared);
    const findNoteSnapshot = await getDoc(findNoteRef);
    
    if (findNoteSnapshot.exists()) {
      const sharedNoteData = {
        title: findNoteSnapshot.data().title || '',
        note: findNoteSnapshot.data().note || '',
        // tag,
        isMarked: false,
        user: currentUser.displayName,
        userID: currentUser.uid,
        addedFrom: findNoteSnapshot.data().user,
        createdAt: new Date(),
      };
  
      // Check if the note already exists in notesList
      const isNoteAlreadyAdded = notesList.some(
        (note) =>
          note.title === sharedNoteData.title &&
          note.note === sharedNoteData.note
      );
  
      if (!isNoteAlreadyAdded) {
        await addDoc(notesCollectionRef, sharedNoteData);
        setWhileAdding(<><CheckBadgeIcon className="icon" style={{color: "green"}}/>Note added successfully</>);
      } else {
        setWhileAdding(<><ExclamationTriangleIcon className="icon" style={{color: "orange", width: "30px"}}/>Note already added. <br /> Try again with different share ID</>);
      }
    } else{
      setWhileAdding(<><XCircleIcon className="icon" style={{color: "red", width: "30px"}}/>Note Does not exist. <br /> Try again with a valid share ID</>);
    }
  };
  
  const markNote = async (noteId) => {
    setIsMarked(!isMarked);
    await updateDoc(doc(db, 'notes', noteId), { isMarked: !isMarked, markedAt: new Date() });
  };
  

  // const addTag = async (e) => {
  //   e.preventDefault();
  //   if (tag) {
  //     await updateDoc(doc(db, "notes", selectedNote.id), { tag: tag });
  //     setTag("");
  //     setShowTagInput(!showTagInput);
  //   }
  // };

  const extendNote = (note) => {
    setShowExtendedNote(!showExtendedNote);
    setSelectedNote(note);
  }

  const handleSortOrderChange = (e) => {
    const selectedSortOrder = e.target.value;
    setSortOrder(selectedSortOrder);
    
    setNotesList((prevNotesList) => {
      const sortedNotes = [...prevNotesList].sort((a, b) => {
        if (selectedSortOrder === 'asc') {
          return a.createdAt - b.createdAt; // Ascending sort order
        } else {
          return b.createdAt - a.createdAt; // Descending sort order
        }
      });
      return sortedNotes;
    });
  };
  
  const qrScan = async (e) => {
    const file = e.target.files[0];
    setFile(file);
      try{
       const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
       setTimeout(() => {
         setWhileScan("success-while-scan");
         setAddShared(result.data);
         setTimeout(() => {
          setWhileScan("success-while-scan");
          setWhileAdding("Unique share ID added successfully");
          setFile(null);
        }, 1500);
      }, 2000);
    }catch(err){
      setTimeout(() => {
        setWhileScan("err-while-scan");
        setWhileAdding(err);
        setTimeout(() => {
         setFile(null);
       }, 1500);
     }, 2000);
    };
  }
  return (
    <>
    <div className="top w100">
      <button onClick={() => setShowAdd(!showAdd)} className='primary'><span>Add a Note</span></button>
      {showAdd && 
      <div className="back">
      <div className="card note-container">
        <button onClick={() => setShowAdd(!showAdd)} className="card-closebtn"><XMarkIcon className="icon"/></button>
        <form onSubmit={sendNote}>
        <div className="note-title">
          <input
            type="text"
            id="title"
            value={title}
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="noteInputArea w100">
          <textarea
            placeholder="Type your note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button type="submit" disabled={!note && true} className="primary">+ Add the note</button>
        <button onClick={clearAll} disabled={!note && true} style={{marginLeft: "15px"}} className="secondary">Clear All</button>
      </form>
      </div>
      </div>}
              
      <button onClick={() => setShowShared(!showShared)} className='secondary'>Have Share ID ?</button>
      {showShared && 
      <div className="back">
      <div className="card">
        <button onClick={() => {setShowShared(!showShared); setWhileAdding(""); setFile(null); setWhileScan("")}} className="card-closebtn"><XMarkIcon className="icon"/></button>
        <div className="add-shared">
        <h3>Add a new Note from the Unique shared id</h3>
        <form onSubmit={(e) => addSharedNote(e)}>
        <input type="text" placeholder="YK1VyGSCLaNKMHfCZXSF"
        value={addShared}
        onChange={(e) => 
          {setAddShared(e.target.value);
          setWhileAdding("");
          }}/>
        <button type="submit" className="secondary" disabled={!addShared && true}> + Add</button>
        <button type="button" className="scanbtn" onClick={() => scanFileRef.current.click()}><QrCodeIcon className="icon"/></button>
        <input type="file" accept=".png, .jpg, .jpeg" onChange={qrScan} style={{display: "none"}} ref={scanFileRef}/>
        {file && (
        <div className='file'>
          <span className={`scanning w100 ${whileScan}`}></span>
          <span className="scanner w100 h100"></span>
          <img src={URL.createObjectURL(file)} alt="QR Preview" />
        </div>
        )}
        <div className="while-adding">{whileAdding}</div>
        </form>
        </div>
      </div>
      </div>}
      </div>
      <div className="filters">
        <button type="button" onClick={() => setShowSearchNote(!showSearchNote)}><span>{showSearchNote ? <XMarkIcon className="icon"/> : <MagnifyingGlassIcon className="icon"/>} Search</span></button>
        <button type="button">
          <span>{sortOrder === "asc" ? <BarsArrowUpIcon className="icon"/> : <BarsArrowDownIcon className="icon"/>}
          <select value={sortOrder} onChange={handleSortOrderChange}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          </span>
        </button>
        <button type="button" className="view" onClick={() => setChangeViewType(!changeViewType)}>
          <div className={`box1 ${changeViewType && "changeView"}`}></div>
          {!changeViewType && <div className="box2"></div>}
          <div className={`box3 ${changeViewType && "changeView"}`}></div>
          {!changeViewType && <div className="box4"></div>}
        </button>
      </div>
      {showSearchNote && <div className="input-field">
      <input type="text" placeholder="Search with Note title" onChange={(e) => setSearchWord(e.target.value)}/>
      </div>}
      {showExtendedNote && <ShowExtended 
      selectedNote={selectedNote} 
      setShowExtendedNote={setShowExtendedNote} 
      setIsMarked={setIsMarked} 
      isMarked={isMarked}
      />}
      <div className="notes-list">
      {notesList.length === 0 && <p className="no-notes">
         No Notes
      </p>}
      {searchWord && ( notesList.filter((note) => note.title.toLowerCase().includes(searchWord.toLowerCase())).length === 0) && 
      <p className="no-notes">
      No notes found with the title <b>{searchWord}</b>.
      </p>}


      {notesList
        .filter((note) => note.title.toLowerCase().includes(searchWord.toLowerCase()))
        .map((note) => (
        <div className={`${changeViewType ? "changeNoteView" : "notes"}`}
        key={note.id}
        >
        <div className="header">
        <button onClick={() => markNote(note.id)}>
          {note.isMarked ? (
            <BookmarkIcon className="icon" style={{fill: "black"}} />
            ) : (
            <BookmarkIcon className="icon" />
          )}
        </button>
          <h3>{note.title === "" ? "No Title" : (note.title.length > 20 ? `${note.title.slice(0, 20)}...` : note.title)}</h3>
        </div>

          <div className="note-body" onClick={() => extendNote(note)}>
            {changeViewType ? <p
              dangerouslySetInnerHTML={{
                __html:
                  note.note && note.note.length > 100 ? `${note.note.slice(0, 100)}...` : note.note
              }}
            /> :
            <p
              dangerouslySetInnerHTML={{
                __html:
                  note.note && note.note.length > 250 ? `${note.note.slice(0, 250)}...` : note.note
              }}
            />}
          </div>
          <div className="bottom">
            <p>{note.createdAt.toDate().toDateString()}</p>
          </div>
          {note.addedFrom && <p className="addedfrom">Added From {note.addedFrom}</p>}
            <div className="tag-container">
              {note.tag && 
              <div className="tag">
              <p>{note.tag}</p>
              </div>}
            </div>
          </div>
          ))}
      </div>
    </>
  );
}

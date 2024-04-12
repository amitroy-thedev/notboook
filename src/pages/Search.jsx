import { MagnifyingGlassIcon, XMarkIcon, BookmarkIcon, InformationCircleIcon, HeartIcon, BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    where,
    query,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
  } from "firebase/firestore";
import { db } from "../firebase";
import ShowExtended from "../components/ShowExtended";
import { useAuth } from "../contexts/AuthContext";

export default function Search(){
  const [searchTerm, setSearchTerm] = useState("");
  const [publicNotesList, setPublicNotesList] = useState([]);
  const [showExtendedNote, setShowExtendedNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [isMarked, setIsMarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const notesCollectionRef = collection(db, "notes");
  const { currentUser } = useAuth();
  const [sortOrderByLiked, setSortOrderByLiked] = useState('desc'); // Initial sort order is descending (newest first)
  const [sortOrderByMarked, setSortOrderByMarked] = useState('desc'); // Initial sort order is descending (newest first)
  const [noteInfoVisibility, setNoteInfoVisibility] = useState({});


    useEffect(() => {
        const filtered = query(
          notesCollectionRef,
          where("isPublic", "==", true)
        );
    
        const unsubscribe = onSnapshot(
          filtered,
          (snapshot) => {
            const notesData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            setPublicNotesList(notesData);
          },
          (err) => {
            console.log("Error fetching notes:", err);
          }
        );
    
        return () => {
          unsubscribe();
        };
        // eslint-disable-next-line
      }, []);

      const extendNote = (note) => {
        setShowExtendedNote(!showExtendedNote);
        setSelectedNote(note);
      }

      const showNoteInfo = (noteId) => {
        setNoteInfoVisibility((prevVisibility) => ({
          ...prevVisibility,
          [noteId]: !prevVisibility[noteId],
        }));
      };
    
      const markNote = async (noteId) => {
        setIsMarked(!isMarked);
        await updateDoc(doc(db, 'notes', noteId), {
          'markedBy': isMarked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
        })
      }
      const likeTheNote = async (noteId) => {
        setIsLiked(!isLiked);
        await updateDoc(doc(db, 'notes', noteId), {
          'likedBy': isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
        })
      }

      const handleSortByLiked = (e) => {
        const selectedSortOrder = e.target.value;
        setSortOrderByLiked(selectedSortOrder); // Update the sort order state
      
        setPublicNotesList((prevNotesList) => {
          const sortedNotes = [...prevNotesList].sort((a, b) => {
            const likedByA = a.likedBy?.length || 0;
            const likedByB = b.likedBy?.length || 0;
            if (selectedSortOrder === 'asc') {
              return likedByA - likedByB;
            } 
            else {
              return likedByB - likedByA;
            }
          });
          return sortedNotes;
        });
      };
      const handleSortByMarked = (e) => {
        const selectedSortOrder = e.target.value;
        setSortOrderByMarked(selectedSortOrder); // Update the sort order state
      
        setPublicNotesList((prevNotesList) => {
          const sortedNotes = [...prevNotesList].sort((a, b) => {
            const markedByA = a.markedBy?.length || 0;
            const markedByB = b.markedBy?.length || 0;
            if (selectedSortOrder === 'asc') {
              return markedByA - markedByB;
            } 
            else {
              return markedByB - markedByA;
            }
          });
          return sortedNotes;
        });
      };
      

    return (
    <>
    {showExtendedNote && <ShowExtended 
      selectedNote={selectedNote} 
      setShowExtendedNote={setShowExtendedNote} 
      />}
        <div className="input-field">
            <input type="text" placeholder="Search from public notes" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            <div className="icon-right">
                {searchTerm ? <button type="button" onClick={() => setSearchTerm("")}><XMarkIcon className="icon"/></button> : <MagnifyingGlassIcon className="icon"/>}
              </div>
        </div>
        <div className="filters">
        <button type="button">
          <span>
            {sortOrderByMarked === "asc" ? <BarsArrowUpIcon className="icon" /> : <BarsArrowDownIcon className="icon" />}
            <select value={sortOrderByMarked} onChange={handleSortByMarked}>
              <option value="desc">Most Marked</option>
              <option value="asc">Less Marked</option>
            </select>
          </span>
        </button>
        <button type="button">
          <span>
            {sortOrderByLiked === "asc" ? <BarsArrowUpIcon className="icon" /> : <BarsArrowDownIcon className="icon" />}
            <select value={sortOrderByLiked} onChange={handleSortByLiked}>
              <option value="desc">Most Liked</option>
              <option value="asc">Less Liked</option>
            </select>
          </span>
        </button>
      </div>

        {searchTerm && ( publicNotesList.filter((note) => note.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0) && 
      <p className="no-notes">
      No public notes found with the title <br /><b>{searchTerm}</b>.
      </p>}
      {publicNotesList.length === 0 && <div className="no-note-templete">
      <img src="https://firebasestorage.googleapis.com/v0/b/notboook-v2.appspot.com/o/nopublicnote.png?alt=media&token=814ee95c-04db-4f64-8925-6ff221052499" alt="No notes" height="200px"/>
        <p>Fetching notes...</p>
      </div>}

        <div className="explore-list">
      {publicNotesList
        .filter((note) => note.title?.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((note) => (
        <div className="explore"
        key={note.id}
        >
        <div className="header">
        <button onClick={() => markNote(note.id)}>
          {note?.markedBy?.includes(currentUser.uid) ? 
          (<BookmarkIcon className="icon" style={{fill: "black"}} />) : (
    <BookmarkIcon className="icon" />)}
        </button>
        <button onClick={() => likeTheNote(note.id)}>
          {note?.likedBy?.includes(currentUser.uid) ? 
            <HeartIcon className="icon" style={{fill: "red", stroke: "red"}}/>:
            <HeartIcon className="icon" />
          }
        </button>
          <h3>{note.title === "" ? "No Title" : (note.title.length > 20 ? `${note.title.slice(0, 20)}...` : note.title)}</h3>
        </div>

          <div className="note-body" onClick={() => extendNote(note)}>
            <p
              dangerouslySetInnerHTML={{
                __html:
                  note.note && note.note.length > 50 ? `${note.note.slice(0, 50)}...` : note.note
              }}
            />
          </div>
          <button className="info" onClick={() => showNoteInfo(note.id)}>
            {noteInfoVisibility[note.id] ? <XMarkIcon className="icon"/> : <InformationCircleIcon className="icon"/>}
          </button>
          {noteInfoVisibility[note.id] && (<div className="info-container">
            <p className="added-date">{note.createdAt.toDate().toDateString()}</p>
            <p className="added-from">Note From {note.user}</p>
            <p style={{display: "flex", alignItems: "center"}}><HeartIcon className="icon"/>{note?.likedBy?.length}</p>
            <p style={{display: "flex", alignItems: "center"}}><BookmarkIcon className="icon"/>{note?.markedBy?.length}</p>
            <div className="tag-container">
              {note.tag && 
              <div className="tag">
                <p>{note.tag}</p>
              </div>}
            </div>
          </div>)}
          </div>
          ))}
      </div>
    </>
    );
};
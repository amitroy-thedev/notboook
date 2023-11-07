import React, { useEffect, useRef, useState } from 'react';
import { collection, addDoc, query, onSnapshot, where, updateDoc, doc, getDoc, orderBy } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import QrScanner from "qr-scanner";

import { QrCodeIcon, ShareIcon, TrashIcon, CheckBadgeIcon, ExclamationTriangleIcon, XCircleIcon, XMarkIcon, EllipsisVerticalIcon, BookmarkIcon, BookmarkSlashIcon, TagIcon, CheckIcon, PlusCircleIcon, BarsArrowDownIcon, BarsArrowUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

export default function SnapsToAdd() {
  const [file, setFile] = useState(null);
  const [Qrfile, setQrFile] = useState(null);
  const [whileScan, setWhileScan] = useState("");
  const [snapList, setSnapList] = useState([]);
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const types = ['image/png', 'image/jpeg', 'image/jpg'];
  const [error, setError] = useState('');
  const [progress, setProgress] = useState();
  const snapRef = collection(db, 'snaps');
  const [showAdd, setShowAdd] = useState(false);
  const [showShared, setShowShared] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [addShared, setAddShared] = useState("");       
  const [whileAdding, setWhileAdding] = useState("");
  const snapsCollectionRef = collection(db, "snaps");
  const [uploadTask, setUploadTask] = useState("");
  const [sortOrder, setSortOrder] = useState('desc'); // Initial sort order is descending (newest first)
  const scanFileRef = useRef();
  const [showSearchNote, setShowSearchNote] = useState(false);
  const [changeViewType, setChangeViewType] = useState(false);
  const [searchWord, setSearchWord] = useState("");

  const {currentUser} = useAuth();
  useEffect(() => {
    const filtered = query(
      snapRef,
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
        setSnapList(notesData);
      },
      (err) => {
        console.log('Error fetching snaps:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSortOrderChange = (e) => {
    const selectedSortOrder = e.target.value;
    setSortOrder(selectedSortOrder);
    
    setSnapList((prevSnapList) => {
      const sortedNotes = [...prevSnapList].sort((a, b) => {
        if (selectedSortOrder === 'asc') {
          return a.createdAt - b.createdAt; // Ascending sort order
        } else {
          return b.createdAt - a.createdAt; // Descending sort order
        }
      });
      return sortedNotes;
    });
  };
  const uploadHandler = async (e) => {
    e.preventDefault();
    if (file && types.includes(file.type)) {
      const imageRef = ref(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(imageRef, file)
      setUploadTask(uploadTask);
      uploadTask.on('state_changed', (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
      }, (error) => {
        if(error.code === "storage/canceled"){
          setError("Upload has been cancelled")
        }
        setError(error);
      }, async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(snapRef, {
            isMarked,
            image: url,
            subject,
            desc,
            userID: currentUser.uid,
            user: currentUser.displayName,
            createdAt: new Date(),
          });
          setError(<><CheckBadgeIcon className="icon" style={{color: "green"}}/>Snap added successfully</>);
          setFile(null);
          setSubject('');
          setDesc('');
          setProgress()
        } catch (error) {
          setError(error.message);
        }
      });
    } else {
      setFile(null);
      setError('Please select an image file (png, jpg, or jpeg)');
    }
  };  

  const cancelHandler = () => {
    uploadTask.cancel();
    setFile(null);
    setProgress()
  }
  const markSnap = async (snapId) => {
    setIsMarked(!isMarked);
    await updateDoc(doc(db, 'snaps', snapId), { isMarked: !isMarked });
  };
  
  const addSharedSnap = async (e) => {
    e.preventDefault();
    const findSnapRef = doc(db, 'snaps', addShared);
    const findSnapSnapshot = await getDoc(findSnapRef);
  
    if (findSnapSnapshot.exists()) {
      const snapData = findSnapSnapshot.data();
  
      const sharedSnapData = {
        subject: snapData.subject || '',
        desc: snapData.desc || '',
        image: snapData.image || '',
        isMarked,
        user: currentUser.displayName,
        userID: currentUser.uid,
        addedFrom: snapData.user,
        createdAt: new Date(),
      };
  
      // Check if the note already exists in snapList
      const isSnapAlreadyAdded = snapList.some(
        (snap) =>
          snap.subject === sharedSnapData.subject &&
          snap.desc === sharedSnapData.desc
      );
  
      if (!isSnapAlreadyAdded) {
        await addDoc(snapsCollectionRef, sharedSnapData);
        setWhileAdding("Note added successfully");
      } else {
        setWhileAdding("Note already added. Try adding with a different share ID");
      }
    } else {
      setWhileAdding("Note does not exist. Try again with a valid share ID");
    }
  };

  const qrScan = async (e) => {
    const file = e.target.files[0];
    setQrFile(file);
      try{
       const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
       setTimeout(() => {
         setWhileScan("success-while-scan");
         setAddShared(result.data);
         setTimeout(() => {
          setWhileScan("success-while-scan");
          setWhileAdding("Unique share ID added successfully");
          setQrFile(null);
        }, 1500);
      }, 2000);
    }catch(err){
      setTimeout(() => {
        setWhileScan("err-while-scan");
        setWhileAdding(err);
        setTimeout(() => {
         setQrFile(null);
       }, 1500);
     }, 2000);
    };
  }
  
  return (
    <>
    <div className="top">
      <button onClick={() => setShowAdd(!showAdd)} className='primary'>Add a Snap</button>
      {showAdd && 
      <div className="back">
      <div className="card snap-container">
        <button onClick={() => {setShowAdd(!showAdd); setError("");}} className="card-closebtn"><XMarkIcon className='icon'/></button>
        <form onSubmit={uploadHandler}>
          <h3>Upload Your Snapshot</h3>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <textarea id="desc" cols="30" rows="10" placeholder='Description' onChange={(e) => setDesc(e.target.value)}></textarea>
          <input type="text" id="subject" value={subject} placeholder='Subject' onChange={(e) => setSubject(e.target.value)} />
          {progress && file && <div className='progress w100'>
          <img src={URL.createObjectURL(file)} height="30px" width="30px"/>
          <div className="image-details">
            <p>{file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}</p>
            <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          {progress && <p>{progress}%</p>}
          <button onClick={cancelHandler}><XMarkIcon className='icon'/></button>
          </div>}
          <button type="submit" className="primary" disabled={progress && true}>{progress ?  <>Uploading <span className="dots">.</span><span className="dots">.</span><span className="dots">.</span></> : "Upload Snap" }</button>
        {error && <p>{error}</p>}
        </form>
      </div>
      </div>}
      
      <button onClick={() => setShowShared(!showShared)} className='secondary'>Have Share ID ?</button>
      {showShared && 
      <div className="back">
      <div className="card">
        <button onClick={() => {setShowShared(!showShared); setWhileAdding("");}} className="card-closebtn"><XMarkIcon className='icon'/></button>
        <div className="add-shared">
        <h3>Add a new Note from the Unique shared id</h3>
        <form onSubmit={(e) => addSharedSnap(e)}>
        <input type="text" placeholder="YK1VyGSCLaNKMHfCZXSF"
        value={addShared}
        onChange={(e) => 
          {setAddShared(e.target.value);
          setWhileAdding("");
          }}/>
        <button type="submit" className='secondary' disabled={!addShared && true}> + Add</button>
        <button type="button" className="scanbtn" onClick={() => scanFileRef.current.click()}><QrCodeIcon className="icon"/></button>
        <input type="file" accept=".png, .jpg, .jpeg" onChange={qrScan} style={{display: "none"}} ref={scanFileRef}/>
        {Qrfile && (
        <div className='file'>
          <span className={`scanning w100 ${whileScan}`}></span>
          <span className="scanner w100 h100"></span>
          <img src={URL.createObjectURL(Qrfile)} alt="QR Preview" />
        </div>
        )}
        <div className="while-adding">{whileAdding}</div></form>
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
      <input type="text" placeholder="Search with subject name" onChange={(e) => setSearchWord(e.target.value)}/>
      </div>}
      <div className="snaps-list">
      {snapList.length === 0 && <p className="no-notes">
         No Snaps
      </p>}
      {searchWord && ( snapList.filter((snap) => snap.subject.toLowerCase().includes(searchWord.toLowerCase())).length === 0) && 
      <p className="no-notes">
      No snaps found with the subject <b>{searchWord}</b>.
      </p>}

      {snapList
        .filter((snap) => snap.subject.toLowerCase().includes(searchWord.toLowerCase()))
        .map((snap) => (
        <div className={`${changeViewType ? "changeSnapView" : "snaps"}`} key={snap.id}>
          <div className="header w100">
            <h3>{snap.subject}</h3>
            {snap.createdAt && <p>{snap.createdAt.toDate().toDateString()}</p>}
            <div className="options">
              <button onClick={() => markSnap(snap.id)}>{!snap.isMarked ? <BookmarkIcon className="icon"/>: <BookmarkIcon className="icon" style={{fill: "black"}}/>}</button>
              <button><EllipsisVerticalIcon className='icon'/></button>
            </div>
          </div>
          <div className="snap-body h100">
            <div className="snap-img h100">
              <img src={snap.image} alt={snap.subject} className='w100'/>
            </div>
            <div className="snap-details">
              <div className="details-top">
                <h3>Description</h3>
                <p className="desc">{snap.desc}</p>
              </div>
              <div className="details-bottom">
              {snap.addedFrom && <p className="addedfrom">Added From {snap.addedFrom}</p>}
              </div>
            </div>
          </div>
        </div>
      ))}
      </div>
    </>
  );
}


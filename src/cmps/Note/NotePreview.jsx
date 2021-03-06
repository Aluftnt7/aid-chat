import React, { useEffect, useState, createRef, useCallback } from 'react'

import Moment from 'react-moment';

import NoteText from "./NoteText";
import NoteImg from "./NoteImg";
import NoteVideo from "./NoteVideo";
import NoteTodo from "./NoteTodo";
import Features from "./Features";

import RemoveIcon from "../../cmps/icons/RemoveIcon";
import EditIcon from "../../cmps/icons/EditIcon";
import SaveIcon from "../../cmps/icons/SaveIcon";

import AvatarLoader from '../AvatarLoader'



export default ({ room, note, user, removeNote, saveRoomChanges, togglePinned, toggleStarredNote, changeNoteColor, toggleNotePin, updateNote, updateMembers, isStarredPage, isSpreadView }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [currTodoIdx, setCurrTodoIdx] = useState(null);
    const [textEdit, setTextEdit] = useState(note.data)
    const [isLoaded, setIsLoaded] = useState(false);

    const cmps = {
        NoteText,
        NoteImg,
        NoteVideo,
        NoteTodo,
    }

    const NoteType = cmps[note.type];

    const noteRef = createRef();

   
    const paintNote = () => {//KEEP
        if (note.bgColor && noteRef.current) noteRef.current.style.backgroundColor = note.bgColor
    }

    const saveNoteEdits = async (type) => {
        let noteCopy = JSON.parse(JSON.stringify(note));
        (type === 'NoteText' && textEdit) ? noteCopy.data = textEdit : setCurrTodoIdx('');
        await updateNote(room._id, noteCopy);
        if (room.members && room.members.length > 1) updateMembers();
    }


    const handleRemoveClicked = async () => {
        let roomId = getRoomId()
        await removeNote(roomId, note._id);
        if (!isStarredPage) updateMembers();
    }

    const getRoomId = () => { //MAYBE SHOULD BE IN PAGE CMP
        return isStarredPage ? note.roomId : room._id
    }


    const onLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);


    useEffect(() => {
        if (note.createdBy._id !== user._id) return
        if (note.createdBy.imgUrl !== user.imgUrl) {
            note.createdBy.imgUrl = user.imgUrl
            if(!isStarredPage) saveRoomChanges()
        }
    }, []);

    useEffect(() => {
        paintNote();
        if (note.createdBy._id !== user._id) return;
        if (note.createdBy.imgUrl !== user.imgUrl) {
            note.createdBy.imgUrl = user.imgUrl;
            if(!isStarredPage) saveRoomChanges();
        }

    }, []);

    useEffect(() => {
        paintNote();
    }, [note.bgColor]);

    return (
        <div className="note-preview" style={{ backgroudColor: note.bgColor }} style={{ display: isSpreadView ? 'inline-block' : 'block' }}>
            <div className={user._id === note.createdBy._id ? 'user-container' : 'friend-container'}>
                {!isSpreadView && <img src={note.createdBy.imgUrl} alt="Note creator avatar" className="avatar avatar-s" onLoad={onLoad} style={{ display: isLoaded ? 'block' : 'none' }} />}
                {(!isSpreadView && !isLoaded) && <AvatarLoader />}
                <div className="note-container" ref={noteRef}>
                    <div className="note-header">
                        {!isStarredPage && <div>
                            {((note.type === 'NoteTodo' || note.type === 'NoteText') && !isEdit) && <i onClick={() => setIsEdit(true)}><EditIcon /></i>}
                            {((note.type === 'NoteTodo' || note.type === 'NoteText') && isEdit) && <i onClick={() => { setIsEdit(false); saveNoteEdits(note.type) }}><SaveIcon /></i>}
                            <i onClick={handleRemoveClicked}><RemoveIcon /></i>
                        </div>}
                        <Moment format="MM/DD/YY ,HH:mm">{note.createdAt}</Moment>
                    </div>
                    <NoteType note={note} user={user} isEdit={isEdit} currTodoIdx={currTodoIdx} setCurrTodoIdx={setCurrTodoIdx} textEdit={textEdit} setTextEdit={setTextEdit} updateNote={updateNote} updateMembers={updateMembers} isStarredPage={isStarredPage}  roomId={getRoomId()}/>
                    <Features room={room} togglePinned={togglePinned} note={note} user={user} changeNoteColor={changeNoteColor} toggleNotePin={toggleNotePin} toggleStarredNote={toggleStarredNote} updateMembers={updateMembers} isStarredPage={isStarredPage} roomId={getRoomId()} updateNote={updateNote}/>
                </div>
            </div>
        </div>
    )
}

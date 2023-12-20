import { createAction, createReducer } from "@reduxjs/toolkit";
import { BASE_URL } from "../App";

const initialState = {
    notes: [],
}

const getNotes = createAction("GET_ALL_NOTES")

//middlewares
export const fetchNotes = () => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_URL}/notes/getallnotes`, {
            method: "GET",
            /*  headers: {
                Authorization: `Bearer ${localStorage.getItem('iNotes_user')}`,
              }, */
            credentials: "include",
        });
        const data = await res.json();
        // console.log(data)
        if (!data.error) {
            // dispatch(signInUser(true))
            dispatch(getNotes(data.result));
        }
    } catch (err) {
        return console.log(err);
    }
}

export const addNote = (note) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_URL}/notes/addNote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Authorization: `Bearer ${localStorage.getItem("iNotes_user")}`,
            },
            credentials: "include",
            body: JSON.stringify(note),
        })
        const data = await res.json();
        return data
        // console.log(data)
    } catch (err) {
        return console.log(err);
    }
}

export const removeNote = (id) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_URL}/notes/deleteNote/${id}`, {
            method: "delete",
            /* headers: {
                Authorization: `Bearer ${localStorage.getItem("iNotes_user")}`,
            }, */
            credentials: "include",
        })
        const data = await res.json()
        return data
    } catch (error) {
        console.log(error)
    }
}

export const editNote = (note) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_URL}/notes/updateNote/${note._id}`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                // Authorization: `Bearer ${localStorage.getItem('iNotes_user')}`
            },
            credentials: "include",
            body: JSON.stringify(note),
        })
        const data = await res.json()
        dispatch(fetchNotes())
        return data
    } catch (error) {
        console.log(error)
    }
}

export const noteReducer = createReducer(initialState, builder => {
    builder.addCase(getNotes, (state, action) => {
        state.notes = action.payload
    })
})
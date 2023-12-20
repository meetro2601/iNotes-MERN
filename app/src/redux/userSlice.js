import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "../App";

export const loginUser = async (formDetail) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formDetail),
        credentials: 'include' // should be there
    })
    const data = await res.json()
    return data
}

// export const getUserInfo = createAsyncThunk("user/info", async (formDetail) => {
//     const res = await fetch("/auth/myaccount", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         credentials: "include"
//     })
//     const data = await res.json()
//     // console.log("userinfo",data)
//     return data
// })

export const logOut = async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, { credentials: 'include' })
    const data = await res.json()
    return data
}

export const signUp = async (formDetail) => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formDetail),
    })
    const data = await res.json()
    return data
}

const userSlice = createSlice({
    initialState: {
        user: "",
        loggedIn: false
    },
    name: "user",
    reducers: {
        signInUser: (state, action) => {
            state.loggedIn = action.payload
        },
        currentUser: (state, action) => {
            state.user = action.payload
        }
    },
})

const { actions, reducer } = userSlice

export const { signInUser, currentUser } = actions

export default reducer


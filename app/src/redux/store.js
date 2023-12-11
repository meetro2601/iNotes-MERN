import { configureStore } from "@reduxjs/toolkit";
import { noteReducer } from "./noteSlice";
import reducer  from "./userSlice";

export default configureStore ({
    reducer:{
        notes:noteReducer,
        user:reducer
    }
}) 
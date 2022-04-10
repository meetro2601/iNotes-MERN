import React, { useState } from "react";
import Signup from "./Components/Signup";
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Login from "./Components/Login";
import Home from "./Home";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import EmailVerified from "./Components/EmailVerified";
import PageError from "./Components/PageError";

export const UserContext = React.createContext()

function App() {

  const [user, setuser] = useState('')
  const [loggedIn, setloggedIn] = useState(false)
  
  return (
    <UserContext.Provider value={{user,setuser,loggedIn,setloggedIn}}>
    <Router>
      <Routes>
        <Route path='/' element={ <Home/>}></Route>
        <Route path='/auth/signup' element={ <Signup/>}></Route>
        <Route path='/auth/login' element={ <Login/>}></Route>
        <Route path='/auth/user/forgotPassword' element={ <ForgotPassword/>}></Route>
        <Route path='/auth/user/resetPassword' element={ <ResetPassword/>}></Route>
        <Route path='/auth/user/emailVerification' element={<EmailVerified/>}></Route>
        <Route path='*' element={<PageError/>}></Route>
      </Routes>
    </Router>

    </UserContext.Provider>
  );
}

export default App;

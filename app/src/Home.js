import {
  MDBBtn,
  MDBCol,
  MDBContainer,
  MDBProgress,
  MDBProgressBar,
  MDBRow,
} from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UpdateModal from "./Components/UpdateModal";
import icon from "./icon.png";
import Note from "./Components/Note";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotes, removeNote } from "./redux/noteSlice";
import { currentUser, logOut, signInUser } from "./redux/userSlice";
import { BASE_URL } from "./App";

function Home() {
  // const { user, setuser, loggedIn, setloggedIn } = useContext(UserContext);
  const [progress, setprogress] = useState(10)
  const [modalShow, setmodalShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const [activeId, setactiveId] = useState()
  // const [notes, setnotes] = useState([]);
  const [noteDetails, setnoteDetails] = useState({
    title: "",
    description: "",
  });

  const dispatch = useDispatch()
  const list = useSelector(state => state.notes)
  const userState = useSelector(state => state.user)

  const handleCreate = () => {
    setnoteDetails({
      title: "",
      description: "",
    });
    setmodalShow(true)
    setEditing(false)
  };

  const editHandler = (id) => {
    setnoteDetails({
      ...list.notes.find((note) => note._id === id),
    });
    setEditing(true)
    setmodalShow(true)
  };

  const deleteHandler = (id) => {
    if (window.confirm("Are you Sure?")) {
      dispatch(removeNote(id))
        .then(data => {
          if (data.success) {
            dispatch(fetchNotes())
            alert(data.success)
          }
        })
    }
  };

  const logoutHandle = async () => {
    if (window.confirm("Are you Sure?")) {
      const data = await logOut()
      alert(data.message)
      dispatch(signInUser(false))
    }
  };

  const toggleActive = (id) => {
    if (activeId === id) {
      setactiveId("")
    } else {
      setactiveId(id)
    }
  }
  // console.log(list.notes)

  useEffect(() => {
    setprogress(40)
    fetch(`${BASE_URL}/auth/myaccount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    }).then(res => {
      setprogress(70)
      return res.json()
    })
      .then((data) => {
        if (data.error) {
          dispatch(signInUser(false))
          dispatch(currentUser(""))
          setprogress(100)
        } else {
          dispatch(signInUser(true))
          dispatch(currentUser(data))
          dispatch(fetchNotes()).then(() =>
            setprogress(100)
          )
        }
      }
      )
  }, []);

  return (
    <div className="">
      <MDBContainer
        fluid
        className="p-3 px-sm-5 justify-content-md-around header"
      >
        <div className="d-flex align-items-center gap-3">
          <img src={icon} alt="icon" height={48}></img>
          <h1 className="text-dark display-6 fw-bold m-0">iNotes</h1>
        </div>
        {userState.loggedIn && (
          <div>
            <button onClick={handleCreate} className="btn-success btn-rounded btn ">
              Create
            </button>
            <button onClick={logoutHandle} className="btn-danger ms-3 btn-rounded btn ">
              Logout
            </button>
          </div>
        )}
        {progress == 100 && !userState.loggedIn && (
          <Link to="/auth/login">
            <button className="btn-primary btn-rounded btn ">
              Login
            </button>
          </Link>
        )}
      </MDBContainer>
      {progress < 100 && <MDBProgress>
        <MDBProgressBar width={progress} valuemin={0} valuemax={100} />
      </MDBProgress>}
      <MDBContainer className="py-4">
        {!userState.loggedIn && progress == 100 &&
          <div className="text-md-start text-center">
            <h2 className="my-5 lh-lg">In Today's World...<br />
              Taking Pictures of Important Events & Cherished memories<br />
              And<br />
              Making Notes of Important Details & Good thoughts<br />Both are Necessary</h2>
            <Link to="/auth/signup">
              <MDBBtn className="fs-6" color='warning'>
                Sign Up
              </MDBBtn>
            </Link>
          </div>
        }
        {
          userState.loggedIn && progress == 100 &&
          <>
            {list.notes.length > 0 ? (
              <div>
                <h4 className="my-md-5 my-4">
                  Hi <b className="text-capitalize"> {userState.user?.name}</b>, Here are your notes...
                </h4>
                <MDBRow>
                  {list.notes &&
                    list.notes.map((note) => {
                      let date = new Date(note.date).toDateString()
                      let time = new Date(note.date).toLocaleTimeString()
                      return (
                        <MDBCol key={time} md="6" className="my-3">
                          <Note
                            detail={{ ...note, date }}
                            onEdit={editHandler}
                            onDelete={deleteHandler}
                            onToggle={toggleActive}
                            // multiple={true}
                            isActive={activeId === note._id}
                          ></Note>
                        </MDBCol>
                      );
                    })}
                </MDBRow>
              </div>
            ) : <h5 className="my-5 text-center">Oops !! You haven't Noted anything yet, <b className="text-capitalize">{userState.user?.name}</b> </h5>}
          </>
        }
      </MDBContainer>
      <UpdateModal data={noteDetails}
        open={modalShow}
        setOpen={setmodalShow}
        toEdit={editing}
      ></UpdateModal>
    </div>
  );
}

export default Home;

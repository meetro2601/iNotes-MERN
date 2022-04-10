import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardText,
  MDBCardTitle,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./App";
import UpdateModal from "./Components/UpdateModal";
import icon from "./icon.png";

function Home() {
  const navigate = useNavigate();
  const { user, setuser, loggedIn, setloggedIn } = useContext(UserContext);
  const [notes, setnotes] = useState([]);
  const [noteDetails, setnoteDetails] = useState({
    title: "",
    description: "",
  });

  const [noteformErr, setnoteformErr] = useState({
    titleErr: false,
    descriptionErr: false,
  });

  const [noteformErrMsg, setnoteformErrMsg] = useState({
    titleErrMsg: "",
    descriptionErrMsg: "",
  });

  const [modalData, setmodalData] = useState({
    show: false,
    noteToUpdate: {
      title: "",
      description: "",
    },
  });

  const changeHandler = (e) => {
    let { id, value } = e.target;
    setnoteDetails({ ...noteDetails, [id]: value });

    if (id === "title") {
      setnoteformErr({ ...noteformErr, titleErr: false });
    } else if (id === "description") {
      setnoteformErr({ ...noteformErr, descriptionErr: false });
    }
  };

  const submitHandle = (e) => {
    e.preventDefault();

    if (!loggedIn) {
      alert("Login Required to Add Note");
      navigate("/auth/login");
    } else if (!noteDetails.title && !noteDetails.description) {
      alert("Please Add Note Details");
    } else if (!noteDetails.title) {
      setnoteformErr({ ...noteformErr, titleErr: true });
      setnoteformErrMsg({ ...noteformErrMsg, titleErrMsg: "Title Required" });
    } else if (!noteDetails.description) {
      setnoteformErr({ ...noteformErr, descriptionErr: true });
      setnoteformErrMsg({
        ...noteformErrMsg,
        descriptionErrMsg: "Description Required",
      });
    } else {
      fetch("/notes/addNote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("iNotes_user")}`,
        },
        credentials: "include",
        body: JSON.stringify(noteDetails),
      })
        .then((res) => res.json())

        .then((data) => {
          if (!data.errors) {
            setnoteDetails({
              title: "",
              description: "",
            });
          } else if (
            data.errors[0].param === "title" &&
            (data.errors[1] ? data.errors[1].param === "description" : null)
          ) {
            setnoteformErr({
              titleErr: true,
              descriptionErr: true,
            });
            setnoteformErrMsg({
              titleErrMsg: data.errors[0].msg,
              descriptionErrMsg: data.errors[1].msg,
            });
          } else if (data.errors[0].param === "title") {
            setnoteformErr({ ...noteformErr, titleErr: true });
            setnoteformErrMsg({
              ...noteformErrMsg,
              titleErrMsg: data.errors[0].msg,
            });
          } else if (data.errors[0].param === "description") {
            setnoteformErr({ ...noteformErr, descriptionErr: true });
            setnoteformErrMsg({
              ...noteformErrMsg,
              descriptionErrMsg: data.errors[0].msg,
            });
          }
        });
    }
  };

  const editHandler = (id) => {
    setmodalData({
      show: true,
      noteToUpdate: notes.find((note) => note._id === id),
    });
  };

  const deleteHandler = (id) => {
    if (window.confirm("Are you Sure?")) {
      fetch(`/notes/deleteNote/${id}`, {
        method: "delete",
        /* headers: {
          Authorization: `Bearer ${localStorage.getItem("iNotes_user")}`,
        }, */
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => alert(data.success));
    }
  };

  const logoutHandle = () => {
    /* localStorage.removeItem('iNotes_user')
    setuser('')
    setloggedIn(false)
    alert('Logged Out') */
    fetch("/auth/logout")
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setloggedIn(false);
          setuser("");
          alert(data.message);
        }
      });
  };

  useEffect(() => {
    fetch("/notes/getallnotes", {
      method: "GET",
      /*  headers: {
          Authorization: `Bearer ${localStorage.getItem('iNotes_user')}`,
        }, */
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data)
        if (data.error) {
          return setloggedIn(false);
        }
        setuser(data.user);
        setloggedIn(true);
        setnotes(data.result);
      })
      .catch((err) => console.log(err));
  }, [notes, setloggedIn, setuser]);

  return (
    <div className="">
      <MDBContainer
        fluid
        className="p-3 px-sm-5 justify-content-md-around header"
      >
        <div className="d-flex align-items-center gap-3">
          <img src={icon} alt="icon" height={48}></img>
          <h1 className="text-dark display-5 fw-bold m-0">iNotes</h1>
        </div>
        {loggedIn && (
          <button onClick={logoutHandle} className="btn-danger btn-rounded btn ">
          Logout
        </button>
        )}
        {!loggedIn && (
          <Link to="/auth/login">
            <button className="btn-secondary btn-rounded btn ">
              Login
            </button>
          </Link>
        )}
      </MDBContainer>
      {loggedIn && (
        <h4 className="m-5">
          Welcome,<b className="text-capitalize"> {user.name}</b>
        </h4>
      )}
      <MDBContainer className="col-lg-4 col-10 col-sm-8 col-md-6 border bg-light shadow rounded my-5 p-4 text-center">
        <h2 className="py-3">Create Note</h2>
        <form>
          <MDBInput
            value={noteDetails.title}
            onChange={changeHandler}
            className="mt-3 py-2"
            label="Title"
            id="title"
            type="text"
          ></MDBInput>
          {noteformErr.titleErr ? (
            <p className="py-1 text-danger">{noteformErrMsg.titleErrMsg}</p>
          ) : null}
          <MDBInput
            value={noteDetails.description}
            onChange={changeHandler}
            className="mt-3 py-2"
            label="Description"
            id="description"
            type="text"
            textarea
          ></MDBInput>
          {noteformErr.descriptionErr ? (
            <p className="py-1 text-danger">
              {noteformErrMsg.descriptionErrMsg}
            </p>
          ) : null}
          <MDBBtn onClick={submitHandle} className="mt-5 addBtn">
            Add
          </MDBBtn>
        </form>
      </MDBContainer>
      {loggedIn && notes.length !== 0 ? (
        <MDBContainer className="py-5">
          <h2 className="text-center display-6 fw-bold py-3">My Notes</h2>
          <MDBRow>
            {notes &&
              notes.map((note) => {
                let date = new Date(note.date).toDateString()
                let time = new Date(note.date).toLocaleTimeString()
                return (
                  <MDBCol md="6" className="my-3">
                    <MDBCard className="bg-light" shadow="4" border="info">
                      <MDBCardBody>
                      <MDBCardText
                          style={{ fontSize: "15px" }}
                          className="text-muted mb-3"
                        >
                          {date}, {time}
                      <div className="float-end">
                        <button
                          onClick={() => editHandler(note._id)}
                          className="me-2 bg-transparent border-0"
                        >
                          <MDBIcon color="muted" icon='edit'></MDBIcon>
                        </button>
                        <button
                          onClick={() => deleteHandler(note._id)}
                          className="me-2 bg-transparent border-0"
                          >
                          <MDBIcon color="muted" icon='trash-alt'></MDBIcon>
                        </button>
                      </div>
                          </MDBCardText>
                        <MDBCardTitle>
                          <i>
                            <b>Title:</b>
                          </i>{" "}
                          {note.title}
                        </MDBCardTitle>
                        <MDBCardText className="mb-2">
                          <i>
                            <b>Description:</b>
                          </i>{" "}
                          {note.description}
                        </MDBCardText>
                       
                        </MDBCardBody>
                    </MDBCard>
                  </MDBCol>
                );
              })}
          </MDBRow>
        </MDBContainer>
      ) : null}
      <UpdateModal data={modalData}></UpdateModal>
    </div>
  );
}

export default Home;

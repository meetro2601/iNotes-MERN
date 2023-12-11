import {
  MDBBtn,
  MDBInput,
  MDBModal,
  MDBModalBody,
  MDBModalContent,
  MDBModalDialog,
  MDBModalHeader,
  MDBModalTitle,
} from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import { useDispatch} from "react-redux";
import { addNote, editNote, fetchNotes } from "../redux/noteSlice";


function UpdateModal({ data, open, setOpen, toEdit }) {

  const dispatch = useDispatch()

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

  useEffect(() => {
    // console.log(data)
    setnoteDetails(data);
    // setmodalShow(data.show)
  }, [data]);

  const changeHandler = (e) => {
    let { id, value } = e.target;
    setnoteDetails({ ...noteDetails, [id]: value });

    if (id === "title") {
      setnoteformErr({ ...noteformErr, titleErr: false });
    } else if (id === "description") {
      setnoteformErr({ ...noteformErr, descriptionErr: false });
    }
  };

  // const changeHandler = (e) => {
  //   let { id, value } = e.target;
  //   setupdatenoteDetail({ ...updatenoteDetail, [id]: value });
  // };

  const submitHandle = (e) => {
    e.preventDefault();

    if (!noteDetails.title && !noteDetails.description) {
      alert("Please Add Note Details");
    } else if (!noteDetails.title) {
      setnoteformErr({ ...noteformErr, titleErr: true });
      setnoteformErrMsg({ ...noteformErrMsg, titleErrMsg: "Title Required" });
    }
    // else if (!noteDetails.description) {
    //   setnoteformErr({ ...noteformErr, descriptionErr: true });
    //   setnoteformErrMsg({
    //     ...noteformErrMsg,
    //     descriptionErrMsg: "Description Required",
    //   });
    // } 
    else {
        dispatch(addNote(noteDetails)).then((data) => {
          // console.log(data)
          if (!data.errors) {
            dispatch(fetchNotes())
            setnoteDetails({
              title: "",
              description: "",
            });
            setOpen(false)
          } else if (
            data.errors[0].path === "title" &&
            (data.errors[1] ? data.errors[1].path === "description" : null)
          ) {
            setnoteformErr({
              titleErr: true,
              descriptionErr: true,
            });
            setnoteformErrMsg({
              titleErrMsg: data.errors[0].msg,
              descriptionErrMsg: data.errors[1].msg,
            });
          } else if (data.errors[0].path === "title") {
            setnoteformErr({ ...noteformErr, titleErr: true });
            setnoteformErrMsg({
              ...noteformErrMsg,
              titleErrMsg: data.errors[0].msg,
            });
          } else if (data.errors[0].path === "description") {
            setnoteformErr({ ...noteformErr, descriptionErr: true });
            setnoteformErrMsg({
              ...noteformErrMsg,
              descriptionErrMsg: data.errors[0].msg,
            });
          }
        });
    }
  };

  const updateHandle = (e) => {
    e.preventDefault();
    if (!noteDetails.title && !noteDetails.description) {
      alert("Please Add Note Details");
    } else if (!noteDetails.title) {
      setnoteformErr({ ...noteformErr, titleErr: true });
      setnoteformErrMsg({ ...noteformErrMsg, titleErrMsg: "Title Required" });
    }else{
      dispatch(editNote(noteDetails))
      .then(() => {
        setOpen(false)
        if (noteDetails.title && noteDetails.description) {
          setnoteDetails({
            title: "",
            description: ""
          });
        }
      }
      )
    }
  };

  return (
    <MDBModal show={open} setShow={setOpen}>
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{toEdit ? "Edit Note" : "Create Note"}</MDBModalTitle>
          </MDBModalHeader>
          <MDBModalBody>
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
              {
                toEdit ? <MDBBtn onClick={updateHandle} className="mt-3 me-3">
                  Update
                </MDBBtn> :
                  <MDBBtn onClick={submitHandle} className="mt-5 addBtn">
                    Add
                  </MDBBtn>
              }
            </form>
          </MDBModalBody>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}

export default UpdateModal;

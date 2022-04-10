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


function UpdateModal({data}) {

  const [updatenoteDetail, setupdatenoteDetail] = useState(data.noteToUpdate);
  const [modalShow, setmodalShow] = useState(data.show)

  useEffect(() => {
    setupdatenoteDetail(data.noteToUpdate);
    setmodalShow(data.show)
  }, [data]);

  const changeHandler = (e) => {
    let { id, value } = e.target;
    setupdatenoteDetail({ ...updatenoteDetail, [id]: value });
  };

  const updateHandle = (e) => {
    e.preventDefault();

    fetch(`/notes/updateNote/${updatenoteDetail._id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${localStorage.getItem('iNotes_user')}`
      },
      credentials:"include",
      body: JSON.stringify(updatenoteDetail),
    })
      .then((res) => res.json())
      .then((data) => setmodalShow(false));
    if (
      updatenoteDetail.title &&
      updatenoteDetail.description
    ) {
      setupdatenoteDetail({
        title: "",
        description: ""
      });
    }
  };

  return (
      <MDBModal show={modalShow} setShow={setmodalShow}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Edit Note</MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody>
              <form>
                <MDBInput
                  value={updatenoteDetail.title}
                  onChange={changeHandler}
                  className="my-3 py-2"
                  label="Title"
                  id="title"
                  type="text"
                ></MDBInput>
                <MDBInput
                  value={updatenoteDetail.description}
                  onChange={changeHandler}
                  className="my-3 py-2"
                  label="Description"
                  id="description"
                  type="text"
                ></MDBInput>
                <MDBBtn onClick={updateHandle} className="mt-3 me-3">
                  Update
                </MDBBtn>
                <MDBBtn
                  onClick={(e) => {
                    e.preventDefault();
                    setmodalShow(false)
                  }}
                  outline
                  className="mt-3"
                >
                  Cancel
                </MDBBtn>
              </form>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
  );
}

export default UpdateModal;

import React, { useState } from "react";
import { MDBBtn, MDBContainer, MDBInput } from "mdb-react-ui-kit";

function ForgotPassword() {
  const [email, setemail] = useState("");
  const [error, seterror] = useState('');

  const onChangeHandler = (e) => {
    setemail(e.target.value);

    if (error) {
      seterror('');
    }
  };

  const sendMailHandle = (e) => {
    e.preventDefault();

    if (!email) {
      seterror("Email Id Required");
    } else {
      fetch("/password/forgot-Password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email}),
      })
        .then((res) => res.json())
        .then((data) => {
          if(data.validationError){
            seterror(data.validationError)
          }
          else if (data.error) {
            alert(data.error);
          } else {
            alert(data.message);
          }
        });
    }
  };

  return (
    <MDBContainer className="col-md-6 col-lg-4 col-10 p-4 bg-light shadow rounded-3 text-center border my-5">
      <p className="fw-700">Enter your registered Email Id</p>
      <form className="" action="/api/password" method="post">
        <MDBInput
          className="w-100 mt-3 py-2"
          type="email"
          name="email"
          label="Email Id"
          value={email}
          onChange={onChangeHandler}
        ></MDBInput>
      </form>
      {error && <p className="text-danger my-2">{error}</p>}
      <MDBBtn
        onClick={sendMailHandle}
        size="md"
        className="mt-4 fw-bold"
        color="dark"
      >
        Send Email
      </MDBBtn>
    </MDBContainer>
  );
}

export default ForgotPassword;

import { MDBBtn, MDBContainer, MDBIcon } from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function EmailVerified() {
  const [searchParams] = useSearchParams();
  const { user, verificationToken } = Object.fromEntries([...searchParams]);
  const [loading, setloading] = useState(true);
  const [tokenErr, settokenErr] = useState();

  useEffect(() => {
    fetch(`/auth/verify-email?userId=${user}&token=${verificationToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setloading(false);
        if (res.status !== 200) {
          return settokenErr(true);
        }
        settokenErr(false);
      })
      .catch((err) => console.log(err));
  }, [user, verificationToken]);

  const resendEmail = () => {
    fetch(`/auth/resend-verification-email?userId=${user}`, {
      method: "GET",
    }).then(res => res.json())
    .then(data => {
      if(data.error){
        return alert(data.error)
      }
      alert(data.message)
    })
    .catch(err => console.log(err))
  };

  if (loading) {
    return (
      <MDBContainer className="text-center my-5 py-5">
        <div
          className="spinner-grow text-danger mx-3 mb-4 mt-5"
          role="status"
        ></div>
        <div
          className="spinner-grow text-primary mx-3 mb-4 mt-5"
          role="status"
        ></div>
        <div
          className="spinner-grow text-success mx-3 mb-4 mt-5"
          role="status"
        ></div>
        <h5>Verifying Link... Wait for a Moment</h5>
      </MDBContainer>
    );
  }

  if (tokenErr) {
    return (
      <MDBContainer className="col-md-7 col-lg-5 col-11 text-white my-5 text-center">
        <div
          style={{ backgroundColor: "#4f4f4fe3" }}
          className="shadow rounded-3 p-3 my-5"
        >
          <h5>This Email verification link is invalid / has expired</h5>
          <p className="mb-0">
            Please click on the "Resend Email" button to request a new email
            verification link
          </p>
        </div>
        <button className="btn btn-light" onClick={resendEmail}>
          Resend Verification Email
        </button>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer className="col-md-6 col-lg-4 col-8 py-5 text-dark text-center my-5">
      <MDBIcon size='10x' style={{color:"green"}} icon="thumbs-up"></MDBIcon>
      <h5 className="my-5">Email Verified Successfully !</h5>
      <Link to="/auth/login">
        <MDBBtn size="lg" className="fw-bold" color="light">
          Login
        </MDBBtn>
      </Link>
    </MDBContainer>
  );
}

export default EmailVerified;

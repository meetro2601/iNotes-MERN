import { MDBBtn, MDBContainer, MDBIcon, MDBInput } from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
 
  const [searchParams]  =useSearchParams()
  const {user,resetToken} = Object.fromEntries([...searchParams])
  const navigate = useNavigate()
  const [password, setpassword] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setloading] = useState(true);
  const [pswrdErr, setpswrdErr] = useState("");
  const [tokenErr, settokenErr] = useState("");
  const [passwordShow, setpasswordShow] = useState(false)

 
  useEffect(() => {
    fetch(`/password/verify-resetToken?userId=${user}&token=${resetToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setloading(false)
        if (!data.valid) {
          settokenErr("is alreay used / has expired");
        }
      })
      .catch((err) => console.log(err));
  }, [user,resetToken]);

  const changeHandler = (e) => {
    let { name, value } = e.target;
    setpassword({ ...password, [name]: value });

    if (pswrdErr) {
      setpswrdErr("");
    }
  };

  const resetHandler = (e) => {
    e.preventDefault();

    if (!password.newPassword || !password.confirmPassword) {
      setpswrdErr("Please Enter a Password");
    } else if (password.newPassword !== password.confirmPassword) {
      setpswrdErr("Passwords do not match");
    } else {
      fetch(`/password/reset-Password?userId=${user}&token=${resetToken}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: password.newPassword }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.validationError) {
            return setpswrdErr(data.validationError);
          }
          alert(data.message)
          navigate("/auth/login")
        })
        .catch((error) => console.log(error));
    }
  };


  if (loading) {
    return (
      <MDBContainer className="text-center my-5 py-5">
        <div className="spinner-grow text-danger mx-3 mb-4 mt-5" role="status"></div>
        <div className="spinner-grow text-primary mx-3 mb-4 mt-5" role="status"></div>
        <div className="spinner-grow text-success mx-3 mb-4 mt-5" role="status"></div>
        <h5>Verifying Link... Wait for a Moment</h5>
      </MDBContainer>
    );
  }

  if (tokenErr) {
    return (
      <MDBContainer style={{backgroundColor:"rgba(23,81,30,0.5)"}} className="col-md-7 col-lg-5 col-10 shadow rounded-3 text-white py-3 my-5 text-center">
        <h5>This password reset link {tokenErr}</h5>
        <p className="mb-0">Please try again with new link</p>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer className="col-md-6 col-lg-4 col-10 p-4 bg-light shadow rounded-3 text-center border my-5">
      <form className="" action="/api/password" method="post">
        <MDBInput
          className="w-100 mt-3 py-2"
          type={passwordShow ? 'text' : 'password'}
          name="newPassword"
          label="New Password"
          value={password.newPassword}
          onChange={changeHandler}
        ><MDBIcon className="position-absolute top-50 end-0 me-2 translate-middle-y" icon="eye" style={{color:"gainsboro"}} onClick={()=>setpasswordShow(!passwordShow)}></MDBIcon></MDBInput>
        <MDBInput
          className="w-100 mt-3 py-2"
          type="password"
          name="confirmPassword"
          label="Confirm New Password"
          value={password.confirmPassword}
          onChange={changeHandler}
        ></MDBInput>
      </form>
      {pswrdErr && <p className="text-danger my-2">{pswrdErr}</p>}
      <MDBBtn
        onClick={resetHandler}
        size="md"
        className="mt-4 fw-bold"
        color="success"
      >
        Reset Password
      </MDBBtn>
    </MDBContainer>
  );
}

export default ResetPassword;

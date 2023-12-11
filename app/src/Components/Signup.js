import { MDBBtn, MDBContainer, MDBIcon, MDBInput, MDBSpinner } from "mdb-react-ui-kit";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signUp } from "../redux/userSlice";

function Signup() {

  const [formDetail, setformDetail] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [emailSent, setemailSent] = useState(false);
  const [loading, setloading] = useState();

  const [signupErr, setsignupErr] = useState({
    nameErr: false,
    emailErr: false,
    passwordErr: false,
  });

  const [signupErrMsg, setsignupErrMsg] = useState({
    nameErrMsg: "",
    emailErrMsg: "",
    passwordErrMsg: "",
  });

  const changeHandler = (e) => {
    let { name, value } = e.target;
    setformDetail({ ...formDetail, [name]: value });

    if (name === "name") {
      if (value.length >= 3) {
        setsignupErr({ ...signupErr, nameErr: false });
      } else {
        setsignupErrMsg({
          ...setsignupErrMsg,
          nameErrMsg: "Name must be atleast 3 characters long",
        });
      }
    } else if (name === "email") {
      setsignupErr({ ...signupErr, emailErr: false });
    } else if (name === "password") {
      setsignupErr({ ...signupErr, passwordErr: false });
    }
  };

  const submitHandle = async (e) => {
    e.preventDefault();

    if (!formDetail.name && !formDetail.email && !formDetail.password) {
      alert("User Details Required to Signup");
    } else if (!formDetail.name) {
      setsignupErr({ ...signupErr, nameErr: true });
      setsignupErrMsg({ ...signupErrMsg, nameErrMsg: "Name Required" });
    } else if (!formDetail.email) {
      setsignupErr({ ...signupErr, emailErr: true });
      setsignupErrMsg({ ...signupErrMsg, emailErrMsg: "Email Required" });
    } else if (!formDetail.password) {
      setsignupErr({ ...signupErr, passwordErr: true });
      setsignupErrMsg({ ...signupErrMsg, passwordErrMsg: "Password Required" });
    } else {
      setloading(true)
      const data = await signUp(formDetail)
      // console.log(data)
      if (data.errors) {
        let mailError = data.errors.find(
          (error) => error.path === "email"
        );
        let pswrdError = data.errors.find(
          (error) => error.path === "password"
        );

        if (mailError && pswrdError) {
          setsignupErr({ ...signupErr, emailErr: true, passwordErr: true });
          setsignupErrMsg({
            ...signupErrMsg,
            emailErrMsg: mailError.msg,
            passwordErrMsg: pswrdError.msg,
          });
        } else if (mailError) {
          setsignupErr({ ...signupErr, emailErr: true });
          setsignupErrMsg({
            ...signupErrMsg,
            emailErrMsg: mailError.msg,
          });
        } else if (pswrdError) {
          setsignupErr({ ...signupErr, passwordErr: true });
          setsignupErrMsg({
            ...signupErrMsg,
            passwordErrMsg: pswrdError.msg,
          });          
        }
      } else if (data.error) {
        alert(data.error);
      } else {
        setemailSent(true);
      }
      setloading(false)
      
    }
  };

  return (
    <>
      {emailSent ? (
        <MDBContainer className="col-md-7 col-lg-5 col-10 p-3 bg-light shadow rounded-3 text-center border my-5">
          <h5 className="fw-bold">
            <MDBIcon className="me-2" icon='check-circle'></MDBIcon>
            Verify your Email
          </h5>
          <hr />
          <p className="mb-0">
            We have just sent an email to <b><i>{formDetail.email}</i></b> to verify your
            address. Before logging in, Please click on the link in that email for verification.
          </p>
        </MDBContainer>
      ) : (

        <MDBContainer className="col-md-6 col-lg-5 col-xl-4 col-10 p-4 bg-light shadow rounded-3 text-center border my-5">
          <h1 className="py-3">SignUp</h1>
          <form className="" action="/api/auth" method="post">
            <MDBInput
              className="w-100 mt-3 py-2"
              type="text"
              name="name"
              label="Name"
              value={formDetail.name}
              onChange={changeHandler}
            >
            </MDBInput>
            {signupErr.nameErr ? (
              <p className="py-1 text-danger">{signupErrMsg.nameErrMsg}</p>
            ) : null}
            <MDBInput
              className="w-100 mt-3 py-2"
              type="email"
              name="email"
              label="Email Id"
              value={formDetail.email}
              onChange={changeHandler}
            ></MDBInput>
            {signupErr.emailErr ? (
              <p className="py-1 text-danger">{signupErrMsg.emailErrMsg}</p>
            ) : null}
            <MDBInput
              className="w-100 mt-3 py-2"
              type="password"
              name="password"
              label="Password"
              value={formDetail.password}
              onChange={changeHandler}
            ></MDBInput>
            {signupErr.passwordErr ? (
              <p className="py-1 text-danger">{signupErrMsg.passwordErrMsg}</p>
            ) : null}
            <MDBBtn onClick={submitHandle} className="mt-5 mb-4 w-100 fw-bold">
              {
                loading ? 
                  <MDBSpinner style={{ width: "16px", height: "16px" }} role='status' tag='span' />
                 :
                  <span>Register</span>
              }
            </MDBBtn>
          </form>
          <p className="text-muted">Already have an Account?<Link to="/auth/login" className=""> SignIn
          </Link>
          </p>
        </MDBContainer>
      )}
    </>
  );
}

export default Signup;

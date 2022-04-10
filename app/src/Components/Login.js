import { MDBBtn, MDBContainer, MDBIcon, MDBInput } from "mdb-react-ui-kit";
import React, { useContext, useState } from "react";
import GoogleLogin from "react-google-login";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";

function Login() {
  const { user, setuser, setloggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  const [alertShow, setalertShow] = useState(false)
  const [formDetail, setformDetail] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setformErrors] = useState({
    emailError: false,
    passwordError: false,
  });

  const changeHandler = (e) => {
    let { name, value } = e.target;
    setformDetail({ ...formDetail, [name]: value });

    if (name === "email") {
      setformErrors({ ...formErrors, emailError: false });
    } else if (name === "password") {
      setformErrors({ ...formErrors, passwordError: false });
    }
  };

  const responseGoogle_success = (response) => {
    fetch("/auth/google-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_token: response.tokenId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('iNotes_user', data.token);
          setloggedIn(true);
          setuser(data.user);
          navigate("/");
        }else {
          alert("Google login failed !!!")
        }
      })
      .catch((err) => console.log(err));
  };

  const responseGoogle_failure = (response) => {
    console.log(response);
  };

  const submitHandle = (e) => {
    e.preventDefault();

    if (!formDetail.email && !formDetail.password) {
      setformErrors({
        emailError: true,
        passwordError: true,
      });
    } else if (!formDetail.email) {
      setformErrors({ ...formErrors, emailError: true });
    } else if (!formDetail.password) {
      setformErrors({ ...formErrors, passwordError: true });
    } else if (formDetail.email && formDetail.password) {
      fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDetail),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.verified === true) {
            // localStorage.setItem('iNotes_user', data.token);
            setloggedIn(true);
            setuser(data.user);
            setformDetail({
              email: "",
              password: "",
            });
            navigate("/");
          }else if(data.user?.verified === false){
            setuser(data.user)
            setalertShow(true)
          }else {
            alert(data.error);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const sendNewEmail = (e)=>{
    e.preventDefault()

    fetch(`/auth/resend-verification-email?userId=${user._id}`, {
      method: "GET",
    }).then(res => res.json())
    .then(data => {
      if(data.error){
        return alert(data.error)
      }
      alert(data.message)
      setalertShow(false)
    })
    .catch(err => console.log(err))
  }

  return (
    <MDBContainer className="py-5">
      {
        alertShow &&
      <div style={{fontSize:"14px"}} className="alert alert-danger col-11 mx-auto py-2">
        <p className="mb-0">You haven't verified Email yet. Kindly Check your Mail-box.</p>
        <button className="border-0 bg-transparent p-0 text-primary" onClick={sendNewEmail}>Click here to get new verification Email</button>
      </div>
      }
    <MDBContainer className="col-md-6 col-lg-5 col-xl-4 col-10 p-4 bg-light shadow rounded-3 text-center border">
      <h1 className="py-2">LogIn</h1>
      <form className="mb-4" action="/api/auth" method="post">
        <MDBInput
          className="w-100 mt-3 py-2"
          type="email"
          name="email"
          label="Email Id"
          value={formDetail.email}
          onChange={changeHandler}
        ></MDBInput>
        {formErrors.emailError ? (
          <p className="py-1 text-danger">Email Required</p>
        ) : null}
        <MDBInput
          className="w-100 mt-3 py-2"
          type="password"
          name="password"
          label="Password"
          value={formDetail.password}
          onChange={changeHandler}
        ></MDBInput>
        {formErrors.passwordError ? (
          <p className="py-1 text-danger">Password Required</p>
        ) : null}
      </form>
      <Link to="/auth/user/forgotPassword" className="text-muted">
        <p className="mb-0">Forgot Password?</p>
      </Link>
      <MDBBtn onClick={submitHandle} size="md" className="my-4 w-100 fw-bold">
      Sign in
      </MDBBtn>
      <p className="text-muted">
      Don't have an account yet?
      <Link to="/auth/signup" className=""> Signup</Link>
      </p>
      <div class="divider d-flex align-items-center my-3">
            <p class="text-center fw-bold mx-3 mb-0">Or</p>
          </div>
      <div className="d-flex justify-content-center gap-2 align-items-center mb-3">
        <p className="mb-0">Sign in with</p>
        <GoogleLogin
          clientId="884118040559-u7hlmd21srheug0obnbhoc14t2c2odqo.apps.googleusercontent.com"
          buttonText="SignIn"
          render= {props => (
            <button className="btn btn-primary btn-floating"  onClick={props.onClick} ><MDBIcon fab size="lg" icon="google"></MDBIcon></button>
          )}
          // isSignedIn={true}
          onSuccess={responseGoogle_success}
          onFailure={responseGoogle_failure}
          cookiePolicy={"single_host_origin"}
        />
      </div>
    </MDBContainer>
    </MDBContainer>
  );
}

export default Login;

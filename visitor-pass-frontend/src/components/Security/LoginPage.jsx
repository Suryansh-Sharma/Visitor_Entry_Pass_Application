import React, { useState, useContext, useEffect } from "react";
import "../Security/LoginPage.css";
import "../../css/Common.css";
import { VisitorEntryPassContext } from "../../context/VisitorEntryPassContext";
import { useMutation } from "@apollo/client";
import { LOGIN_USER, Resend_Otp, Vetify_Otp } from "../../graphQl/queries";
import { toast } from "react-toastify";
import LoadingPage from "../LoadingPage";
import { Navigate, useNavigate } from "react-router";
import { Form, Button, Nav } from "react-bootstrap";
import Swal from "sweetalert2";
function LoginPage() {
  const { setUserInfo, userInfo } = useContext(VisitorEntryPassContext);
  const [loginUserApi, { loading }] = useMutation(LOGIN_USER, {
    fetchPolicy: "no-cache",
  });
  const [verifyOtpApi, { loading: verifyOtpApiLoading }] = useMutation(
    Vetify_Otp,
    {
      fetchPolicy: "no-cache",
    }
  );
  const [resendOtpApi, { loading: ResendOtpLoading }] = useMutation(
    Resend_Otp,
    {
      fetchPolicy: "no-cache",
    }
  );

  const [showPassword, SetShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo && !userInfo.isVerified) {
      document.title = "Verify Account";
    } else {
      document.title = "Login";
    }
    // console.log(userInfo);
  }, []);

  const validateFormFields = (name, value) => {
    let err = "";
    switch (name) {
      case "username":
        err = value.trim().length > 0 ? "" : "Username is required";
        break;
      case "password":
        err = value.length >= 3 ? "" : "Password must be at least 3 characters";
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: err }));
    return err; // Return the error for further validation check
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    // Validate all fields and store errors
    const usernameError = validateFormFields("username", formData.username);
    const passwordError = validateFormFields("password", formData.password);

    // Check if there are any validation errors
    if (usernameError || passwordError) {
      handleToastNotification(
        "isError",
        "Please fill out all fields correctly."
      );
      console.log("Form has errors:", { usernameError, passwordError });
      return; // Prevent API call if there are errors
    }

    // Proceed to call API if no errors are found
    submitLoginDataToApi(formData.username, formData.password);
  };

  const handleDataChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateFormFields(name, value); // Validate on field change
  };

  const handleToastNotification = (state, message) => {
    if (state === "isError") {
      toast.error(message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else if (state === "isSuccess") {
      toast.success("🦄 " + message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  
  const submitLoginDataToApi = async (username, password) => {
    try {
      const { data } = await loginUserApi({
        variables: {
          username: formData.username,
          password: formData.password,
        },
      });

      const user = data.loginUser;
      console.log("User ", user);
      setUserInfo(user);
      const jwtToken = user.credentials.jwtToken.token;
      localStorage.setItem("userInfo", JSON.stringify(user));
      sessionStorage.setItem("jwtToken", JSON.stringify(jwtToken));
      // ✅ Use navigate here
      navigate("/", {
        replace: true,
        state: { message: `Welcome Back ${user.username}` },
      });
    } catch (error) {
      console.error(error);
      handleToastNotification("isError", error.message || "Login failed!");
    }
  };
  const [otp, setOtp] = useState("");
  const handleOtpChange = (event) => {
    setOtp(event.target.value);
  };

  const submitVerifyOtp = async (event) => {
    event.preventDefault();
    try {
      const response = await verifyOtpApi({
        variables: {
          Otp: parseInt(otp),
          userId: userInfo.id,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Task Completed !!",
        text: response.data,
      });
      const res = JSON.parse(sessionStorage.getItem("userInfo"));
      if (res) {
        res.isActive = true;
        res.isVerified = true;
        sessionStorage.setItem("userInfo", JSON.stringify(res));
      } else {
        console.log(res);
      }
      document.location.reload();
    } catch (error) {
      Swal.fire({
        title: "Error !!",
        text: error.message,
        icon: "error",
      });
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    const res = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to proceed with SignOut ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, SignOut!",
      cancelButtonText: "No, cancel",
    });
    if (res) {
      navigate("/sign-up", { replace: true });
      sessionStorage.clear();
      document.location.reload();
    }
  };

  const handleResendOtp = async () => {
    if (!userInfo || !userInfo.id) {
      Swal.fire({
        title: "Error !!",
        text: "User information is missing. Please try again.",
        icon: "error",
      });
      return;
    }

    try {
      await resendOtpApi({
        variables: { userId: userInfo.id },
      });
      Swal.fire({
        icon: "success",
        title: "Task Completed !!",
        text: "OTP sent to Admin successfully !!",
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error !!",
        text: error.message,
        icon: "error",
      });
    }
  };

  if (loading || verifyOtpApiLoading || ResendOtpLoading) {
    return <LoadingPage />;
  }

  if (userInfo && !userInfo.isVerified && !userInfo.isActive) {
    return (
      <>
        <Form className="SignUpForm" onSubmit={submitVerifyOtp}>
          <div className="p-4 border rounded shadow-sm">
            <Form.Group>
              <Form.Label>Enter 6 Digit OTP</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter otp"
                name="otp"
                maxLength={6}
                minLength={6}
                value={otp}
                required
                onChange={handleOtpChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mt-3">
              Verify Otp
            </Button>
            <Button
              variant="link"
              onClick={() => handleResendOtp()}
              className="w-100 mt-2"
            >
              Resend OTP
            </Button>

            <Button
              variant="danger"
              className="w-100 mt-3"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>

            {/* <Form.Text>If you didn't receive the OTPResend OTP</Form.Text> */}
          </div>
        </Form>
      </>
    );
  }

  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <form
            className="login100-form validate-form"
            onSubmit={handleSubmitForm}
          >
            <span className="login100-form-title p-b-26">Welcome</span>

            <div className="mb-3">
              <label className="form-label">User Name</label>
              <input
                type="text"
                className={`form-control ${
                  errors.username ? "is-invalid" : ""
                }`}
                value={formData.username}
                name="username"
                placeholder="Enter your username"
                onChange={handleDataChange}
                autoComplete="off"
              />
              {errors.username && (
                <div className="text-danger">{errors.username}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"} // Toggle between text and password
                  className={`form-control ${
                    formData.password.length < 6 ? "is-invalid" : ""
                  }`} // Optional: add validation class
                  value={formData.password}
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleDataChange}
                  autoComplete="off"
                />

                <div className="">
                  <button
                    type="button"
                    className="mx-1 btn btn-outline-secondary"
                    onClick={() => {
                      SetShowPassword((prevState) => !prevState);
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {errors.password && (
                <div className="text-danger">{errors.password}</div>
              )}
            </div>

            <div className="container-login100-form-btn">
              <div className="wrap-login100-form-btn">
                <div className="login100-form-bgbtn"></div>
                <button
                  className="login100-form-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </div>

            <div className="text-center p-t-115">
              <span className="txt1">Don’t have an account?</span>
              <span
                className="txt2"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/sign-up");
                }}
              >
                Sign Up
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

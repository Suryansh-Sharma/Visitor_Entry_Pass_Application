import { useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import "../css/Common.css";
import { Registor_New_User } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";
export default function SignUp() {
  const navigate = useNavigate();
  const [signUpApi, { loading }] = useMutation(Registor_New_User, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    document.title = "Sign Up";
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    contact: "",
    password: "",
    role: "RECEPTIONIST",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const UserInput = {
      contact: formData.contact,
      password: formData.password,
      role: formData.role,
      username: formData.username,
    };

    try {
      const response = await signUpApi({
        variables: { input: UserInput },
      });

      navigate("/", { replace: true });
      localStorage.setItem(
        "userInfo",
        JSON.stringify(response.data.registerNewUser)
      );
      document.location.reload();
    } catch (error) {
      Swal.fire({
        title: "Something Went Wrong !!",
        text: error.message,
        icon: "error",
      });
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div>
      <div className="d-flex m-3">
        <button
          className="btn btn-outline-dark"
          onClick={() => {
            navigate("/");
          }}
        >
          Go Back
        </button>
      </div>

      <div className="SignUpForm">
        <div className="p-4 border rounded shadow-sm">
          <h2 className="text-center mb-4">Sign Up</h2>

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formContact">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter contact number"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                pattern="^[0-9]{10}$"
              />
              <Form.Text className="text-muted">
                We'll never share your phone number with anyone else.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mt-3">
              Register
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

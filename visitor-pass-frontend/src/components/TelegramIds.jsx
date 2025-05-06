import React, { useContext, useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import "../css/Common.css";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import { useMutation } from "@apollo/client";
import { Add_New_TelegramId, Delete_TelegramId } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";
import Swal from "sweetalert2";
function TelegramIds() {
  const { allTelegramIds } = useContext(VisitorEntryPassContext);
  const [addNewTelegramApi, { loading:addNewTelegramLoading }] = useMutation(Add_New_TelegramId, {
    fetchPolicy: "no-cache",
  });
  const [deleteTelegramApi, { loading }] = useMutation(Delete_TelegramId, {
    fetchPolicy: "no-cache",
  });

  useEffect(()=>{
    document.title="Telegram Id"
  },[])

  const [formData, setFormData] = useState({
    hostName: "",
    chatId: "",
    role: "TEACHER",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async(event) => {
    event.preventDefault();
    try {
      const TelegramIdModel = {
        hostName: formData.hostName,
        chatId: formData.chatId,
        role: formData.role,
      }
      await addNewTelegramApi({
        variables:{input:TelegramIdModel}
      })
      sessionStorage.removeItem("telegramIds");
      Swal.fire({
        title: "Success",
        text: "Added New Id Successfully ",
        icon: "success",
      }).then(()=>{
        document.location.reload();
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Something Went Wrong !!",
        text: error.message,
        icon: "error",
      });
    }

  };

  const handleDeleteTelegramId=async(id)=>{
    const result = await Swal.fire({
      title: "Are You Sure !!",
      text: "Do you want to proceed with this action?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel",
    });

    if(result.isConfirmed){
    try {
      await deleteTelegramApi({
        variables:{id:id}
      })
      sessionStorage.removeItem("telegramIds");
      Swal.fire({
        title: "Success",
        text: "Removed Id Successfully !!",
        icon: "success",
      }).then(()=>{
        document.location.reload();
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Something Went Wrong !!",
        text: error.message,
        icon: "error",
      });
    }
    }

  }

  if(loading || addNewTelegramLoading){
    return <LoadingPage></LoadingPage>
  }

  return (
    <div>
      <div className="TelegramIdForm">
        <div className="p-4 border rounded shadow-sm">
          <h2 className="text-center mb-4">Add New Id</h2>

          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formhostname">
              <Form.Label>Hostname</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter hostname"
                name="hostName"
                value={formData.hostName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formchatId">
              <Form.Label>Chat Id</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter chat Id"
                name="chatId"
                value={formData.chatId}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                onChange={handleChange}
                value={formData.role}
              >
                <option value="TEACHER">TEACHER</option>
                <option value="RECEPTIONIST">RECEPTIONIST</option>
                <option value="EXTRA">EXTRA</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mt-3">
              Add New Telegram Id
            </Button>
          </Form>
        </div>
      </div>
      <br />
      <hr />
      <div className="TelegramIdResSec">
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Host Name</th>
              <th>Chat Id</th>
              <th>Role</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {allTelegramIds.map((data,index) => (
              <tr key={index}>
                <td>{index+1}</td>
                <td>{data.hostName}</td>
                <td>{data.chatId}</td>
                <td>{data.role}</td>
                <td className="text-danger" style={{cursor:'pointer'}} onClick={()=>handleDeleteTelegramId(data.id)}>Remove Id</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default TelegramIds;

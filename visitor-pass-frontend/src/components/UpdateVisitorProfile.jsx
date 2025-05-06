import { useLazyQuery, useMutation } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { GET_VISITOR_BY_ID, UPDATE_VISITOR } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";
import { toast } from "react-toastify";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Webcam from "react-webcam";
import axios from "axios";

function UpdateVisitorProfile() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const webcamRef = useRef(null);

  const [isWebcamReady, setIsWebcamReady] = useState(false);

  const MySwal = withReactContent(Swal);
  const { id } = useParams();
  const [getVisitorById, { loading: getVisitorByContactLoading }] =
    useLazyQuery(GET_VISITOR_BY_ID, { fetchPolicy: "cache-first" });

  const [updateVisitorInfoApi, { loading: updateVisitorInfo }] =
    useMutation(UPDATE_VISITOR);

  const navigate = useNavigate();
  const [isPageLoading, SetIsPageLoading] = useState(true);

  useEffect(() => {
    const oldData = JSON.parse(sessionStorage.getItem(id));
    if (oldData) {
      initializeApiData(oldData);
    } else {
      fetchVisitorInfoById();
      console.log("Fetch Data");
    }

    getDevices();
  }, []);

  const getDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 1) {
        setSelectedDeviceId(videoDevices[1].deviceId);
      } else if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    } finally {
      setIsWebcamReady(true);
    }
  };

  const handleDeviceChange = (event) => {
    setIsWebcamReady(false);
    setSelectedDeviceId(event.target.value);
    setIsWebcamReady(true);
  };

  const [visitorInfo, SetVisitorInfo] = useState({
    visitorContact: "",
    visitorName: "",
    visitorImage: "",
    updateVisitorInfo: false,
    hasChildrenInSchool: false,
  });

  const [visitorAddress, SetVisitorAddress] = useState({
    city: "Bulandshahr",
    pinCode: "203001",
    line1: "",
  });
  const [visitorChildren, SetVisitorChildren] = useState([]);
  const [banStatus, SetBanStatus] = useState({
    isVisitorBanned: false,
    bannedOn: "",
    reason: "",
  });

  const handleUpdateVisitorInfo = (event) => {
    const { name, value } = event.target;
    SetVisitorInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };
  const handleUpdateAddress = (event) => {
    const { name, value } = event.target;
    SetVisitorAddress((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };
  const handleCheckBoxChange = (event) => {
    const { name, checked } = event.target; // Destructure name and checked properties from the event target

    // Update the visitorInfo state with the new checkbox value
    SetVisitorInfo((prevVisitorInfo) => ({
      ...prevVisitorInfo,
      [name]: checked,
    }));
    if (!checked) {
      SetVisitorChildren([]);
    }
  };

  const addNewRow = () => {
    SetVisitorChildren((prevChildren) => [
      ...prevChildren,
      { name: "", standard: "" },
    ]);
  };

  const removeRow = (index) => {
    SetVisitorChildren((prevChildren) =>
      prevChildren.filter((_, i) => i !== index)
    );
  };

  // Function to handle input changes for children (name and standard)
  const handleChildInputChange = (index, field, value) => {
    const updatedChildren = [...visitorChildren];
    updatedChildren[index][field] = value;
    SetVisitorChildren(updatedChildren);
  };

  const handleToastNotification = (state, message) => {
    if (state === "isError") {
      toast.error(message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
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

  const validateForm = () => {
    let isValid = true;
    const errors = [];

    if (!visitorInfo.visitorName) {
      isValid = false;
      errors.push("Visitor Name is required");
    }

    // Check if the visitor contact is provided and valid (e.g., 10 digits)
    if (!visitorInfo.visitorContact) {
      isValid = false;
      errors.push("Visitor Contact is required");
    } else if (visitorInfo.visitorContact.length !== 10) {
      isValid = false;
      errors.push("Visitor Contact should be 10 digits long");
    }
    if (!visitorAddress.city) {
      isValid = false;
      errors.push("Visitor City is required");
    }
    if (!visitorAddress.pinCode) {
      isValid = false;
      errors.push("Visitor Pincode is required");
    }
    if (!visitorAddress.line1) {
      isValid = false;
      errors.push("Visitor Line1 is required");
    }
    // Check if there is a valid visitor image
    if (!visitorInfo.visitorImage) {
      isValid = false;
      errors.push("Visitor Image is required");
    }

    // If the user has children in school, check if all children have valid info
    if (visitorInfo.hasChildrenInSchool) {
      if (visitorChildren.length === 0) {
        isValid = false;
        errors.push(
          "Is Parent of School Children without children entries !! "
        );
      }
      visitorChildren.forEach((child, index) => {
        if (!child.name || !child.standard) {
          isValid = false;
          errors.push(`Child ${index + 1} info is incomplete`);
        }
      });
    }

    if (banStatus.isVisitorBanned && !banStatus.reason) {
      isValid = false;
      errors.push("If user is ban then tell reason !!");
    }

    if (!isValid) {
      errors.forEach((err) => {
        handleToastNotification("isError", err);
      });
    }

    return isValid;
  };

  const submitFormData = async () => {
    SetIsPageLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!validateForm()) {
      SetIsPageLoading(false);
      return;
    } else {
      submitUpdateDataToApi();
    }
    SetIsPageLoading(false);
  };

  const handleBanStatusChange = () => {
    SetBanStatus((prevState) => ({
      ...prevState,
      isVisitorBanned: !prevState.isVisitorBanned,
    }));
  };
  const handleBanDataChange = (event) => {
    const { name, value } = event.target;
    SetBanStatus((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Api Section
  const fetchVisitorInfoById = async () => {
    try {
      const response = await getVisitorById({
        variables: { visitorId: id },
      });

      const data = response.data.getVisitorById;
      if (data) {
        sessionStorage.setItem(id, JSON.stringify(data));
        initializeApiData(data);
      }
    } catch (error) {
      console.log("Unable to fecth ");
      console.log(error);
      navigate("/");
    }
  };

  const submitUpdateDataToApi = async () => {
    let VisitorInput = preprareSubmitData();
    try {
      const response = await updateVisitorInfoApi({
        variables: { input: VisitorInput },
      });
      if (response.data.updateVisitorInfo) {
        sessionStorage.setItem(
          id,
          JSON.stringify(response.data.updateVisitorInfo)
        );
        initializeApiData(response.data.updateVisitorInfo);
        MySwal.fire({
          title: "Successfull !!",
          text: "Visitor Profile has been updated successfully !!",
          icon: "success",
          confirmButtonColor: "#218838",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const preprareSubmitData = () => {
    let VisitorInput = {
      id: id,
      visitorContact: visitorInfo.visitorContact,
      visitorName: visitorInfo.visitorName,
      visitorImage: visitorInfo.visitorImage,
      hasChildrenInSchool: visitorInfo.hasChildrenInSchool,
      updateVisitorInfo: visitorInfo.updateVisitorInfo,
      visitorAddress: {
        city: visitorAddress.city,
        line1: visitorAddress.line1,
        pinCode: visitorAddress.pinCode,
      },
      visitorChildren: null,
      banStatus: null,
    };
    if (banStatus.isVisitorBanned) {
      VisitorInput.banStatus = {
        isVisitorBanned: true,
        reason: banStatus.reason,
      };
    }
    if (visitorInfo.hasChildrenInSchool && visitorChildren.length > 0) {
      VisitorInput.visitorChildren = visitorChildren.map((child) => ({
        name: child.name,
        standard: child.standard,
      }));
    }
    return VisitorInput;
  };

  const initializeApiData = (data) => {
    SetIsPageLoading(true);

    SetVisitorAddress(data.visitorAddress);
    SetVisitorInfo(data);
    SetVisitorChildren(data.visitorChildren);
    if (data.banStatus) {
      SetBanStatus(data.banStatus);
    }
    if (data.visitorChildren) {
      SetVisitorChildren(data.visitorChildren);
    } else {
      SetVisitorChildren([]);
    }
    SetIsPageLoading(false);
  };

  //  Image Section

  const updateVisitorImage = async () => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you want to update visitor image",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel",
      cancelButtonColor: "#d33",
      confirmButtonColor: "#218838",
    });
    if (!result) {
      return;
    }
    console.log(visitorInfo.visitorImage);
    const imageSrc = webcamRef.current.getScreenshot();
    SetIsPageLoading(true);
    if (imageSrc) {
      const formData = new FormData();
      let name = visitorInfo.visitorImage;
      if (name == null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        name = `${timestamp}.jpg`;
        formData.append("image", dataURItoBlob(imageSrc, name));
      } else {
        formData.append("image", dataURItoBlob(imageSrc, name));
      }

      axios
        .post(
          "http://localhost:8080/api/v1/file/update-old-image/" + name,
          formData
        )
        .then(() => {
          if (visitorInfo.visitorImage == null) {
            SetVisitorInfo((prevInfo) => ({
              ...prevInfo,
              visitorImage: name,
            }));
            updateImageInVisitorInfoIfNull(name);
          }

          MySwal.fire({
            title: "Successfull !!",
            text: "Visitor Profile image been updated successfully !!",
            icon: "success",
            confirmButtonColor: "#218838",
          });
          sessionStorage.removeItem(name);
        })
        .catch((error) => {
          // Handle any error that occurred during the request
          console.error("Failed to upload image:", error);
        });

      SetIsPageLoading(false);
    }
  };
  const updateImageInVisitorInfoIfNull = async (imageName) => {
    let VisitorInput = preprareSubmitData();
    VisitorInput.visitorImage = imageName;
    try {
      const response = await updateVisitorInfoApi({
        variables: { input: VisitorInput },
      });
      if (response.data.updateVisitorInfo) {
        sessionStorage.removeItem(id);
        initializeApiData(response.data.updateVisitorInfo);
        console.log("Visitor info updated after image change ");
        window.location.reload();
      }
    } catch (error) {
      console.log("Error while update updateImageInVisitorInfoIfNull");
      console.log(error);
    }
  };
  const dataURItoBlob = (dataURI, fileName) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString, name: fileName });
  };

  if (getVisitorByContactLoading || isPageLoading || updateVisitorInfo) {
    return <LoadingPage />;
  }
  return (
    <div className={"m-5"}>
      <div className="d-flex">
        <button
          className="btn btn-outline-dark"
          onClick={() => {
            navigate(-1);
          }}
        >
          Go Back
        </button>
      </div>
      <h4
        className={"my-4 font-medium"}
        style={{ fontSize: 30, textAlign: "center" }}
      >
        Update Visitor Info
      </h4>
      <hr />
      <form className={"my-3"} onSubmit={submitFormData}>
        <div className="col-md-4" key={"Key1"}>
          <span className={""}>Contact Number</span>
          <input
            aria-autocomplete={"list"}
            onChange={handleUpdateVisitorInfo}
            value={visitorInfo.visitorContact}
            name="visitorContact"
            type="text"
            className="my-2 form-control"
            placeholder="10 Digit Mobile Number"
          />
        </div>

        <div className="col-md-4">
          <span>Visitor Name</span>
          <input
            aria-autocomplete={"list"}
            onChange={handleUpdateVisitorInfo}
            name="visitorName"
            type="text"
            className="my-2 form-control"
            value={visitorInfo.visitorName}
            placeholder="Visitor Name"
          />
        </div>

        {/* Visitor Address Section */}
        <h5 className={"my-4 font-medium"} style={{ fontSize: 30 }}>
          Visitor Address
        </h5>
        <div className="">
          <div className="col-md-2">
            <label>City</label>
            <input
              className="form-control"
              type="text"
              placeholder="City"
              value={visitorAddress.city}
              onChange={handleUpdateAddress}
              autoComplete="address-level2"
              name="city"
            />
          </div>

          <div className="col-md-2 my-1">
            <label>Pincode</label>
            <input
              className="form-control"
              type="text"
              placeholder="Pincode"
              value={visitorAddress.pinCode}
              onChange={handleUpdateAddress}
              autoComplete="postal-code"
              name="pinCode"
            />
          </div>

          <div className="col-md-2 my-1">
            <label>Line 1</label>
            <input
              className="form-control"
              type="text"
              placeholder="Address Line 1"
              value={visitorAddress.line1}
              onChange={handleUpdateAddress}
              name="line1"
            />
          </div>
        </div>
        <br />
        {/* Parent Checkbox Section */}
        <div className="d-flex flex-column ">
          <div className="mb-3">
            <label className="form-label">Is Parent of School Children</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={visitorInfo.hasChildrenInSchool}
                name="hasChildrenInSchool"
                onChange={handleCheckBoxChange}
                style={{ cursor: "pointer", width: "25px", height: "25px" }}
              />
            </div>
          </div>

          {/* Children Info Section */}
          {visitorInfo.hasChildrenInSchool ? (
            <div className="mt-4">
              <label className="form-label d-block">Add Children Info</label>
              {/* Add New Row Button */}
              <Button
                type="button"
                onClick={addNewRow}
                variant="outline-primary"
              >
                Add New Row
              </Button>
              <br />
              <br />
              {/* Children List */}
              {visitorChildren.map((child, index) => (
                <div key={index} className="d-flex mb-3">
                  <div className="mb-2 me-3" style={{ flex: 1 }}>
                    <input
                      type="text"
                      className="form-control"
                      value={child.name}
                      placeholder="Child Name"
                      onChange={(e) =>
                        handleChildInputChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="mb-2" style={{ flex: 1 }}>
                    <select
                      className="form-control"
                      value={child.standard}
                      onChange={(e) =>
                        handleChildInputChange(
                          index,
                          "standard",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Select Standard
                      </option>
                      {/* Kindergarten / Lower Grades */}
                      <optgroup label="Kindergarten / Lower Grades">
                        <option value="JKG">Junior Kindergarten (JKG)</option>
                        <option value="SKG">Senior Kindergarten (SKG)</option>
                        <option value="UKG">Upper Kindergarten (UKG)</option>
                      </optgroup>

                      {/* Primary Grades */}
                      <optgroup label="Primary Grades">
                        <option value="1">1st Grade</option>
                        <option value="2">2nd Grade</option>
                        <option value="3">3rd Grade</option>
                        <option value="4">4th Grade</option>
                        <option value="5">5th Grade</option>
                        <option value="6">6th Grade</option>
                      </optgroup>

                      {/* Secondary Grades */}
                      <optgroup label="Secondary Grades">
                        <option value="7">7th Grade</option>
                        <option value="8">8th Grade</option>
                        <option value="9">9th Grade</option>
                        <option value="10">10th Grade</option>
                      </optgroup>

                      {/* Higher Secondary Grades */}
                      <optgroup label="Higher Secondary Grades">
                        <option value="11 SCI">11th Grade - Science</option>
                        <option value="11 COM">11th Grade - Commerce</option>
                        <option value="12 SCI">12th Grade - Science</option>
                        <option value="12 COM">12th Grade - Commerce</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="mx-1" style={{ flex: 1 }}>
                    <Button
                      variant="outline-danger"
                      onClick={() => removeRow(index)}
                    >
                      Remove Row
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <br />

        <div className="mb-3">
          {/* Ban Status Checkbox Section */}
          <div className="form-group">
            <div className="form-check">
              <input
                id="banStatusCheckbox"
                className="form-check-input"
                type="checkbox"
                checked={banStatus.isVisitorBanned}
                name="hasChildrenInSchool"
                onChange={handleBanStatusChange}
                style={{ cursor: "pointer" }}
              />
              <label className="form-check-label" htmlFor="banStatusCheckbox">
                Ban this user
              </label>
            </div>
          </div>

          {/* Reason for Ban Input Section (conditionally rendered) */}
          {banStatus.isVisitorBanned && (
            <div className="mt-2 col-md-3">
              <label htmlFor="banReason" className="form-label">
                Enter reason for banning
              </label>
              <input
                name="reason"
                value={banStatus.reason}
                type="text"
                className="form-control "
                onChange={handleBanDataChange}
                placeholder="Provide a reason for banning the user"
              />
            </div>
          )}
        </div>

        <br />
        <br />
        <div className="d-flex justify-content-between">
          <Button variant="outline-success" name={"addVisit"} type="submit">
            Update Visitor Info
          </Button>
        </div>
      </form>
      <br />
      <hr />
      <br />
      {isWebcamReady ? (
        <div className="d-flex flex-column justify-content-center">
          <div className="col-md-2">
            <Form.Group controlId="webcamSelect">
              <Form.Label>Select Webcam</Form.Label>
              <Form.Control
                as="select"
                value={selectedDeviceId}
                onChange={handleDeviceChange}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${devices.indexOf(device) + 1}`}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Webcam
              audio={false}
              height={200}
              screenshotFormat="image/jpeg"
              width={300}
              videoConstraints={{ deviceId: selectedDeviceId }}
              ref={webcamRef}
              mirrored={true}
              className="webcam-preview"
            />
          </div>

          <div className="col-md-4 mt-2">
            <Button variant="outline-warning" onClick={updateVisitorImage}>
              Update Visitor Image
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="justify-content-center d-flex">
            <span className="text-danger" style={{ textAlign: "center" }}>
              Please Wait Webcam is loading !!
            </span>
          </div>
        </>
      )}
    </div>
  );
}
export default UpdateVisitorProfile;

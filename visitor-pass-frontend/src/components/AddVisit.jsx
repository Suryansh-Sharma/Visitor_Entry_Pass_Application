import { useApolloClient, useLazyQuery, useMutation } from "@apollo/client";
import axios from "axios";
import { debounce } from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import Webcam from "react-webcam";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import "../css/AddVisit.css";
import { ADD_NEW_VISIT, GET_VISITOR_BY_CONTACT } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";

function AddVisit() {
  const { allTelegramIds } = useContext(VisitorEntryPassContext);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showImagSec, setShowImgSec] = useState(true);

  const MySwal = withReactContent(Swal);

  const client = useApolloClient();
  const [addNewVisitApi, { loading: addNewVisitLoading }] = useMutation(
    ADD_NEW_VISIT,
    {
      fetchPolicy: "no-cache",
    }
  );
  const [getVisitorByContact, { loading: getVisitorByContactLoading }] =
    useLazyQuery(GET_VISITOR_BY_CONTACT, { fetchPolicy: "no-cache" });
  const navigate = useNavigate();

  const [isPageLoading, setPageLoading] = useState(false);
  const [isWebCamReady, setWebCamReady] = useState(false);

  // User Ref for moving up and down in form on Key Press
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    document.title = "Add Visit";
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
      setWebCamReady(true);
    }
  };

  const handleDeviceChange = (event) => {
    setSelectedDeviceId(event.target.value);
  };

  const captureImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const imageName = `${timestamp}.jpg`;
    setCapturedImage(imageSrc);
    SetVisitorInfo((prevInfo) => ({
      ...prevInfo,
      visitorImage: imageName,
    }));
  };

  const resetCapture = () => {
    SetVisitorInfo((prevInfo) => ({
      ...prevInfo,
      visitorImage: "",
    }));
    setCapturedImage(null);
    setShowImgSec(true);
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
  const [visitingRecord, SetVisitingRecord] = useState({
    reason: "",
    visitorHost: "",
    status: "",
  });
  const [visitorChildren, SetVisitorChildren] = useState([]);
  const [banStatus, SetBanStatus] = useState({
    isVisitorBanned: false,
    bannedOn: "",
    reason: "",
  });

  const handleUpdateVisitorInfo = (event) => {
    const { name, value } = event.target;

    if (name === "visitorContact" && value.length === 10) {
      fetchUserByContact(value);
    } else if (name === "visitorContact" && value.length > 10) {
      handleToastNotification(
        "isError",
        "Contact can't be greater than 10 digit"
      );
      return;
    }
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
  const handleVisitingRecordChange = (event) => {
    const { name, value } = event.target;
    SetVisitingRecord((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };
  const handleCheckBoxChange = (event) => {
    const { name, checked } = event.target;
    SetVisitorInfo((prevVisitorInfo) => ({
      ...prevVisitorInfo,
      [name]: checked,
    }));
    if (!checked) {
      SetVisitorChildren([]);
    }
  };
  const handleHostDropdownChange = (selectedHostName) => {
    if (selectedHostName) {
      SetVisitingRecord((prevInfo) => ({
        ...prevInfo,
        visitorHost: selectedHostName,
      }));
    } else {
      console.log("Error in handleHostDropdownChange: " + selectedHostName);
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
  const formatDate = (oldDate) => {
    const date = new Date(oldDate);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(date);
  };

  const submitFormData = async (event) => {
    setPageLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (banStatus.isVisitorBanned) {
      MySwal.fire({
        title: <p>Visitor is banned !!</p>,
        text: `Visitor ${visitorInfo.visitorName} is banned on ${formatDate(
          banStatus.bannedOn
        )} due to reason:- ${banStatus.reason}`,
        icon: "error",
        confirmButtonColor: "#218838",
      });
      setPageLoading(false);
      return;
    }

    event.preventDefault();
    if (!validateForm()) {
      setPageLoading(false);
      return;
    }
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you want to proceed with this action?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel",
      cancelButtonColor: "#d33",
      confirmButtonColor: "#218838",
    });
    if (result.isConfirmed) {
      submitAddVisitDataToApi();
      setPageLoading(false);
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
    if (!visitingRecord.visitorHost) {
      isValid = false;
      errors.push("Select Host Name !!");
    }
    if (!visitingRecord.reason) {
      isValid = false;
      errors.push("Enter reason for visit");
    }

    if (!isValid) {
      errors.forEach((err) => {
        handleToastNotification("isError", err);
      });
    }

    return isValid;
  };
  const reassignFromDataWithContact = (contact) => {
    SetVisitorInfo({
      visitorContact: contact,
      visitorName: "",
      visitorImage: "",
      updateVisitorInfo: false,
      hasChildrenInSchool: false,
    });

    SetVisitorAddress({
      city: "Bulandshahr",
      pinCode: "203001",
      line1: "",
    });
    SetVisitingRecord({
      reason: "",
      visitorHost: "",
      status: "",
    });
    SetVisitorChildren([]);
    SetBanStatus({
      bannedOn: "",
      reason: "",
      isVisitorBanned: false,
    });
  };

  // Api Section
  const fetchUserByContact = async (contact) => {
    if (contact.length === 10) {
      setPageLoading(true);
      debouncedFetchUserByContact(contact);
    }
  };

  const debouncedFetchUserByContact = debounce(async (contact) => {
    try {
      const response = await getVisitorByContact({
        variables: { visitorContact: contact },
      });

      const data = response.data.getVisitorByContact;

      if (!data) {
        reassignFromDataWithContact(contact);
        return;
      }

      handleToastNotification(
        "isSuccess",
        `Info of ${data.visitorName} found!`
      );
      if (data.banStatus) {
        SetBanStatus(data.banStatus);
      }
      SetVisitorAddress(data.visitorAddress);
      SetVisitorInfo(data);
      if (data.visitorChildren) {
        SetVisitorChildren(data.visitorChildren);
      }
      if (data.visitorImage) {
        fetchImageOfUser(data.visitorImage);
        // setShowImgSec(false);
      } else {
        resetCapture();
      }
    } catch (error) {
      // console.log(error);
      reassignFromDataWithContact(contact);
      resetCapture();
    } finally {
      setPageLoading(false);
    }
  }, 500);

  const fetchImageOfUser = async (imageName) => {
    setPageLoading(true);
    try {
      await axios.get(
        `http://localhost:8080/api/v1/file/image-by-name/${imageName}`,
        { responseType: "arraybuffer" }
      );
      setShowImgSec(false);
    } catch (error) {
      resetCapture();
      console.error("Error fetching image:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const submitAddVisitDataToApi = async () => {
    const VisitInput = {
      visitorContact: visitorInfo.visitorContact,
      visitorName: visitorInfo.visitorName,
      visitorImage: visitorInfo.visitorImage,
      hasChildrenInSchool: visitorInfo.hasChildrenInSchool,
      visitorAddress: {
        city: visitorAddress.city,
        line1: visitorAddress.line1,
        pinCode: visitorAddress.pinCode,
      },
      visitorChildren: visitorChildren.map((child) => ({
        name: child.name,
        standard: child.standard,
      })),
      visitingRecord: {
        reason: visitingRecord.reason,
        visitorHost: visitingRecord.visitorHost,
        status: "COMPLETED",
      },
    };

    // console.log("Submited Form Data ", VisitInput);
    try {
      if (showImagSec === true) {
        submitImageToApi();
      }
      const response = await addNewVisitApi({
        variables: { input: VisitInput },
      });

      MySwal.fire({
        title: "Visit Added Successfully",
        text: "The new visit has been successfully added to the system.",
        icon: "success",
        confirmButtonColor: "#218838",
      }).then(() => {
        reassignFromDataWithContact("");
        client.resetStore();
      });
    } catch (error) {
      console.log("Error " + error);
      MySwal.fire({
        title: "Error",
        text: "Something went wrong while adding the new visit.",
        icon: "error",
      });
    }
  };

  const submitImageToApi = () => {
    const formData = new FormData();
    formData.append(
      "image",
      dataURItoBlob(capturedImage, visitorInfo.visitorImage)
    );

    axios
      .post(
        "http://localhost:8080/api/v1/file/new-image/" +
          visitorInfo.visitorImage,
        formData
      )
      .then(() => {
        console.log("Image added successfully");
      })
      .catch((error) => {
        // Handle any error that occurred during the request
        console.error("Failed to upload image:", error);
      });
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

  // Toatify Section

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

  const saveAndRouteToUpdatePage = async () => {
    const response = await getVisitorByContact({
      variables: { visitorContact: visitorInfo.visitorContact },
    });

    const data = response.data.getVisitorByContact;
    if (data) {
      sessionStorage.setItem(data.id, JSON.stringify(data));
      navigate("/update-visitor-profile/" + data.id);
    } else {
      return;
    }
  };

  if (addNewVisitLoading || getVisitorByContactLoading || isPageLoading) {
    return <LoadingPage></LoadingPage>;
  }

  return (
    <div className={"my-4"}>
      <h4 className={"font-medium"} style={{ fontSize: 30 }}>
        Add New Visit
      </h4>
      <hr />
      <form className={"my-3"} onSubmit={submitFormData}>
        <div className="VisitorDetailSec row">
          <div className="my-3">
            <span className="visitor-details-title">Visitor Details</span>
          </div>

          <div className="col-md-4">
            <label htmlFor="visitorContact" className="form-label">
              Contact Number
            </label>
            <input
              id="visitorContact"
              aria-autocomplete="list"
              onChange={handleUpdateVisitorInfo}
              value={visitorInfo.visitorContact}
              ref={inputRefs[0]}
              name="visitorContact"
              type="text"
              className="form-control"
              placeholder="10 Digit Mobile Number"
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="visitorName" className="form-label">
              Visitor Name
            </label>
            <input
              id="visitorName"
              aria-autocomplete="list"
              ref={inputRefs[1]}
              onChange={handleUpdateVisitorInfo}
              name="visitorName"
              type="text"
              className="form-control"
              value={visitorInfo.visitorName}
              placeholder="Visitor Name"
            />
          </div>
        </div>

        {/* Visitor Address Section */}
        <div className="VisitorDetailSec row">
          <div className="my-3">
            <span className="visitor-details-title">Visitor Address</span>
          </div>
          <div className="col-md-4">
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

          <div className="col-md-4">
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

          <div className="col-md-4">
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
          {visitorInfo.hasChildrenInSchool && (
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
          )}
        </div>

        {/* User Visit and visiting details */}

        <div className="row">
          <div className="col-12 my-3">
            <span className="visitor-details-title">Visiting Details</span>
          </div>

          <div className="col-md-3">
            <label>Select Host</label>
            <Dropdown onSelect={handleHostDropdownChange}>
              <Dropdown.Toggle
                variant="outline-secondary"
                id="dropdownMenuLink"
                className="form-control"
              >
                {visitingRecord.visitorHost || "Please Select Host"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {allTelegramIds.map((telegram) => (
                  <Dropdown.Item key={telegram.id} eventKey={telegram.hostName}>
                    <div>
                      <strong>{telegram.hostName}</strong>
                      <div className="text-muted">Role: {telegram.role}</div>
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="col-md-3">
            <label htmlFor="reason">Reason for Visit</label>
            <textarea
              onChange={handleVisitingRecordChange}
              value={visitingRecord.reason}
              className="form-control"
              name="reason"
              id="reason"
              placeholder="Enter the reason for the visit"
            ></textarea>
          </div>
        </div>

        {/* Image Section - Moved to the end */}
        <h5 className="my-4 font-medium" style={{ fontSize: 30 }}>
          Image Section
        </h5>
        {showImagSec ? (
          <div className="image-section">
            <div className="preview-section">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="captured-image"
                />
              ) : (
                <p className="no-image-text">No image captured</p>
              )}
            </div>

            {/* Right Section - Capture Image */}
            {isWebCamReady ? (
              <div className="capture-section">
                {/* Dropdown for selecting webcam */}
                <div className="device-selection">
                  <Form.Group controlId="webcamSelect">
                    <Form.Label>Select Webcam</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedDeviceId}
                      onChange={handleDeviceChange}
                    >
                      {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label ||
                            `Camera ${devices.indexOf(device) + 1}`}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </div>
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
                <div className="button-section">
                  <Button
                    onClick={captureImage}
                    variant="outline-success"
                    className="capture-btn"
                  >
                    Capture Image
                  </Button>
                  {capturedImage && (
                    <Button
                      onClick={resetCapture}
                      variant="outline-danger"
                      className="reset-btn"
                    >
                      Reset Capture
                    </Button>
                  )}
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
        ) : (
          <div className="d-flex">
            <div className="col-md-6 p-2">
              <p>Image is already present</p>
            </div>
          </div>
        )}
        <hr />
        <div className="d-flex justify-content-center m-4 flex-column">
          <Button
            variant="outline-success"
            size="lg"
            name={"addVisit"}
            type="submit"
            className="m-2 col-md-3 mx-auto"
          >
            Add New Visit Of Visitor
          </Button>
          {!showImagSec ? (
            <Button
              variant="info"
              onClick={saveAndRouteToUpdatePage}
              className="m-2 col-md-3 mx-auto"
            >
              Update Visitor Info
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export default AddVisit;

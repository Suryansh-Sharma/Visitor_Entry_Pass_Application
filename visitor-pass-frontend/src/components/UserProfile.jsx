import { useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import "../css/Common.css";
import { GET_VISITOR_BY_ID } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";
function VisitorProfile() {
  const [isLoading, setisLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [getVisitorData, { loading }] = useLazyQuery(GET_VISITOR_BY_ID, {
    variables: { visitorId: id },
    // Optionally you can set fetchPolicy, errorPolicy, etc. here
  });

  const [visitor, setResult] = useState({
    visitorContact: "",
    visitorName: "",
    visitorImage: "",
    banStatus: null,
    visitorAddress: {
      city: "",
      line1: "",
      pinCode: "",
    },
    hasChildrenInSchool: false,
    visitorChildren: [],
  });

  useEffect(() => {
    document.title = "Visitor Profile";
    if (id === undefined) {
      return;
    }
    fetchData();
  }, []);

  const handleNavigation = () => {
    navigate(`/visits-of-visitor/${id}`);
  };
  const fetchData = async () => {
    const response = await getVisitorData();
    if (response.error) {
      alert(response.error);
      console.log(response.error);
      return;
    }
    const res = response.data;
    if (res) {
      setResult(res.getVisitorById);
      // document.title=`${res.getVisitorById.visitorName} Profile`;
    }
  };
  if (loading) return <LoadingPage />;

  if (visitor === null) {
    return <div></div>;
  }
  return (
    <div className="container py-4">
      {/* Back Button */}
      <button
        className="btn btn-light border mb-4"
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </button>

      <div className="card shadow-lg border-0 rounded-4 p-4">
        {/* TOP SECTION */}
        <div className="d-flex align-items-center gap-4 flex-wrap">
          {/* Profile Image */}
          <div>
            <img
              src={`http://localhost:8080/api/v1/file/image-by-name/${visitor.visitorImage}`}
              alt="Visitor"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #f1f1f1",
              }}
            />
          </div>

          {/* Basic Info */}
          <div className="flex-grow-1">
            <h3 className="fw-bold mb-1">{visitor.visitorName}</h3>

            <p className="text-muted mb-1">📞 {visitor.visitorContact}</p>

            <p className="text-muted mb-2">
              📍 {visitor.visitorAddress.line1}, {visitor.visitorAddress.city} -{" "}
              {visitor.visitorAddress.pinCode}
            </p>

            {/* Status Badge */}
            {visitor.banStatus?.isVisitorBanned ? (
              <span className="badge bg-danger px-3 py-2">Banned</span>
            ) : (
              <span className="badge bg-success px-3 py-2">Active</span>
            )}
          </div>
        </div>

        <hr />

        {/* DETAILS SECTION */}
        <div className="row">
          {/* Left */}
          <div className="col-md-6 mb-3">
            <h6 className="text-secondary">Visitor Details</h6>

            <p>
              <strong>Has Children:</strong>{" "}
              {visitor.hasChildrenInSchool ? "Yes" : "No"}
            </p>

            {visitor.banStatus?.isVisitorBanned && (
              <div className="text-danger">
                <p>
                  <strong>Reason:</strong> {visitor.banStatus.reason}
                </p>
                <p>
                  <strong>Banned On:</strong>{" "}
                  {new Date(visitor.banStatus.bannedOn).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="col-md-6 mb-3">
            {visitor.hasChildrenInSchool &&
              visitor.visitorChildren.length > 0 && (
                <>
                  <h6 className="text-secondary">Children</h6>

                  <ul className="list-group">
                    {visitor.visitorChildren.map((child, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <span>{child.name}</span>
                        <span className="badge bg-primary">
                          Std {child.standard}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
          </div>
        </div>

        <hr />

        {/* ACTION BUTTONS */}
        <div className="d-flex justify-content-between flex-wrap gap-2">
          <button className="btn btn-primary px-4" onClick={handleNavigation}>
            📄 View Visiting Record
          </button>

          <button
            className="btn btn-warning px-4"
            onClick={() => navigate(`/update-visitor-profile/${id}`)}
          >
            ✏️ Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisitorProfile;

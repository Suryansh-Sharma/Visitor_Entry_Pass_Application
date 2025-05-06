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
    <div>
      <div className="m-2 d-flex">
        <button className="btn btn-outline-dark" onClick={() => {
          navigate(-1);
        }}>Go Back</button>
      </div>
      <div className="container mt-5">
        <Card className=" shadow-lg border-0 rounded-lg overflow-hidden">
          <div className="row no-gutters">
            {/* Image Section */}
            <div className="col-md-4">
              <Card.Img
                variant="top"
                src={`http://localhost:8080/api/v1/file/image-by-name/${visitor.visitorImage}`}
                alt="Visitor Image"
                className="img-fluid rounded-circle p-3"
              />
            </div>

            {/* Content Section */}
            <div className="col-md-8">
              <Card.Body className="p-4">
                <Card.Title className="h3 font-weight-bold text-dark mb-3">
                  {visitor.visitorName}
                </Card.Title>

                {/* Contact Info */}
                <Card.Text className="text-muted mb-2">
                  <strong>Contact:</strong> {visitor.visitorContact}
                </Card.Text>

                {/* Address Info */}
                <Card.Text className="text-muted mb-2">
                  <strong>Address:</strong> {visitor.visitorAddress.line1},{" "}
                  {visitor.visitorAddress.city} -{" "}
                  {visitor.visitorAddress.pinCode}
                </Card.Text>

                {/* Ban Status Info */}
                {visitor.banStatus != null &&
                  visitor.banStatus.isVisitorBanned && (
                    <Card.Text className="text-danger mb-2">
                      <strong>Status:</strong> Banned (
                      {visitor.banStatus.reason})
                      <br />
                      <strong>Banned On:</strong>{" "}
                      {new Date(
                        visitor.banStatus.bannedOn
                      ).toLocaleDateString()}
                    </Card.Text>
                  )}

                {/* Has Children in School */}
                <Card.Text className="text-muted mb-3">
                  <strong>Has Children in School:</strong>{" "}
                  {visitor.hasChildrenInSchool ? "Yes" : "No"}
                </Card.Text>

                {/* Visitor Children Details (If any) */}
                {visitor.hasChildrenInSchool &&
                  visitor.visitorChildren.length > 0 && (
                    <div>
                      <strong>Children:</strong>
                      <ul className="list-unstyled">
                        {visitor.visitorChildren.map((child, index) => (
                          <li key={index} className="text-muted">
                            {child.name} - Standard {child.standard}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* View Details Button */}
                <div className="d-flex flex-row justify-content-between">
                  <button
                    variant="primary"
                    className="btn btn-primary btn-lg px-4 py-2 mt-3"
                    onClick={handleNavigation}
                  >
                    View Visiting Record
                  </button>

                  <button
                    variant="primary"
                    className="btn btn-warning btn-lg px-4 py-2 mt-3"
                    onClick={() => {
                      navigate(`/update-visitor-profile/${id}`);
                    }}
                  >
                    Update Profile
                  </button>
                </div>
              </Card.Body>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default VisitorProfile;

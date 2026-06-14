import { useQuery } from "@apollo/client";
import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import "../css/AllVisit.css";
import { GET_VISIT_ON_SPECIFIC_DATE } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import NoDataImg from "../assets/no-data.png"; //

function AllVisitPage({ pageTitle }) {
  const { ReactBaseUrl } = useContext(VisitorEntryPassContext);
  const today = new Date().toISOString().split("T")[0];
  const { date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const page_size = parseInt(queryParams.get("page_size")) || 8;
  const page_no = parseInt(queryParams.get("page_no")) || 0;
  const sort_by = queryParams.get("sort_by") || "visitedOn";
  const sort_order = queryParams.get("sort_order") || "DESC";

  const [searchDate, setSearchDate] = useState(date || "");
  const [finalDate, setFinalDate] = useState(date || "");

  // ✅ FETCH DATA FIRST
  const { data, loading, error, refetch } = useQuery(
    GET_VISIT_ON_SPECIFIC_DATE,
    {
      variables: {
        date: finalDate,
        sortBy: sort_by,
        pageSize: page_size,
        pageNumber: page_no,
        sortOrder: sort_order,
      },
      fetchPolicy: "network-only",
    },
  );

  // ✅ SAFE RESULT
  const result = data?.getVisitorOnSpecificDate || {
    pageNo: 0,
    pageSize: 0,
    data: [],
    totalData: 0,
    totalPages: 0,
  };

  // ✅ LOCAL STATE (REAL-TIME CONTROL)
  const [liveResult, setLiveResult] = useState(result);

  useEffect(() => {
    const newData = data?.getVisitorOnSpecificDate;

    if (!newData) return;

    setLiveResult((prev) => {
      // prevent unnecessary re-render
      if (JSON.stringify(prev) === JSON.stringify(newData)) {
        return prev;
      }
      return newData;
    });
  }, [data]);

  // ✅ Handle URL date change
  useEffect(() => {
    if (date) {
      setFinalDate(date);
      document.title = `${date} - All Visits`;
    }
  }, [date]);

  // ✅ WEBSOCKET (REAL-TIME UPDATE)
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),

      onConnect: () => {
        client.subscribe("/topic/visits", (msg) => {
          const update = JSON.parse(msg.body);

          console.log("Live Update:", update);

          setLiveResult((prev) => {
            if (!prev?.data) return prev;

            const exists = prev.data.find((v) => v.visitId === update.visitId);

            // ✅ Only update visible data
            if (!exists) {
              console.log(
                "Visit not found to update after web socket response ",
                update.visitId,
              );
              return prev;
            }

            return {
              ...prev,
              data: prev.data.map((v) =>
                v.visitId === update.visitId ? { ...v, ...update } : v,
              ),
            };
          });
        });
      },
    });

    client.activate();

    return () => client.deactivate();
  }, []);

  // ✅ HANDLERS
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 0 || pageNumber >= liveResult.totalPages) return;

    const params = new URLSearchParams({
      page_no: pageNumber,
      page_size,
      sort_by,
      sort_order,
    });

    navigate(`/visits-by-date/${finalDate}?${params}`);

    refetch({
      date: finalDate,
      pageNumber,
      pageSize: page_size,
      sortBy: sort_by,
      sortOrder: sort_order,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDateSubmit = (e) => {
    e.preventDefault();
    if (searchDate) {
      navigate(
        `/visits-by-date/${searchDate}?page_no=0&page_size=${page_size}`,
      );
    }
  };

  const formatDate = (isoDateStr) => {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date(isoDateStr));
  };

  const handleDateChange = (event) => {
    setSearchDate(event.target.value);
  };

  // ✅ STATES
  if (error) {
    console.log(error);
    return null;
  }

  if (loading) {
    return <LoadingPage />;
  }
  return (
    <div>
      {/* Search Form */}
      <form className=" align-items-end m-3">
        <div className="col-md-3">
          <label htmlFor="dateInput">Select Date</label>
          <input
            type="date"
            id="dateInput"
            className="form-control"
            value={searchDate}
            max={today}
            onChange={handleDateChange} // updates searchDate only
          />
        </div>

        <div className="col-md-2">
          <button
            type="button"
            onClick={handleDateSubmit}
            className="btn btn-success w-100"
          >
            Search
          </button>
        </div>
      </form>

      {/* No Data UI */}
      {liveResult.data.length === 0 ? (
        <div className="no-data-container">
          <div className="no-data-card">
            <span className="no-data-message">
              No Data Found for Date:{" "}
              <span className="date-highlight">{date}</span>
            </span>

            <div className="no-data-image-container">
              <img src={NoDataImg} alt="No Data" className="no-data-image" />
            </div>

            <p className="no-data-text">
              Please check the date or try again later.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Result Info */}
          <div className="resultContainer">
            <div className="entriesCard">
              <span className="totalEntriesLabel">Total Entries:</span>
              <span className="totalEntriesValue">{liveResult.totalData}</span>
            </div>

            {/* Table */}
            <div className="container mt-4 mb-5">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-0 py-4 px-4">
                  <h5 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-people-fill text-primary me-2"></i>
                    Visitor Logs
                  </h5>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 custom-table">
                    <thead className="bg-light">
                      <tr>
                        <th>Visitor Details</th>
                        <th>Host</th>
                        <th>Reason</th>
                        <th>Visited On</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {liveResult.data.map((visit) => {
                        const getStatusBadge = (status) => {
                          switch (status?.toUpperCase()) {
                            case "APPROVED":
                              return "bg-success-subtle text-success border border-success-subtle";
                            case "PENDING":
                              return "bg-warning-subtle text-warning border border-warning-subtle";
                            case "REJECTED":
                              return "bg-danger-subtle text-danger border border-danger-subtle";
                            default:
                              return "bg-secondary-subtle text-secondary border border-secondary-subtle";
                          }
                        };

                        return (
                          <tr key={visit.id}>
                            <td>
                              <div className="d-flex flex-column">
                                <Link
                                  className="fw-bold text-dark mb-1"
                                  to={`${ReactBaseUrl}visitor-profile/${visit.visitorInfo.id}`}
                                >
                                  {visit.visitorInfo.visitorName}
                                </Link>

                                <span className="text-muted small">
                                  <i className="bi bi-telephone-fill me-2"></i>
                                  {visit.visitorInfo.visitorContact}
                                </span>
                              </div>
                            </td>

                            <td>{visit.visitorHost}</td>

                            <td className="text-muted small">{visit.reason}</td>

                            <td>{formatDate(visit.visitedOn)}</td>

                            <td className="text-center">
                              <span
                                className={`badge rounded-pill px-3 py-2 ${getStatusBadge(
                                  visit.status,
                                )}`}
                              >
                                {visit.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <hr />

          <div className="paginationContainer">
            <button
              className="paginationButton"
              disabled={liveResult.pageNo === 0}
              onClick={() => handlePageChange(liveResult.pageNo - 1)}
            >
              Previous
            </button>

            {[...Array(liveResult.totalPages).keys()].map((page) => (
              <button
                key={page}
                className={`pageNumberButton ${
                  liveResult.pageNo === page ? "activePage" : "inactivePage"
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page + 1}
              </button>
            ))}

            <button
              className="paginationButton"
              disabled={liveResult.pageNo + 1 === liveResult.totalPages}
              onClick={() => handlePageChange(liveResult.pageNo + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AllVisitPage;

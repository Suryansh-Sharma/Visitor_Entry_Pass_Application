import { useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import "../css/AllVisit.css";
import { GET_VISIT_ON_SPECIFIC_DATE } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";
import ProfileCard from "./ProfileCard";

const NoDataImg = require('../assets/NoDataImg.png');

function AllVisitPage({ pageTitle }) {
  const { date } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const today = new Date().toISOString().split("T")[0];

  const [searchQuery, SetSearchQuery] = useState({
    page_size: parseInt(queryParams.get("page_size")) || 8,
    page_no: parseInt(queryParams.get("page_no")) || 0,
    sort_by: queryParams.get("sort_by") || "visitedOn",
    sort_order: queryParams.get("sort_order") || "DESC",
  });

  const navigate = useNavigate();

  const [getVisitorOnSpecificDateApi, { loading }] = useLazyQuery(
    GET_VISIT_ON_SPECIFIC_DATE,
    {
      fetchPolicy: "cache-first",
    }
  );

  const [result, SetResult] = useState({
    pageNo: 0,
    pageSize: 0,
    data: [],
    totalData: 0,
    totalPages: 0,
  });

  useEffect(() => {
    // console.log(__dirname);
    document.title = `${date}-All Visit's`;
    handleFetchData();
    // alert()
  }, [date, searchQuery]);

  const handleFetchData = async () => {
    // console.log(date+" "+page_no+" "+page_size);
    // console.log(pagination);
    await getVisitorOnSpecificDateApi({
      variables: {
        date: date,
        sortBy: searchQuery.sort_by,   
        pageSize: searchQuery.page_size,
        pageNumber: searchQuery.page_no,
        sortOrder: searchQuery.sort_order,
      },
    })
      .then((response) => {
        SetResult(response.data.getVisitorOnSpecificDate);
      })
      .catch((e) => {
        console.log(e);
      })
      .then(() => {});
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < result.totalPages) {
      SetSearchQuery((prev) => ({
        ...prev,
        page_no: pageNumber,
      }));
      const queryParams = new URLSearchParams({
        page_no: pageNumber,
        page_size: searchQuery.page_size,
        sort_by: searchQuery.sort_by,
        sort_order: searchQuery.sort_order,
      });
      navigate(`/visits-by-date/${date}?${queryParams}`, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDateChange = (event) => {
    const {value } = event.target;
    if (value === "") {
      return;
    }
    SetSearchQuery((prev)=>({
      ...prev,
      page_no:0
    }))
    const queryParams = new URLSearchParams({
      page_no: 0,
      page_size: searchQuery.page_size,
      sort_by: searchQuery.sort_by,
      sort_order: searchQuery.sort_order,
    });

    navigate(`/visits-by-date/${value}?${queryParams}`, { replace: true });
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (result.data.length === 0) {
    return (
      <div>
        <div className="m-3 col-md-2">
          <label className="form-label">Select a Date</label>
          <input
            type="date"
            className="form-control"
            id="dateInput"
            value={date}
            name="dateInput"
            max={today}
            onChange={handleDateChange}
          />
        </div>

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
      </div>
    );
  }

  return (
    <div>
      {/* Date Input Section */}
      <div className="datePickerContainer">
        <label className="formLabel">Select a Date</label>
        <input
          type="date"
          className="formControl"
          id="dateInput"
          value={date}
          name="dateInput"
          max={today}
          onChange={handleDateChange}
        />
      </div>

      {/* Result Information */}
      <div className="resultContainer">
        <div className="entriesCard">
          <span className="totalEntriesLabel">Total Entries:</span>
          <span className="totalEntriesValue">{result.totalData}</span>
        </div>

        <div className="gridContainer">
          {result.data.map((visit) => (
            <ProfileCard
              key={visit.id}
              id={visit.visitorInfo.id}
              name={visit.visitorInfo.visitorName}
              time={visit.visitedOn}
              visitorContact={visit.visitorInfo.visitorContact}
              host={visit.visitorHost}
              status={visit.status}
              reason={visit.reason}
              image={`${visit.visitorInfo.visitorImage}`}
            />
          ))}
        </div>
      </div>

      {/* Pagination Section */}
      <hr />
      <div className="paginationContainer">
        {/* Previous Button */}
        <button
          className="paginationButton"
          disabled={result.pageNo === 0}
          onClick={() => handlePageChange(result.pageNo - 1)}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {[...Array(result.totalPages).keys()].map((page) => (
          <button
            key={page + 1}
            className={`pageNumberButton ${
              result.pageNo === page ? "activePage" : "inactivePage"
            }`}
            onClick={() => handlePageChange(page)}
          >
            {page + 1}
          </button>
        ))}

        {/* Next Button */}
        <button
          className="paginationButton"
          disabled={
            result.pageNo + 1 === result.totalPages || result.totalData === 0
          }
          onClick={() => handlePageChange(result.pageNo + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AllVisitPage;

import { useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Button, Card, Dropdown } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { SEARCH_VISITOR } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";
import "../css/Common.css"
import  defaultImage from "../assets/User_Icon.png";
function SearchPage() {
  const { target, filterKey, filterValue } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [searchVisitorApi, { loading }] = useLazyQuery(SEARCH_VISITOR, {
    fetchPolicy: "cache-first",
  });

  const [result, setRes] = useState({
    pageNo: 0,
    pageSize: 10,
    data: [],
    totalPages: 0,
    totalData: 0,
  });

  const [isPageLoading, setisPageLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState({
    pageSize: parseInt(queryParams.get("page_size")) || 8,
    sortBy: queryParams.get("sort_by") || "Name",
    sortDir: queryParams.get("sort_dir") || "ASC",
    filterKey: filterKey || "name",
    filterValue: filterValue,
  });
  let  page_no = parseInt(queryParams.get("page_no")) || 0

  useEffect(() => {
    setisPageLoading(true);

    document.title = "Search Visitor";

    if (searchQuery.filterValue === "none") {
      setSearchQuery((prevData) => ({
        ...prevData,
        filterValue: "",
      }));
    }
    fetchApi();
    setisPageLoading(false);
  }, [filterKey, filterValue, page_no]);

  const handleDropdownChange = (event) => {
    setSearchQuery((prevData) => ({
      ...prevData,
      filterValue: "none",
      filterKey: event,
    }));
    const queryParams = new URLSearchParams({
      page_no: page_no,
      page_size: searchQuery.pageSize,
      sort_by: searchQuery.sortBy,
      sort_dir: searchQuery.sortDir,
    });
    handleNavigation(queryParams, event, "none");
  };

  const handleChangeData = (event) => {
    const { name, value } = event.target;
    setSearchQuery((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSearchBtn = async () => {
    if (searchQuery.filterValue === "") {
      setisPageLoading(false);

      return;
    }
    const queryParams = new URLSearchParams({
      page_no: page_no,
      page_size: searchQuery.pageSize,
      sort_by: searchQuery.sortBy,
      sort_dir: searchQuery.sortDir,
    });
    handleNavigation(queryParams, filterKey, searchQuery.filterValue);
  };

  const fetchApi = async () => {
    if (
      searchQuery.filterValue.length === 0 ||
      searchQuery.filterValue === "none"
    ) {
      return;
    }
    if(searchQuery.sortDir!=="ASC" && searchQuery.sortDir!=="DESC"){
      alert("Wrong Sort Order. Use only ASC or DESC");
      return;
    }

    const filters = [];
    filters.push({
      key: searchQuery.filterKey,
      value: searchQuery.filterValue,
    });
    const response = await searchVisitorApi({
      variables: {
        filters: filters,
        pageSize: searchQuery.pageSize,
        pageNumber: page_no,
        sort_by: searchQuery.sortBy,
        sort_order: searchQuery.sortDir
      },
    });
    const error = response.error;
    if (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      navigate("/");
      return;
    }
    const data = response.data;
    if (data) {
      setRes(data.searchVisitor);
    }
  };

  const handleNavigation = (queryParams, filterKey, filterValue) => {
    navigate(
      `/search/${target}/${filterKey}/${
        filterValue || "none"
      }?${queryParams.toString()}`
    );
  };
  const handlePageChange = (value) => {
    page_no = value
    const queryParams = new URLSearchParams({
      page_no: page_no,
      page_size: searchQuery.pageSize,
      sort_by: searchQuery.sortBy,
      sort_dir: searchQuery.sortDir,
    });
    
    navigate(
      `/search/${target}/${filterKey}/${
        filterValue || "none"
      }?${queryParams.toString()}`
      ,{replace:true});
  };

  const viewVisitorProfile=(id)=>{
    navigate(`/visitor-profile/${id}`)
  }

  if (loading || isPageLoading) return <LoadingPage />;
  return (
    <>
      <div className="search-container">
        {/* Dropdown Field Selector */}
        <div className="dropdown-container">
          <Dropdown onSelect={handleDropdownChange}>
            <Dropdown.Toggle
              variant="outline-secondary"
              className="dropdown-toggle"
            >
              {filterKey}
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu">
              {["Name", "Contact", "Address", "ChildName"].map((variant, key) => (
                <Dropdown.Item key={key} eventKey={variant}>
                  {variant}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Search Input and Button */}
        <div className="search-input-container">
          {/* Search Input */}
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder={`Search by ${searchQuery.filterKey}`}
              value={searchQuery.filterValue}
              name="filterValue"
              onChange={handleChangeData}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchBtn();
                }
              }}
            />
          </div>

          {/* Search Button */}
          <Button
            variant="outline-success"
            size="lg"
            className="search-button"
            onClick={handleSearchBtn}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Result section */}
      {result.data.length > 0 ? (
        <div className="result-container">
          <div className="total-records">
            <span className="total-label">Total Record:- </span>
            <span>{result.totalData}</span>
          </div>
          <div className="card-grid">
            {result.data.map((visitor, key) => (
              <div className="card-item" key={key}>
                <Card className="visitor-card">
                  <Card.Img
                    variant="top"
                    src={visitor.visitorImage ?
                      `http://localhost:8080/api/v1/file/image-by-name/${visitor.visitorImage}`
                      :defaultImage
                    }
                    alt="Visitor Image"
                    className="visitor-image"
                  />
                  <Card.Body>
                    <Card.Title>{visitor.visitorName}</Card.Title>
                    <Card.Text>
                      <strong>Contact:</strong> {visitor.visitorContact}
                    </Card.Text>
                    <Card.Text>
                      <strong>Address:</strong> {visitor.visitorAddress.line1.substring(0,12)}, {visitor.visitorAddress.city}
                    </Card.Text>
                    <Card.Text>
                      <strong>Status:</strong>
                      {visitor.banStatus ? (
                        <span className="text-danger">
                          Banned on {visitor.banStatus.bannedOn}
                        </span>
                      ) : (
                        <span className="text-success">Active</span>
                      )}
                    </Card.Text>
                    <button className="view-details-btn" onClick={() => viewVisitorProfile(visitor.id)}>
                      View Details
                    </button>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            {/* Previous Button */}
            <button
              className="pagination-btn"
              disabled={result.pageNo === 0}
              onClick={() => handlePageChange(result.pageNo - 1)}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {[...Array(result.totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                className={`page-number-btn ${result.pageNo === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page + 1}
              </button>
            ))}

            {/* Next Button */}
            <button
              className="pagination-btn"
              disabled={result.pageNo + 1 === result.totalPages || result.totalData === 0}
              onClick={() => handlePageChange(result.pageNo + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default SearchPage;

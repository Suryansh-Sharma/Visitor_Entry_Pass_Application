import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import "../css/Common.css";
import { GET_VISITS_OF_VISITOR } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";

function VisitsOfVisitor() {
  const { query } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const visitorId = query;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState({
    pageSize: parseInt(queryParams.get("page_size")) || 15,
    pageNo: parseInt(queryParams.get("page_no")) || 0,
    sortBy: queryParams.get("sort_by") || "visitedOn",
    sortOrder: queryParams.get("sort_order") || "ASC",
  });

  const [FetchVisitOfVisitor, { loading }] = useLazyQuery(
    GET_VISITS_OF_VISITOR,
    {
      fetchPolicy: "cache-first",
    }
  );

  const [result, setRes] = useState({
    pageNo: 0,
    pageSize: 10,
    data: [],
    totalPages: 0,
    totalData: 0,
  });

  useEffect(() => {
    fetchData();
    document.title=`All Visit's Of ${visitorId}`;
  }, [searchQuery.pageNo, searchQuery]);

  const formatDate = (isoDateStr) => {
    if (!isoDateStr) {
      return "";
    }
    const date = new Date(isoDateStr);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(date);
  };
  const handlePageChange = (page) => {
    setSearchQuery((prev) => ({
      ...prev,
      pageNo: page,
    }));

    // Update the query parameters in the URL
    const queryParams = new URLSearchParams({
      page_no: page,
      page_size: searchQuery.pageSize,
      sort_by: searchQuery.sortBy,
      sort_dir: searchQuery.sortOrder,
    });

    navigate(`/visits-of-visitor/${visitorId}?${queryParams.toString()}`,{replace:true});
  };

  const handleSortByChange = (event) => {
    setSearchQuery((prev) => ({
      ...prev,
      sortBy: event.target.value,
    }));
    const queryParams = new URLSearchParams({
      page_no: searchQuery.pageNo,
      page_size: searchQuery.pageSize,
      sort_by: event.target.value,
      sort_dir: searchQuery.sortOrder,
    });

    navigate(`/visits-of-visitor/${visitorId}?${queryParams.toString()}`,{replace:true});
  };

  const handleSortDireChange = (event) => {
    setSearchQuery((prev) => ({
      ...prev,
      sortOrder: event.target.value,
    }));
    const queryParams = new URLSearchParams({
      page_no: searchQuery.pageNo,
      page_size: searchQuery.pageSize,
      sort_by: searchQuery.sortBy,
      sort_dir: event.target.value,
    });

    navigate(`/visits-of-visitor/${visitorId}?${queryParams.toString()}`,{replace:true});
  };

  const fetchData = async () => {
    console.log(searchQuery);
    const response = await FetchVisitOfVisitor({
      variables: {
        id: visitorId,
        page_size: searchQuery.pageSize,
        page_number: searchQuery.pageNo,
        sort_by: searchQuery.sortBy,
        sort_order: searchQuery.sortOrder,
      },
    });
    // console.log(response);
    const err = response.error;
    if (err) {
      console.log(err);
      alert("");
    }
    const data = response.data;
    if (data) {
      setRes(data.getVisitOfVisitor);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (result.data.length == 0) {
    return <div></div>;
  }

  return (
    <div className="mt-3">
      <div className="d-flex">
        <button className="btn btn-outline-dark" onClick={() => {
          navigate(-1);
        }}>Go Back</button>
      </div>
      <div className="flex items-center justify-center mt-2">
        <div>
          <span className="font-semibold">Total Visits Record:- </span>
          <span>{result.totalData}</span>
        </div>
      </div>


      <div className="SortSection">
        <div className="card ">
          <div className="card-body">
            <h5 className="card-title">Sort By</h5>

            <div
              className="btn-group"
              role="group"
              aria-label="Sort By radio toggle button group"
            >
              {/* Visited On option */}
              <input
                type="radio"
                className="btn btn-outline-primary"
                name="sortBy"
                id="btnradio1"
                value="visitedOn"
                checked={searchQuery.sortBy === "visitedOn"}
                onChange={handleSortByChange}
                autoComplete="off"
              />
              <label className=" p-3 text-center" htmlFor="btnradio1">
                <i className="bi bi-calendar-event me-2"></i> Visited On
              </label>

              {/* Host option */}
              <input
                type="radio"
                className="btn btn-outline-primary"
                name="sortBy"
                id="btnradio2"
                value="visitorHost"
                checked={searchQuery.sortBy === "visitorHost"}
                onChange={handleSortByChange}
                autoComplete="off"
              />
              <label className=" p-3 text-center" htmlFor="btnradio2">
                <i className="bi bi-person-circle me-2"></i> Host
              </label>
            </div>
          </div>
        </div>

        <div className="card ">
          <div className="card-body">
            <h5 className="card-title">Sort By</h5>

            <div
              className="btn-group"
              role="group"
              aria-label="Sort By radio toggle button group"
            >
              {/* Visited On option */}
              <input
                type="radio"
                className="btn btn-outline-primary"
                name="sortDir"
                id="btnradio3"
                value="ASC"
                checked={searchQuery.sortOrder === "ASC"}
                onChange={handleSortDireChange}
                autoComplete="off"
              />
              <label className=" p-3 text-center" htmlFor="btnradio3">
                <i className="bi bi-calendar-event me-2"></i> ASC
              </label>

              {/* Host option */}
              <input
                type="radio"
                className="btn btn-outline-primary"
                name="sortDir"
                id="btnradio4"
                value="DESC"
                checked={searchQuery.sortOrder === "DESC"}
                onChange={handleSortDireChange}
                autoComplete="off"
              />
              <label className=" p-3 text-center" htmlFor="btnradio4">
                <i className="bi bi-person-circle me-2"></i> DESC
              </label>
            </div>
          </div>
        </div>
      </div>
      <br />
      <hr />
      <br />
      <div className="ResultDataSection ">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Visited On</th>
              <th scope="col">Host</th>
              <th scope="col">Status</th>
              <th scope="col">Reason</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((visit, key) => (
              <tr key={key}>
                <th>{result.pageNo * result.pageSize + key + 1}</th>
                <td scope="">{formatDate(visit.visitedOn)}</td>
                <td>{visit.visitorHost}</td>
                <td>{visit.status}</td>
                <td>{visit.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
  );
}
export default VisitsOfVisitor;

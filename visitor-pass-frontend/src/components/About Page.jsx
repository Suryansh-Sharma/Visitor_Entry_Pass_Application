import React, { useEffect } from "react";
import { useNavigate } from "react-router";

function AboutPage() {
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  useEffect(()=>{
    document.title="About Application"
  },[])

  const navigateTo=(path)=>{
    navigate(path);
  }

  return (
    <div className="container-fluid bg-light py-5">
      {/* Header Section */}
      <div
        className="text-white text-center py-5"
        style={{ backgroundColor: "#6B5B95" }}
      >
        <h1 className="display-4">About This App</h1>
        <p className="text-white">
          A modern solution for visitor management, built with passion and
          precision.
        </p>
      </div>
      <br />
      <div className="container my-4">
        <h2 className="text-center mb-4">Quick Links</h2>
        <div className="d-flex justify-content-around flex-wrap">
          <span 
            onClick={()=>navigateTo(`/visits-by-date/${today}?page_no=0&page_size=8&sort_by=visitedOn&sort_order=ASC`)}
            className="btn btn-outline-primary btn-lg m-2"
          >
            <i className="bi bi-calendar-check me-2"></i> Today's Visits
          </span>
          <span onClick={()=>navigateTo("/add-visit")} className="btn btn-outline-success btn-lg m-2">
            <i className="bi bi-person-plus me-2"></i> Add New Visit
          </span>
          <span onClick={()=>navigateTo("/search/visitor/Name/none?page_no=0&page_size=8&sort_by=visitorName&sort_dir=ASC")} className="btn btn-outline-info btn-lg m-2">
            <i className="bi bi-search me-2"></i> Search Visitor
          </span>
          <span onClick={()=>navigateTo("/telegramId")} className="btn btn-outline-info btn-lg m-2">
            <i className="bi bi-search me-2"></i> Telegram Id's
          </span>
        </div>
      </div>

      {/* App Description Section */}
      <div className="container my-5">
        <h2 className="text-center mb-4">App Description</h2>
        <p className="text-muted text-center">
          This app simplifies visitor management with features like seamless
          registration, search, and history tracking. Leveraging modern
          technologies like Java Spring Boot, React JS, MongoDB, and Electron, it
          ensures efficiency and scalability, making it perfect for schools and
          offices.
        </p>
      </div>

      {/* Features Section */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Key Features</h2>
        <div className="row text-center">
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Visitor Registration</h5>
                <p className="card-text text-muted">
                  Quickly register new visitors with an intuitive interface.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Search & Lookup</h5>
                <p className="card-text text-muted">
                  Easily search for visitors and retrieve their visit history.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Various Platform Support</h5>
                <p className="card-text text-muted">
                  This can be run on Linux, Windows, Web.
                </p>
              </div>
            </div>
          </div>
        </div>
        <br />
        <div className="row text-center">
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Visit History</h5>
                <p className="card-text text-muted">
                  Analyze visitor records for better management.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Telegram Bot</h5>
                <p className="card-text text-muted">
                  Telegram bot to handle info & status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer
        className="text-white text-center py-4"
        style={{ backgroundColor: "#ffc196" }}
      >
        <p className="mb-0">
          Developed ❤️ by <strong>Suryansh</strong>
        </p>
        <p className="mb-0">
          Email <strong>suryanshsharma1942@gmail.com</strong>
        </p>
      </footer>
    </div>
  );
}

export default AboutPage;

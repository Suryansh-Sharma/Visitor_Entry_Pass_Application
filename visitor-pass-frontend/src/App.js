import React, { useContext, useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import "bootstrap/dist/css/bootstrap.min.css";
import "react-calendar/dist/Calendar.css";
import "react-toastify/dist/ReactToastify.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import AboutPage from "./components/About Page.jsx";
import AddVisit from "./components/AddVisit";
import AllVisitPage from "./components/AllVisitPage";
import Header from "./components/Header";
import LoadingPage from "./components/LoadingPage";
import SearchPage from "./components/SearchPage";
import LoginPage from "./components/Security/LoginPage";
import SignUp from "./components/SignUp.jsx";
import TelegramIds from "./components/TelegramIds.jsx";
import UpdateVisitorProfile from "./components/UpdateVisitorProfile";
import VisitorProfile from "./components/UserProfile";
import VisitsOfVisitor from "./components/VisitsOfVisitor.jsx";
import { VisitorEntryPassContext } from './context/VisitorEntryPassContext.jsx';
import PrivateRoute from './components/Security/PrivateRoute.jsx';
function App() {
  const {setIsLogin, setUserInfo, getUserInfo } =
    useContext(VisitorEntryPassContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const res = getUserInfo();
    if (res !== null) {
      setUserInfo(res);
      setIsLogin(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="MainApp">
      <ToastContainer />
      <HashRouter>
        <Header />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<AboutPage />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="visits-by-date/:date"
            element={
              <PrivateRoute>
                <AllVisitPage pageTitle="All Visit " />
              </PrivateRoute>
            }
          />
          <Route
            path="add-visit"
            element={
              <PrivateRoute>
                <AddVisit />
              </PrivateRoute>
            }
          />
          <Route
            path="update-visitor-profile/:id"
            element={
              <PrivateRoute>
                <UpdateVisitorProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="search/:target/:filterKey/:filterValue"
            element={
              <PrivateRoute>
                <SearchPage />
              </PrivateRoute>
            }
          />
          <Route
            path="loading"
            element={
              <PrivateRoute>
                <LoadingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="visitor-profile/:id"
            element={
              <PrivateRoute>
                <VisitorProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="visits-of-visitor/:query"
            element={
              <PrivateRoute>
                <VisitsOfVisitor />
              </PrivateRoute>
            }
          />
          <Route path="telegramId" 
            element={
              <PrivateRoute>
                <TelegramIds />
              </PrivateRoute>
            }
          />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;

import { useContext } from "react";
import "react-calendar/dist/Calendar.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import AboutPage from "./components/About Page.jsx";
import AddVisit from "./components/AddVisit.jsx";
import AllVisitPage from "./components/AllVisitPage.jsx";
import Header from "./components/Header.jsx";
import { LoadingComponent } from "./components/LoadingComponent.jsx";
import LoadingPage from "./components/LoadingPage.jsx";
import SearchPage from "./components/SearchPage.jsx";
import AccountVerificationPage from "./components/Security/AccountVerificationPage.jsx";
import LoginPage from "./components/Security/LoginPage.jsx";
import PrivateRoute from "./components/Security/PrivateRoute.jsx";
import PublicRoute from "./components/Security/PublicRoute.jsx";
import SignUp from "./components/SignUp.jsx";
import TelegramIds from "./components/TelegramIds.jsx";
import UpdateVisitorProfile from "./components/UpdateVisitorProfile.jsx";
import VisitorProfile from "./components/UserProfile.jsx";
import VisitsOfVisitor from "./components/VisitsOfVisitor.jsx";
import { VisitorEntryPassContext } from "./context/VisitorEntryPassContext.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";
import VisitsPage from "./pages/VisitsPage.jsx";

function App() {
  const { loading, userInfo } = useContext(VisitorEntryPassContext);
  if (loading) {
    return <LoadingComponent text={"Please Wait App is Loading"} />;
  }

  if (userInfo && !userInfo.isVerified) {
    <AccountVerificationPage />;
  }

  return (
    <div className="MainApp">
      <ToastContainer />
      {/* <UserWebSocket /> */}
      <HashRouter>
        <Header />
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          {/* Public routes */}
          <Route path="/" element={<AboutPage />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="sign-up"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />

          {/* Protected routes */}

          <Route
            path="all-visit"
            element={
              <PrivateRoute>
                <VisitsPage />
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
          <Route
            path="telegramId"
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

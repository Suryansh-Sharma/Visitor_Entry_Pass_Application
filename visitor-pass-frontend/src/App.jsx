import { useContext } from "react";
import "react-calendar/dist/Calendar.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import AboutPage from "./components/About Page.jsx";
import { LoadingComponent } from "./components/LoadingComponent.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";
import AccountVerificationPage from "./components/Security/AccountVerificationPage.jsx";
import LoginPage from "./components/Security/LoginPage.jsx";
import PrivateRoute from "./components/Security/PrivateRoute.jsx";
import PublicRoute from "./components/Security/PublicRoute.jsx";
import SignUp from "./components/SignUp.jsx";
import TelegramIds from "./components/TelegramIds.jsx";
import { VisitorEntryPassContext } from "./context/VisitorEntryPassContext.jsx";
import AddVisit from "./pages/AddVisitPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import UpdateVisitorInfoPage from "./pages/UpdateVisitorInfoPage.jsx";
import VisitorProfile from "./pages/VisitorProfile.jsx";
import VisitsPage from "./pages/VisitsPage.jsx";
import NavBarComponent from "./components/NavBarComponent.jsx";
import UserWebSocket from "./components/UserWebSocket.jsx";
function App() {
  const { loading, userInfo } = useContext(VisitorEntryPassContext);
  if (loading) {
    return <LoadingComponent text={"Please Wait App is Loading"} />;
  }

  if (userInfo && !userInfo.isVerified) {
    return <AccountVerificationPage />;
  }

  return (
    <div className="MainApp">
      <ToastContainer />
      {userInfo && <UserWebSocket />}
      <HashRouter>
        <NavBarComponent />
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
                <UpdateVisitorInfoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="search"
            element={
              <PrivateRoute>
                <SearchPage />
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

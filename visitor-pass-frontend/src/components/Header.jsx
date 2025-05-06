import { useApolloClient, useMutation } from "@apollo/client";
import { useContext, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { FcAbout } from "react-icons/fc";
import { GrAddCircle } from "react-icons/gr";
import { HiOutlineHome, HiOutlineMenu } from "react-icons/hi";
import { TfiReload } from "react-icons/tfi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import "../css/Navbar.css";
import { LOGOUT_USER } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";

const Header = () => {
  const [logoutUser, { loading }] = useMutation(LOGOUT_USER, {
    fetchPolicy: "no-cache",
  });
  const client = useApolloClient();
  const navigate = useNavigate();
  const { userInfo } = useContext(VisitorEntryPassContext);

  // State to control the mobile menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    const ans = window.confirm("Are you sure for logout?");
    if (ans) {
      submitLogoutApi();
    }
  };

  const submitLogoutApi = async () => {
    try {
      const token = JSON.parse(sessionStorage.getItem("jwtToken"));
      const u = JSON.parse(localStorage.getItem("userInfo"));
      const refreshToken = u?.credentials?.refreshToken?.token;
      const jwtToken = `Bearer ${token}`;
      console.log("Jwt Token", jwtToken);
      console.log("Refresh Token", refreshToken);
      await logoutUser({
        variables: {
          authorization: jwtToken,
          refreshToken: refreshToken,
        },
      });
      toast.success("See you soon !! " + userInfo.username, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      client.resetStore();
      sessionStorage.removeItem("telegramIds");
      sessionStorage.removeItem("jwtToken");
      localStorage.removeItem("userInfo");
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const formatedTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  if (userInfo == null) {
    return <div></div>;
  }
  if (loading) {
    return <LoadingPage />;
  }
  return (
    <div className="navBar">
      <div className="navBarContainer">
        {/* Left (Navigation Icons) */}
        <div className="desktopOptionNav">
          <div
            className="navItem"
            onClick={() =>
              navigate(
                `/visits-by-date/${formatedTodayDate()}?page_no=0&page_size=8&sort_by=visitedOn&sort_order=ASC`
              )
            }
          >
            <HiOutlineHome size={25} className="navIcon" />
          </div>

          <div className="navItem" onClick={() => navigate("/add-visit")}>
            <GrAddCircle size={25} className="navIcon" />
          </div>

          <div
            className="navItem"
            onClick={() =>
              navigate(
                "/search/visitor/Name/none?page_no=0&page_size=8&sort_by=visitorName&sort_dir=ASC"
              )
            }
          >
            <BsSearch size={25} className="navIcon" />
          </div>

          <div
            className="navItem"
            onClick={() => {
              window.location.reload();
            }}
          >
            <TfiReload size={25} className="navIcon" />
          </div>

          <div className="navItem" onClick={() => navigate("")}>
            <FcAbout size={25} className="navIcon" />
          </div>
        </div>

        {/* Center (Title or Branding) */}
        <div className="centerTitle">
          <span>Visitor Management</span>
        </div>

        {/* Right (User Info and Logout) */}
        <div className="rightSection">
          <div className="userInfo">
            {userInfo ? <span>{userInfo.username}</span> : <span>Guest</span>}
            <button onClick={handleLogout} className="logoutButton">
              Logout
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="mobileMenuIcon">
            <button onClick={toggleMobileMenu}>
              <HiOutlineMenu size={25} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobileMenu">
          <div
            onClick={() =>
              navigate(
                `/visits-by-date/${formatedTodayDate()}?page_no=0&page_size=8&sort_by=visitedOn&sort_order=ASC`
              )
            }
            className="mobileMenuItem"
          >
            <HiOutlineHome size={20} />
            <span>Home</span>
          </div>
          <div
            onClick={() => navigate("/add-visit")}
            className="mobileMenuItem"
          >
            <GrAddCircle size={20} />
            <span>Add Visit</span>
          </div>
          <div
            onClick={() =>
              navigate(
                "/search/visitor/Name/none?page_no=0&page_size=8&sort_by=visitorName&sort_dir=ASC"
              )
            }
            className="mobileMenuItem"
          >
            <BsSearch size={20} />
            <span>Search</span>
          </div>

          <div className="userInfo">
            {userInfo ? <span>{userInfo.username}</span> : <span>Guest</span>}
            <button onClick={handleLogout} className="logoutButton">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;

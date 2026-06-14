import React, { useContext } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate, useLocation } from "react-router";
import { Dropdown, Menu, Button, Avatar, Typography, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  SearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import { LOGOUT_USER } from "../graphQl/queries";
import LoadingPage from "./LoadingPage";

const { Text } = Typography;

const Header = () => {
  const [logoutUser, { loading }] = useMutation(LOGOUT_USER, {
    fetchPolicy: "no-cache",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useContext(VisitorEntryPassContext);

  if (userInfo == null) return null;
  if (loading) return <LoadingPage />;

  const formatedTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleLogout = () => {
    const ans = window.confirm("Are you sure you want to log out?");
    if (ans) {
      submitLogoutApi();
    }
  };

  const submitLogoutApi = async () => {
    try {
      const jwtToken = userInfo.credentials?.jwtToken?.token;
      const refreshToken = userInfo.credentials?.refreshToken?.token;

      await logoutUser({
        variables: {
          authorization: `Bearer ${jwtToken}`,
          refreshToken: refreshToken,
        },
      });

      toast.success(`Logged out successfully`, { position: "top-right" });
      logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed.");
    }
  };

  const searchPath =
    "/search/visitor/Name/none?page_no=0&page_size=8&sort_by=visitorName&sort_dir=ASC";

  // Check if user is currently sitting on the main dashboard screen
  const isDashboard =
    location.pathname.includes("/visits-by-date") || location.pathname === "/";

  const userDropdownMenu = (
    <Menu className="rounded-xl p-1 shadow-lg border border-slate-100 min-w-[150px]">
      <Menu.Item
        key="username"
        disabled
        className="!text-slate-700 font-medium border-b border-slate-100 pb-2"
      >
        {userInfo.username}
      </Menu.Item>
      <Menu.Item
        key="logout"
        danger
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        className="rounded-lg mt-1"
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white select-none unique-electron-header">
      <div className="mx-auto flex h-12 items-center justify-between px-4">
        {/* LEFT SECTION: Back Button & Title */}
        <div className="flex items-center gap-3">
          {!isDashboard ? (
            <Tooltip title="Go Back" placement="bottom">
              <Button
                type="text"
                icon={<ArrowLeftOutlined className="text-sm text-slate-600" />}
                onClick={() => navigate(-1)} // Native structural history rollback
                className="flex items-center justify-center rounded-lg h-8 w-8 hover:bg-slate-100"
              />
            </Tooltip>
          ) : (
            // Small subtle App branding icon instead when on home root
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <UserOutlined className="text-xs font-bold" />
            </div>
          )}

          <span className="text-sm font-bold text-slate-800 tracking-tight">
            Visitor Entry Pass System
          </span>
        </div>

        {/* RIGHT SECTION: Compact Desktop Action Icons & Profile */}
        <div className="flex items-center gap-1.5">
          <Tooltip title="Add New Visit" placement="bottom">
            <Button
              type="text"
              icon={
                <UserAddOutlined
                  className={
                    location.pathname === "/add-visit"
                      ? "text-blue-600"
                      : "text-slate-500"
                  }
                />
              }
              onClick={() => navigate("/add-visit")}
              className={`h-8 w-8 p-0 rounded-lg flex items-center justify-center ${location.pathname === "/add-visit" ? "bg-blue-50" : "hover:bg-slate-100"}`}
            />
          </Tooltip>

          <Tooltip title="Search Records" placement="bottom">
            <Button
              type="text"
              icon={
                <SearchOutlined
                  className={
                    location.pathname.includes("/search")
                      ? "text-blue-600"
                      : "text-slate-500"
                  }
                />
              }
              onClick={() => navigate(searchPath)}
              className={`h-8 w-8 p-0 rounded-lg flex items-center justify-center ${location.pathname.includes("/search") ? "bg-blue-50" : "hover:bg-slate-100"}`}
            />
          </Tooltip>

          <Tooltip title="Refresh" placement="bottom">
            <Button
              type="text"
              icon={<ReloadOutlined className="text-slate-500" />}
              onClick={() => window.location.reload()}
              className="h-8 w-8 p-0 rounded-lg flex items-center justify-center hover:bg-slate-100"
            />
          </Tooltip>

          <Tooltip title="About System" placement="bottom">
            <Button
              type="text"
              icon={
                <InfoCircleOutlined
                  className={
                    location.pathname === "/about"
                      ? "text-blue-600"
                      : "text-slate-500"
                  }
                />
              }
              onClick={() => navigate("/about")}
              className={`h-8 w-8 p-0 rounded-lg flex items-center justify-center ${location.pathname === "/about" ? "bg-blue-50" : "hover:bg-slate-100"}`}
            />
          </Tooltip>

          {/* Divider line separating utility tools from user module */}
          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          {/* User Profile Trigger Dropdown */}
          <Dropdown
            overlay={userDropdownMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center gap-1.5 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <Avatar
                className="bg-slate-200 text-slate-700 font-semibold"
                size={22}
              >
                {userInfo.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Text className="text-xs font-semibold text-slate-600 max-w-[80px] truncate">
                {userInfo.username}
              </Text>
              <DownOutlined className="text-[8px] text-slate-400" />
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;

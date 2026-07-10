import {
  ArrowLeftOutlined,
  BankOutlined,
  HomeOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Button, Dropdown, Space, Tooltip, Typography } from "antd";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import { LOGOUT_USER } from "../graphQl/queries";

const { Text } = Typography;
const MySwal = withReactContent(Swal);

const NavBarComponent = () => {
  const navigate = useNavigate();
  const location = { pathname: useLocation().pathname }; // Localize parameter variables safely

  const { userInfo, logout } = useContext(VisitorEntryPassContext);

  const [logoutUser, { loading: isLoggingOut }] = useMutation(LOGOUT_USER, {
    fetchPolicy: "no-cache",
  });

  if (!userInfo) return null;

  // --- LOGOUT ROUTINE CONTROLLER ---
  const handleLogout = async () => {
    const confirmAction = await MySwal.fire({
      title: "Terminate Session?",
      text: "Are you sure you want to log out of the gateway registry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Log Out",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Stay Connected",
    });

    if (!confirmAction.isConfirmed) return;

    try {
      const jwtToken = userInfo.credentials?.jwtToken?.token;
      const refreshToken = userInfo.credentials?.refreshToken?.token;

      // Fires mutation pipeline network request calls
      await logoutUser({
        variables: {
          authorization: `Bearer ${jwtToken}`,
          refreshToken: refreshToken,
        },
      });

      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Server authentication termination failure:", err);
    } finally {
      // Clean local token spaces regardless of mutation state to avoid auth lockouts
      logout();
      navigate("/login");
    }
  };

  const searchPath = "/search";
  const isDashboard =
    location.pathname === "/visits-by-date" || location.pathname === "/";

  // --- MODERN ANT DESIGN MENU OPTION DECLARATIONS (v5 compatible) ---
  const dropdownMenuItems = {
    className: "rounded-xl p-1 shadow-lg border border-slate-100 min-w-[160px]",
    items: [
      {
        key: "username",
        label: (
          <div className="flex flex-col py-0.5 pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Active Operator
            </span>
            <span className="font-bold text-slate-800 text-xs mt-0.5">
              {userInfo.username}
            </span>
          </div>
        ),
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        label: "Logout",
        danger: true,
        disabled: isLoggingOut,
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md select-none unique-electron-header h-12 flex items-center">
      <div className="w-full flex items-center justify-between px-4">
        {/* LEFT COMPONENT BLOCK: HISTORY CONSOLE ROLLBACK BUTTON */}
        <div className="flex items-center gap-3">
          {!isDashboard ? (
            <Tooltip title="Go Back" placement="bottom">
              <Button
                type="text"
                icon={<ArrowLeftOutlined className="text-slate-600 text-xs" />}
                onClick={() => navigate(-1)}
                className="flex items-center justify-center rounded-lg h-8 w-8 hover:bg-slate-100"
              />
            </Tooltip>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-100">
              <UserOutlined className="text-xs" />
            </div>
          )}

          <span className="text-xs font-extrabold text-slate-800 tracking-tight uppercase">
            Visitor Entry Pass System
          </span>
        </div>

        {/* RIGHT COMPONENT BLOCK: SYSTEM SHORTCUT ACTIONS BAR */}
        <div className="flex items-center gap-1">
          <Tooltip title="Create Entry Pass" placement="bottom">
            <Button
              type="text"
              icon={
                <UserAddOutlined
                  className={
                    location.pathname === "/add-visit"
                      ? "text-blue-600"
                      : "text-slate-400 hover:text-slate-600"
                  }
                />
              }
              onClick={() => navigate("/add-visit")}
              className={`h-8 w-8 p-0 rounded-lg flex items-center justify-center ${location.pathname === "/add-visit" ? "bg-blue-50/80" : "hover:bg-slate-100"}`}
            />
          </Tooltip>

          <Tooltip title="Search Registries" placement="bottom">
            <Button
              type="text"
              icon={
                <SearchOutlined
                  className={
                    location.pathname.includes("/search")
                      ? "text-blue-600"
                      : "text-slate-400 hover:text-slate-600"
                  }
                />
              }
              onClick={() => navigate(searchPath)}
              className={`h-8 w-8 p-0 rounded-lg flex items-center justify-center ${location.pathname.includes("/search") ? "bg-blue-50/80" : "hover:bg-slate-100"}`}
            />
          </Tooltip>

          <Tooltip title="Force Synchronize App" placement="bottom">
            <Button
              type="text"
              icon={
                <ReloadOutlined className="text-slate-400 hover:text-slate-600" />
              }
              onClick={() => window.location.reload()}
              className="h-8 w-8 p-0 rounded-lg flex items-center justify-center hover:bg-slate-100"
            />
          </Tooltip>

          {userInfo.role === "ADMIN" && (
            <Tooltip title="Organization Settings" placement="bottom">
              <Button
                type="text"
                icon={
                  <BankOutlined
                    className={
                      location.pathname === "/organization"
                        ? "text-blue-600"
                        : "text-slate-400 hover:text-slate-600"
                    }
                  />
                }
                onClick={() => navigate("/organization")}
                className={`h-8 w-8 p-0 rounded-lg flex items-center justify-center ${location.pathname === "/organization" ? "bg-blue-50/80" : "hover:bg-slate-100"}`}
              />
            </Tooltip>
          )}

          <Tooltip title="System Architecture Info" placement="bottom">
            <Button
              type="text"
              icon={
                <HomeOutlined
                  className={
                    location.pathname === "/"
                      ? "text-blue-600"
                      : "text-slate-400 hover:text-slate-600"
                  }
                />
              }
              onClick={() => navigate("/")}
              className={`h-8 w-8 p-0 rounded-lg flex items-center justify-center ${location.pathname === "/" ? "bg-blue-50/80" : "hover:bg-slate-100"}`}
            />
          </Tooltip>

          <div className="h-4 w-[1px] bg-slate-200 mx-1.5" />

          {/* SYSTEM OPERATOR ACCOUNTS MATRIX DROPDOWN */}
          <Dropdown
            menu={dropdownMenuItems}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center gap-1.5 cursor-pointer pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors border border-transparent active:border-slate-200">
              <Text className="text-xs font-bold text-slate-700 max-w-[90px] truncate">
                {userInfo.username}
              </Text>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default NavBarComponent;

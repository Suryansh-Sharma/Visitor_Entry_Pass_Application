import { useQuery } from "@apollo/client";
import { createContext, useState } from "react";
import { LoadingComponent } from "../components/LoadingComponent";
import { GET_ALL_TELEGRAM_IDS, GET_ORGANIZATION } from "../graphQl/queries";

export const VisitorEntryPassContext = createContext();

const Context = ({ children }) => {
  const baseUrl = "http://localhost:8080/";
  const ReactBaseUrl = "http://localhost:5173/";

  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo")) || null;
    } catch {
      return null;
    }
  });

  const token = userInfo;

  const { data, loading, error } = useQuery(GET_ALL_TELEGRAM_IDS, {
    fetchPolicy: "network-only",
    skip: !token,
  });

  const {
    data: orgData,
    loading: orgLoading,
    refetch: refetchOrganization,
  } = useQuery(GET_ORGANIZATION, {
    fetchPolicy: "network-only",
    skip: !token,
  });

  const allTelegramIds = data?.getAllTelegramIds ?? [];
  const organization = orgData?.getOrganization ?? null;

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
  };

  const login = (user) => {
    localStorage.setItem("userInfo", JSON.stringify(user));
    setUserInfo(user);
  };

  if (loading || orgLoading) {
    return <LoadingComponent text={"Please Wait, Data is Loading !!"} />;
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-8">
        <p className="text-red-500 font-semibold text-sm">
          Failed to connect to the server.
        </p>
        <p className="text-slate-500 text-xs text-center max-w-sm">
          {error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <VisitorEntryPassContext.Provider
      value={{
        userInfo,
        setUserInfo,
        allTelegramIds,
        organization,
        refetchOrganization,
        login,
        logout,
      }}
    >
      {children}
    </VisitorEntryPassContext.Provider>
  );
};

export default Context;

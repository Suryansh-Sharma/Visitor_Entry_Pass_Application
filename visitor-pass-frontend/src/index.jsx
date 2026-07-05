// index.jsx

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { jwtDecode } from "jwt-decode";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Context from "./context/VisitorEntryPassContext";
import { REGEN_JWT_TOKEN } from "./graphQl/queries";

const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 - 15000 < Date.now();
  } catch {
    return true;
  }
};

const reGenerateToken = async () => {
  try {
    const tempClient = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    });

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const refreshToken = userInfo?.credentials?.refreshToken?.token;

    if (!refreshToken) {
      throw new Error("Missing refresh token");
    }

    const { data } = await tempClient.query({
      query: REGEN_JWT_TOKEN,
      variables: { refreshToken },
      fetchPolicy: "no-cache",
    });

    const newJwtToken = data?.regenJwtFromRefreshToken?.jwtToken?.token;
    const newRefreshToken = data?.regenJwtFromRefreshToken?.refreshToken?.token;
    const generatedOn =
      data?.regenJwtFromRefreshToken?.refreshToken?.generatedOn;
    const expiresOn = data?.regenJwtFromRefreshToken?.refreshToken?.expiresOn;

    if (!newJwtToken || !newRefreshToken) {
      throw new Error("Failed to fetch new tokens");
    }

    userInfo.credentials.refreshToken.token = newRefreshToken;
    userInfo.credentials.refreshToken.generatedOn = generatedOn;
    userInfo.credentials.refreshToken.expiresOn = expiresOn;
    userInfo.credentials.jwtToken.token = newJwtToken;
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    return newJwtToken;
  } catch (e) {
    console.error("Token regeneration error:", e);
    localStorage.removeItem("userInfo");
    window.location.reload();
    return null;
  }
};

const httpLink = createHttpLink({
  uri: "http://localhost:8080/graphql",
});
let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (newToken) => {
  pendingRequests.forEach((callback) => callback(newToken));
  pendingRequests = [];
};

const getValidToken = async (token) => {
  if (token && !isTokenExpired(token)) {
    return token;
  }

  if (!isRefreshing) {
    isRefreshing = true;

    try {
      const newToken = await reGenerateToken();
      resolvePendingRequests(newToken);
      return newToken;
    } catch (e) {
      resolvePendingRequests(null);
      throw e;
    } finally {
      isRefreshing = false;
    }
  }

  return new Promise((resolve) => {
    pendingRequests.push(resolve);
  });
};

const authLink = setContext(async (_, { headers }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.credentials?.jwtToken?.token;
  if (!token) {
    return {
      headers: {
        ...headers,
      },
    };
  }
  const validToken = await getValidToken(token);
  return {
    headers: {
      ...headers,
      ...(validToken && {
        Authorization: `Bearer ${validToken}`,
      }),
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Context>
        <App />
      </Context>
    </ApolloProvider>
  </React.StrictMode>,
);

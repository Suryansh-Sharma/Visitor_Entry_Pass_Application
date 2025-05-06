// index.js

import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { jwtDecode } from 'jwt-decode';
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Context from './context/VisitorEntryPassContext';
import { REGEN_JWT_TOKEN } from "./graphQl/queries";
import reportWebVitals from './reportWebVitals';

const isTokenExpired = (token) => {
  try{
    const {exp} = jwtDecode(token);
    return exp * 1000 < Date.now();  
  }catch{
    return true;
  }
}
const reGenerateToken = async () => {
  try {
    const tempClient = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
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
    const generatedOn = data?.regenJwtFromRefreshToken?.refreshToken?.generatedOn;
    const expiresOn = data?.regenJwtFromRefreshToken?.refreshToken?.expiresOn;

    if (!newJwtToken || !newRefreshToken) {
      throw new Error("Failed to fetch new tokens");
    }

    userInfo.credentials.refreshToken.token = newRefreshToken;
    userInfo.credentials.refreshToken.generatedOn = generatedOn;
    userInfo.credentials.refreshToken.expiresOn = expiresOn;
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    sessionStorage.setItem('jwtToken', JSON.stringify(newJwtToken));
    return newJwtToken;
  } catch (e) {
    console.error("Token regeneration error:", e);
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('jwtToken');
    window.location.reload();
    return null;
  }
};

// ✅ Apollo HTTP Link
const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql', // Make sure this is reachable
});
let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (newToken) => {
  pendingRequests.forEach(callback => callback(newToken));
  pendingRequests = [];
};

const getValidToken = async (token) => {
  // const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  // let token = userInfo?.credentials?.jwtToken?.token;
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

  return new Promise(resolve => {
    pendingRequests.push(resolve);
  });
};

// ✅ Attach token from sessionStorage
const authLink = setContext(async (_, { headers }) => {
  const temp = JSON.parse(sessionStorage.getItem("jwtToken"));
  
  if (!temp) {
    return { headers };                             
  }
  const token = await getValidToken(temp);

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});


// ✅ Create ApolloClient instance
const client = new ApolloClient({
  link: authLink.concat(httpLink), // ✅ Ensure link is not undefined
  cache: new InMemoryCache(),
});
const root = ReactDOM.createRoot(document.getElementById('root')); 

root.render(
  <ApolloProvider client={client}>
    <Context>
      <App />
    </Context>
  </ApolloProvider>
);
reportWebVitals();
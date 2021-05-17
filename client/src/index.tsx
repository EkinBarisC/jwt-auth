import { ApolloProvider } from "@apollo/react-hooks";
import React from "react";
import ReactDOM from "react-dom";
import { getAccessToken, setAccessToken } from "./accessToken";
import { App } from "./App";
/* import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory"; */
/* import { HttpLink } from "apollo-link-http";
import { ApolloLink, Observable } from "apollo-link"; */
/* import { onError } from "apollo-link-error"; */
import jwtDecode from "jwt-decode";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import { onError } from "@apollo/client/link/error";
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  HttpLink,
  ApolloLink,
  Observable,
} from "@apollo/client";

const cache: any = new InMemoryCache({});

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable((observer) => {
      let handle: any;
      Promise.resolve(operation)
        .then((operation) => {
          const accessToken = getAccessToken();
          if (accessToken) {
            operation.setContext({
              headers: {
                authorization: "bearer " + accessToken,
              },
            });
          }
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    })
);

const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink({
      accessTokenField: "accessToken",
      isTokenValidOrUndefined: () => {
        const token = getAccessToken();

        if (!token) {
          return true;
        }

        try {
          const decoded: any = jwtDecode(token);
          const exp = decoded.exp;
          if (Date.now() > exp * 1000) {
            return false;
          } else {
            return true;
          }
        } catch (error) {
          return false;
        }
      },
      fetchAccessToken: () => {
        return fetch("http://localhost:4000/refresh_token", {
          method: "POST",
          credentials: "include",
        });
      },
      handleFetch: (accessToken) => {
        setAccessToken(accessToken);
      },

      handleError: (err) => {
        // full control over handling token fetch Error
        console.warn("Your refresh token is invalid. Try to relogin");
        console.error(err);
      },
    }),
    onError(({ graphQLErrors, networkError }) => {
      console.log(graphQLErrors);
      console.log(networkError);
    }),
    requestLink,
    new HttpLink({
      uri: "http://localhost:4000/graphql",
      credentials: "include",
    }),
  ]),
  cache,
  /* resolvers: {
    Mutation: {
      updateNetworkStatus: (_, { isConnected }, { cache }) => {
        cache.writeData({ data: { isConnected } });
        return null;
      },
    },
  }, */
});
/* 
cache.writeData({
  data: {
    isConnected: true,
  },
});
 */
ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

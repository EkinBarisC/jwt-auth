import React from "react";
import { Link } from "react-router-dom";
import { setAccessToken } from "./accessToken";
import { useLogoutMutation, useMeQuery } from "./generated/graphql";

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = ({}) => {
  const { data, loading } = useMeQuery();
  const [logout, { client }] = useLogoutMutation();

  let body: any = null;
  if (loading) {
    body = null;
  } else if (data && data.me) {
    body = <div>you are logged in as data.me.email</div>;
  } else {
    body = <div>you are not logged in</div>;
  }

  return (
    <header>
      <Link to="/">home </Link>
      <Link to="/register">register </Link>
      <Link to="/login">login</Link>
      {!loading && data && data.me ? (
        <button
          onClick={async () => {
            await logout();
            setAccessToken("");
            await client.resetStore();
          }}
        >
          logout
        </button>
      ) : null}
      {body}
    </header>
  );
};

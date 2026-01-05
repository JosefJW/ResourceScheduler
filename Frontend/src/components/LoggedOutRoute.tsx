import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type Props = {
  children: ReactNode;
};

export default function LoggedOutRoute({ children }: Props) {
  const token = localStorage.getItem("JWT");

  if (!token) {
    return <>{children}</>
  }

  const decoded = jwtDecode(token);
  if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
	  return <>{children}</>
  }

  return <Navigate to="/home" replace />;
}

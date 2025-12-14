import { Navigate } from "react-router-dom";
import { isTokenValid } from "./ProtectedRoute"; // or copy the function

export default function PublicRoute({ children }) {
	if (isTokenValid()) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
}

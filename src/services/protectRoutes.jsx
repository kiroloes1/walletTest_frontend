import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

async function isTokenValid() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp <= currentTime) {
      const res = await api.post("/users/refresh-token");

      if (res.status === 200) {
        localStorage.setItem("token", res.data.accessToken);
        return true;
      } else {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const valid = await isTokenValid();
      setIsValid(valid);
    };
    checkToken();
  }, []);

  if (isValid === null) return <div>Checking authentication...</div>;
  if (!isValid) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
import { useContext } from "react"
import { Outlet , Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
const ProtectedRoutes = () => {
    const {userinfo , loading} = useContext(AuthContext);
    if (loading) {
        return null; // or <Spinner /> if you have one
    }
    if (!userinfo) {
        return <Navigate to="/login" replace />;
    }

    // 3) we’re good → render nested routes
    return <Outlet />;
}

export default ProtectedRoutes;
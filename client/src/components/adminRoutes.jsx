const { Outlet, Navigate } = require("react-router");

const AdminRoutes = ({ isAdmin }) => {
  if (isAdmin === "Admin") {
    return <Outlet />;
  } else {
    return <Navigate to="/" />;
  }
};

export default AdminRoutes;

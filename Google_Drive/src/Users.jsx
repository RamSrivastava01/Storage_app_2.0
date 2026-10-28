import { useEffect, useState } from "react";
import {
   FaArrowLeft,
   FaCloud,
   FaSignOutAlt,
   FaTrashAlt,
   FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Users.css";

const BASE_URL = `${window.location.protocol}//${window.location.hostname}:4000`;
function Users() {
   const navigate = useNavigate();
   const [userList, setUserList] = useState([]);
   const [, setUserName] = useState("Guest User");
   const [, setUserEmail] = useState("guest@example.com");
   const [userRole, setUserRole] = useState("User");

   useEffect(() => {
      fetchUser();
      fetchAllUsers();
   }, []);

   async function fetchAllUsers() {
      const response = await fetch(`${BASE_URL}/users`, {
         credentials: "include",
      });
      if (response.ok) {
         const users = await response.json();
         setUserList(users);
         console.log(users);
      } else if (response.status == 403) {
         navigate("/");
      }
   }
   async function fetchUser() {
      try {
         const response = await fetch(`${BASE_URL}/user`, {
            credentials: "include",
         });
         if (response.ok) {
            const data = await response.json();
            // Set user info if logged in
            setUserName(data.name);
            setUserEmail(data.email);
            setUserRole(data.role);
         } else if (response.status === 401) {
            // User not logged in
            navigate("/login");
            setUserName("Guest User");
            setUserEmail("guest@example.com");
         } else {
            // Handle other error statuses if needed
            console.error("Error fetching user info:", response.status);
         }
      } catch (err) {
         console.error("Error fetching user info:", err);
      }
   }
   fetchUser();

   const logoutUser = async (userId) => {
      const confirmLogout = confirm("Delete an User?");
      if (!confirmLogout) return;
      try {
         const response = await fetch(`${BASE_URL}/users/${userId}/logout`, {
            method: "POST",
            credentials: "include",
         });
         if (response.ok) {
            console.log("Logged out successfully");
            fetchAllUsers();
         } else {
            console.error("Logout failed");
         }
      } catch (err) {
         console.error("Logout error:", err);
      }
   };

   const deleteUser = async (userId) => {
      const confirmLogout = confirm("Delete an User?");
      if (!confirmLogout) return;
      try {
         const response = await fetch(`${BASE_URL}/users/${userId}`, {
            method: "DELETE",
            credentials: "include",
         });
         if (response.ok) {
            console.log("deleted  successfully");
            fetchAllUsers();
         } else {
            console.error("Logout failed");
         }
      } catch (err) {
         console.error("Logout error:", err);
      }
   };

   return (
      <main className="users-page">
         <div className="users-ambient-grid" aria-hidden="true" />
         <section className="users-panel" aria-labelledby="users-heading">
            <header className="users-header">
               <div className="users-brand">
                  <div className="users-brand-mark">
                     <FaCloud />
                  </div>
                  <div>
                     <span className="users-eyebrow">Storage App</span>
                     <h1 id="users-heading">User access</h1>
                  </div>
               </div>
               <button
                  className="users-back-button"
                  type="button"
                  onClick={() => navigate("/")}
               >
                  <FaArrowLeft />
                  Back to drive
               </button>
            </header>

            <div className="users-intro">
               <div>
                  <span className="users-section-label">Access overview</span>
                  <h2>Users</h2>
                  <p>Review who currently has an active session.</p>
               </div>
               <div
                  className="users-count"
                  aria-label={`${userList.length} users`}
               >
                  <FaUsers />
                  {userList.length} users
               </div>
            </div>

            <div className="users-table-wrap">
               <table className="users-table">
                  <thead>
                     <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Login status</th>
                        <th scope="col">
                           <span className="visually-hidden">Actions</span>
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {userList &&
                        userList.map((user) => (
                           <tr key={user.id}>
                              <td>
                                 <div className="user-name-cell">
                                    <span
                                       className="user-avatar"
                                       aria-hidden="true"
                                    >
                                       {user.name.charAt(0)}
                                    </span>
                                    {user.name}
                                 </div>
                              </td>
                              <td>{user.email}</td>
                              <td>
                                 <span
                                    className={`login-status ${user.isLoggedIn ? "is-active" : "is-inactive"}`}
                                 >
                                    <span aria-hidden="true" />
                                    {user.isLoggedIn
                                       ? "Logged in"
                                       : "Logged out"}
                                 </span>
                              </td>
                              <td className="user-action-cell">
                                 <div className="user-actions">
                                    <button
                                       className="user-logout-button"
                                       type="button"
                                       onClick={() => logoutUser(user.id)}
                                       disabled={!user.isLoggedIn}
                                       title={
                                          user.isLoggedIn
                                             ? `Log ${user.name} out`
                                             : `${user.name} is already logged out`
                                       }
                                    >
                                       <FaSignOutAlt />
                                       Log out
                                    </button>
                                    {userRole === "Admin" ? (
                                       <button
                                          className="user-delete-button"
                                          type="button"
                                          onClick={() => {
                                             console.log(user.id);
                                             deleteUser(user.id);
                                          }}
                                          title={`Delete ${user.name}`}
                                       >
                                          <FaTrashAlt />
                                          Delete user
                                       </button>
                                    ) : (
                                       ""
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                  </tbody>
               </table>
            </div>
         </section>
      </main>
   );
}

export default Users;

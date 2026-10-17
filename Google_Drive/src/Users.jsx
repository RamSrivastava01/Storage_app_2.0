import { useState } from "react";
import { FaArrowLeft, FaCloud, FaSignOutAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Users.css";

// This is intentionally display-only UI until the RBAC API is introduced.
const users = [
   {
      id: 1,
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      isLoggedIn: true,
   },
   {
      id: 2,
      name: "Priya Patel",
      email: "priya.patel@example.com",
      isLoggedIn: false,
   },
   {
      id: 3,
      name: "Rohan Mehta",
      email: "rohan.mehta@example.com",
      isLoggedIn: true,
   },
   {
      id: 4,
      name: "Neha Gupta",
      email: "neha.gupta@example.com",
      isLoggedIn: false,
   },
];

function Users() {
   const navigate = useNavigate();
   const [userList, setUserList] = useState(users);

   function handleLogout(userId) {
      setUserList((currentUsers) =>
         currentUsers.map((user) =>
            user.id === userId ? { ...user, isLoggedIn: false } : user,
         ),
      );
   }

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
                     {userList.map((user) => (
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
                                 {user.isLoggedIn ? "Logged in" : "Logged out"}
                              </span>
                           </td>
                           <td className="user-action-cell">
                              <button
                                 className="user-logout-button"
                                 type="button"
                                 onClick={() => handleLogout(user.id)}
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

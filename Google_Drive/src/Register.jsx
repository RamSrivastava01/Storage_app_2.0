import React, { useState } from "react";

function Register() {
   const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
   });

   function handleChange(e) {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   }

   function handleSubmit(e) {
      e.preventDefault();

      console.log(formData);
   }

   return (
      <div style={styles.container}>
         <form style={styles.form} onSubmit={handleSubmit}>
            <h2 style={styles.heading}>Create Account</h2>

            <div style={styles.inputGroup}>
               <label style={styles.label}>Name</label>
               <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
               />
            </div>

            <div style={styles.inputGroup}>
               <label style={styles.label}>Email</label>
               <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
               />
            </div>

            <div style={styles.inputGroup}>
               <label style={styles.label}>Password</label>
               <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
               />
            </div>

            <button type="submit" style={styles.button}>
               Register
            </button>
         </form>
      </div>
   );
}

const styles = {
   container: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f4f4f4",
   },

   form: {
      width: "350px",
      padding: "30px",
      borderRadius: "10px",
      backgroundColor: "#fff",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
   },

   heading: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#333",
   },

   inputGroup: {
      marginBottom: "15px",
   },

   label: {
      display: "block",
      marginBottom: "5px",
      color: "#555",
      fontWeight: "bold",
   },

   input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "16px",
      outline: "none",
   },

   button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#4CAF50",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      cursor: "pointer",
   },
};

export default Register;
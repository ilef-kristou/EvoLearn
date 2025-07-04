import React, { useState } from "react";
import axios from "axios";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    password: "",
    location: "bardo",
    role: "particulier"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/reg-auth/register", formData);
      console.log(response.data);
      alert("Registration successful, please check your email to verify your account.");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <label>
        Name:
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </label>
      <label>
        Phone Number:
        <input type="number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
      </label>
      <label>
        Email:
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </label>
      <label>
        Password:
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      </label>
      <label>
        Location:
        <select name="location" value={formData.location} onChange={handleChange}>
          <option value="bardo">Bardo</option>
          <option value="aouina">Aouina</option>
        </select>
      </label>
      <label>
        Role:
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="entreprise">Entreprise</option>
          <option value="particulier">Particulier</option>
        </select>
      </label>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignupForm;




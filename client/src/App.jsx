import { useState } from "react";
import "./index.css";

export default function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))  // might have to change up regex not 100% correct
      e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm password.";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length === 0) {
      setSubmitted(true);
      // TODO: send to db here
      console.log("Registration data:", form);
    }
  };

  if (submitted) {
    return (
      <div className="page">
      </div>
    );
  }

  return (
    <div className="page">
      <form className="card form" onSubmit={onSubmit} noValidate>
        <h1>Create your account</h1>

        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={onChange}
          required
          aria-invalid={!!errors.name}
          aria-describedby="name-error"
        />
        {errors.name && <div id="name-error" className="error">{errors.name}</div>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
        />
        {errors.email && <div id="email-error" className="error">{errors.email}</div>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
          autoComplete="new-password"
        />
        {errors.password && <div id="password-error" className="error">{errors.password}</div>}

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={onChange}
          required
          aria-invalid={!!errors.confirmPassword}
          aria-describedby="confirmPassword-error"
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <div id="confirmPassword-error" className="error">{errors.confirmPassword}</div>
        )}

        <button type="submit">Register</button>

        
      </form>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) return setError("Name, email and password are required.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    try { await register({ name: form.name, email: form.email, password: form.password }); navigate("/", { replace: true }); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to create your account."); }
    finally { setSubmitting(false); }
  };

  return <main className="auth-page"><section className="auth-copy"><div className="brand-mark contact-logo" aria-label="Contact Book logo"><span className="contact-logo-tabs" /><span className="contact-logo-book" /><span className="contact-logo-person" /></div><p className="eyebrow">START YOUR BOOK</p><h1>Keep the right people close.</h1><p>A quiet, simple home for the names you never want to lose.</p></section><section className="auth-panel"><form onSubmit={submit} className="form-stack"><p className="eyebrow">CREATE ACCOUNT</p><h2>Your contact book awaits.</h2><Field label="Name" name="name" value={form.name} onChange={update} placeholder="Your name" /><Field label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" /><Field label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="At least 6 characters" /><Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} placeholder="Repeat your password" />{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={submitting}>{submitting ? "Creating account..." : "Create account"}</button><p className="form-foot">Already have an account? <Link to="/login">Sign in</Link></p></form></section></main>;
}

function Field({ label, ...props }) { return <label className="field"><span>{label}</span><input required {...props} /></label>; }

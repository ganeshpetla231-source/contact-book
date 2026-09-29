import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("Email and password are required.");
    setSubmitting(true);
    try { await login(form); navigate(location.state?.from?.pathname || "/", { replace: true }); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to sign in."); }
    finally { setSubmitting(false); }
  };

  return <AuthLayout eyebrow="WELCOME BACK" title="Make room for the people who matter." subtitle="Sign in to your personal contact book.">
    <form onSubmit={submit} className="form-stack">
      <Field label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" />
      <Field label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="At least 6 characters" />
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button>
      <p className="form-foot">New here? <Link to="/register">Create an account</Link></p>
    </form>
  </AuthLayout>;
}

function Field({ label, ...props }) { return <label className="field"><span>{label}</span><input required {...props} /></label>; }
function AuthLayout({ eyebrow, title, subtitle, children }) { return <main className="auth-page"><section className="auth-copy"><div className="brand-mark contact-logo" aria-label="Contact Book logo"><span className="contact-logo-tabs" /><span className="contact-logo-book" /><span className="contact-logo-person" /></div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></section><section className="auth-panel">{children}</section></main>; }

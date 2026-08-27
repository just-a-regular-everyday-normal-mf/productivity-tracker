import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError(false);

    try {
      await client.post("/api/login", { password });
      localStorage.setItem("app_password", password);
      navigate("/daily");
    } catch {
      setError(true);
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <Card className="login-card">
          <p className="login-kicker">OPS LOG</p>
          <h1>Access</h1>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" variant="primary">
            Enter
          </Button>
          {error ? <p className="login-error">Incorrect password.</p> : null}
        </Card>
      </form>
    </div>
  );
}

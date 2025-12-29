import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Alert, Button, FormControl, Link as RLink, Text, TextField, View } from "reshaped";
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "../api/axios";
import SocialButtons from "../components/SocialButtons";
import AuthShell from "../components/AuthShell";
import { routerLink } from "../components/RouterLink";

export default function SignIn() {
  const [email, setEmail] = useState("student@vu.edu.pk");
  const [password, setPassword] = useState("ValidPassword123!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const user = response.data.user;
      const pendingInvite = localStorage.getItem("pendingInviteToken");

      if (pendingInvite) {
        navigate(`/projects/join/${pendingInvite}`);
      } else if (user.role?.role_name?.toLowerCase() === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle={<>Don't have an account? <RLink {...routerLink("/register")}>Sign Up</RLink></>}
    >
      {error && <Alert color="critical" attributes={{ role: "alert" }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <View gap={4}>
          <FormControl>
            <FormControl.Label>Email Address</FormControl.Label>
            <TextField
              name="email"
              icon={Mail}
              placeholder="name@vu.edu.pk"
              value={email}
              onChange={({ value }) => setEmail(value)}
              inputAttributes={{ id: "login-email", type: "email", required: true, autoComplete: "email" }}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Password</FormControl.Label>
            <TextField
              name="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={({ value }) => setPassword(value)}
              inputAttributes={{ id: "login-password", type: showPassword ? "text" : "password", required: true, autoComplete: "current-password" }}
              endSlot={
                <Button
                  variant="ghost"
                  size="small"
                  icon={showPassword ? EyeOff : Eye}
                  onClick={() => setShowPassword(!showPassword)}
                  attributes={{ "aria-label": showPassword ? "Hide password" : "Show password" }}
                />
              }
            />
          </FormControl>

          <Button type="submit" color="primary" size="large" fullWidth loading={isLoading} endIcon={ArrowRight}>
            Sign In to Dashboard
          </Button>
        </View>
      </form>

      <SocialButtons />
      <Text variant="caption-1" color="neutral-faded"><Link to="/">← Back to home</Link></Text>
    </AuthShell>
  );
}

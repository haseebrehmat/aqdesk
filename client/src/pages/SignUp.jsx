import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, FormControl, Link as RLink, TextField, View } from "reshaped";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "../components/icons";
import api from "../api/axios";
import SocialButtons from "../components/SocialButtons";
import AuthShell from "../components/AuthShell";
import { routerLink } from "../components/RouterLink";

export default function SignUp() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const setField = ({ name, value }) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/register", formData);
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
      setError(err.response?.data?.message || "Registration failed. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={<>Already have an account? <RLink {...routerLink("/login")}>Sign In</RLink></>}
    >
      {error && <Alert color="critical" attributes={{ role: "alert" }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <View gap={4}>
          <FormControl>
            <FormControl.Label>Full Name</FormControl.Label>
            <TextField
              name="name"
              icon={User}
              placeholder="Your full name"
              value={formData.name}
              onChange={setField}
              inputAttributes={{ id: "register-name", required: true, autoComplete: "name" }}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Email Address</FormControl.Label>
            <TextField
              name="email"
              icon={Mail}
              placeholder="name@vu.edu.pk"
              value={formData.email}
              onChange={setField}
              inputAttributes={{ id: "register-email", type: "email", required: true, autoComplete: "email" }}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Password</FormControl.Label>
            <TextField
              name="password"
              icon={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={setField}
              inputAttributes={{ id: "register-password", type: showPassword ? "text" : "password", required: true, minLength: 6, autoComplete: "new-password" }}
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
            Create Account
          </Button>
        </View>
      </form>
      <SocialButtons />
    </AuthShell>
  );
}

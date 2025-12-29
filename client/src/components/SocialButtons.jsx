import { useEffect, useState } from "react";
import { Button, Divider, Grid, View } from "reshaped";
import api from "../api/axios";
import { GoogleIcon, GitHubIcon } from "./BrandIcons";

// Google / GitHub buttons, shown only for providers the backend has configured.
export default function SocialButtons() {
  const [providers, setProviders] = useState({});
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

  useEffect(() => {
    api.get("/auth/providers")
      .then(({ data }) => setProviders(data.providers || {}))
      .catch(() => setProviders({}));
  }, []);

  if (!providers.google && !providers.github) return null;

  return (
    <View gap={4}>
      <Divider />
      <Grid columns={{ s: 1, m: 2 }} gap={3}>
        {providers.google && (
          <Button variant="outline" icon={GoogleIcon} href={`${backendUrl}/api/auth/google/redirect`}>Continue with Google</Button>
        )}
        {providers.github && (
          <Button variant="outline" icon={GitHubIcon} href={`${backendUrl}/api/auth/github/redirect`}>Continue with GitHub</Button>
        )}
      </Grid>
    </View>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Loader, Text, View } from "reshaped";
import { AlertCircle } from "lucide-react";
import api from "../api/axios";
import { useToast } from "../components/ToastContainer";

export default function JoinProject() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [joining, setJoining] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    handleJoin();
  }, [token]);

  const handleJoin = async () => {
    // 1. Check if user is authenticated
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      localStorage.setItem("pendingInviteToken", token);
      addToast("Please sign in or sign up to join this workspace.", "info");
      navigate("/login");
      return;
    }

    // 2. Clear stored pending token immediately so it cannot re-trigger
    localStorage.removeItem("pendingInviteToken");

    // 3. Attempt joining workspace
    try {
      setJoining(true);
      const res = await api.post(`/projects/join/${token}`);
      addToast(res.data.message || "Successfully joined project!", "success");
      navigate(`/projects/${res.data.project_id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to join project invitation.";
      setError(errorMsg);
      addToast(errorMsg, "error");
    } finally {
      setJoining(false);
    }
  };

  return (
    <View as="main" minHeight="100vh" align="center" justify="center" padding={6} backgroundColor="page">
      <Card padding={8}>
        <View width="420px" maxWidth="100%" align="center" gap={4} textAlign="center">
          {joining ? (
            <>
              <Loader size="large" />
              <Text as="h1" variant="featured-5" weight="bold">Joining Project Workspace...</Text>
              <Text variant="body-2" color="neutral-faded">Validating invitation token and setting up member access.</Text>
            </>
          ) : error ? (
            <>
              <AlertCircle size={32} color="var(--rs-color-foreground-critical)" aria-hidden="true" />
              <Text as="h1" variant="featured-5" weight="bold">Invitation Error</Text>
              <Text variant="body-2" color="neutral-faded">{error}</Text>
              <Button fullWidth onClick={() => navigate("/projects")}>Return to Projects</Button>
            </>
          ) : null}
        </View>
      </Card>
    </View>
  );
}

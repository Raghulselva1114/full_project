import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Typography,
} from "@mui/material";
import API from "../../api/axios";

const initialForm = {
  first_name: "",
  last_name: "",
  bio: "",
  password: "",
  confirmPassword: "",
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export default function AdminProfile() {
  const [form, setForm] = useState(initialForm);
  const [roleLabel, setRoleLabel] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("profile/");
        const rawRole = res.data?.sub_role || res.data?.role || localStorage.getItem("role") || "";
        const normalizedRole = String(rawRole).replaceAll("_", " ").trim();
        setRoleLabel(
          normalizedRole ? normalizedRole.replace(/\b\w/g, (char) => char.toUpperCase()) : "User"
        );
        setAvatarUrl(res.data?.avatar_url || "");
        setAvatarPreview("");
        setPendingAvatarFile(null);
        setForm((prev) => ({
          ...prev,
          first_name: res.data?.first_name || "",
          last_name: res.data?.last_name || "",
          bio: res.data?.bio || "",
          password: "",
          confirmPassword: "",
        }));
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPEG, WebP, etc.).");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Image must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }
    setError("");
    setPendingAvatarFile(file);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const clearPendingAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
    setPendingAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const passwordMismatch = useMemo(
    () => form.password && form.confirmPassword && form.password !== form.confirmPassword,
    [form.password, form.confirmPassword]
  );

  const isPasswordPairValid = useMemo(() => {
    if (!form.password && !form.confirmPassword) return true;
    return Boolean(form.password) && Boolean(form.confirmPassword) && !passwordMismatch;
  }, [form.password, form.confirmPassword, passwordMismatch]);

  const isFormValid = useMemo(
    () =>
      Boolean(form.first_name.trim()) &&
      Boolean(form.last_name.trim()) &&
      isPasswordPairValid,
    [form.first_name, form.last_name, isPasswordPairValid]
  );

  const handleSubmit = async () => {
    setError("");
    if (!isFormValid) return;

    setSaving(true);
    try {
      let res;
      if (pendingAvatarFile) {
        const fd = new FormData();
        fd.append("first_name", form.first_name.trim());
        fd.append("last_name", form.last_name.trim());
        fd.append("bio", form.bio.trim());
        fd.append("password", form.password || "");
        fd.append("avatar", pendingAvatarFile);
        res = await API.put("profile/update/", fd);
      } else {
        res = await API.put("profile/update/", {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          bio: form.bio.trim(),
          password: form.password || "",
        });
      }

      if (res.data?.access) {
        localStorage.setItem("token", res.data.access);
      }

      if (res.data?.avatar_url !== undefined) {
        setAvatarUrl(res.data.avatar_url || "");
      }
      clearPendingAvatar();

      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setSuccessOpen(true);
    } catch (err) {
      const backendData = err?.response?.data;
      const message =
        backendData?.error ||
        backendData?.detail ||
        (typeof backendData === "string" ? backendData : "") ||
        "Failed to update profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 620, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Box
              component="label"
              sx={{
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "2px dashed",
                borderColor: "divider",
                p: 0.35,
                mb: 1.5,
                transition: "border-color 0.2s, opacity 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  opacity: 0.95,
                },
              }}
            >
              <Avatar
                src={avatarPreview || avatarUrl || undefined}
                sx={{ width: 88, height: 88, pointerEvents: "none" }}
              >
                {!avatarPreview && !avatarUrl
                  ? `${(form.first_name || "?").charAt(0)}${(form.last_name || "").charAt(0)}`
                  : null}
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarFile}
              />
            </Box>
            
            
            <Typography variant="h5" fontWeight={700}>
              Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your details and reset your password
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                px: 1.2,
                py: 0.4,
                borderRadius: 5,
                bgcolor: "primary.50",
                color: "primary.main",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {roleLabel}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="First Name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Bio / Description"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                multiline
                minRows={3}
                fullWidth
              />

              <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                Reset Password
              </Typography>
              <TextField
                label="New Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                helperText="Leave blank to keep existing password."
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                fullWidth
                error={!isPasswordPairValid}
                helperText={
                  !form.password && !form.confirmPassword
                    ? ""
                    : passwordMismatch
                      ? "Passwords do not match."
                      : !form.password || !form.confirmPassword
                        ? "Both password fields are required when changing password."
                        : ""
                }
              />

              {error && (
                <Alert severity="error" sx={{ mt: 0.5 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid || saving || loading}
                sx={{ mt: 1, py: 1.2 }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={successOpen}
        autoHideDuration={2500}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" variant="filled">
          Profile updated successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
}

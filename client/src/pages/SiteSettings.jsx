import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Button, Card, Container, FormControl, Image, Text, TextField, View } from 'reshaped';
import { ImageUp, Trash2, Save } from '../components/icons';
import api from '../api/axios';
import { useBranding } from '../context/BrandingContext';
import { useToast } from '../components/ToastContainer';

const MAX_BYTES = 2 * 1024 * 1024;

export default function SiteSettings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role?.role_name?.toLowerCase() === 'admin';
  const { appName, logoUrl, hasCustomLogo, setSettings } = useBranding();
  const { addToast } = useToast();

  const [name, setName] = useState(appName);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setName(appName); }, [appName]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const onPick = (event) => {
    const picked = event.target.files?.[0];
    setError('');
    if (!picked) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'].includes(picked.type)) {
      setError('Logo must be a PNG, JPG, WEBP or ICO image.');
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError('Logo must be 2 MB or smaller.');
      return;
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const save = async (extra = {}) => {
    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('app_name', name.trim() || 'AQDesk');
      if (file) body.append('logo', file);
      Object.entries(extra).forEach(([k, v]) => body.append(k, v));
      const { data } = await api.post('/admin/settings', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSettings(data.settings);
      setFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = '';
      addToast('Site settings updated.');
    } catch (err) {
      const message = err.response?.data?.errors?.logo?.[0] || err.response?.data?.message || 'Could not save settings.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container width="720px" padding={{ s: 4, l: 8 }}>
      <View gap={6} paddingBlock={6}>
        <View gap={1}>
          <Text as="h1" variant="featured-2" weight="bold">Site Settings</Text>
          <Text color="neutral-faded">The logo you upload is used as the site logo and the browser tab favicon.</Text>
        </View>

        {error && <Alert color="critical" attributes={{ role: 'alert' }}>{error}</Alert>}

        <Card padding={6}>
          <View gap={6}>
            <FormControl>
              <FormControl.Label>Site name</FormControl.Label>
              <TextField name="app_name" value={name} onChange={({ value }) => setName(value)} inputAttributes={{ maxLength: 60 }} />
            </FormControl>

            <View gap={3}>
              <Text variant="body-2" weight="medium">Logo &amp; favicon</Text>
              <View direction="row" align="center" gap={4} wrap>
                <View width="96px" height="96px" borderRadius="large" border backgroundColor="neutral-faded" align="center" justify="center" overflow="hidden">
                  <Image src={preview || logoUrl} alt="Current logo" width="80px" height="80px" displayMode="contain" />
                </View>
                <View gap={2}>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/x-icon"
                    onChange={onPick}
                    hidden
                    id="logo-upload"
                    aria-label="Upload logo"
                  />
                  <View direction="row" gap={2} wrap>
                    <Button variant="outline" icon={ImageUp} onClick={() => inputRef.current?.click()}>Choose image</Button>
                    {hasCustomLogo && !file && (
                      <Button variant="ghost" color="critical" icon={Trash2} disabled={saving} onClick={() => save({ remove_logo: 1 })}>
                        Reset to default
                      </Button>
                    )}
                  </View>
                  <Text variant="caption-1" color="neutral-faded">
                    {file ? `Selected: ${file.name}` : 'Square PNG, JPG, WEBP or ICO, up to 2 MB (256×256 recommended).'}
                  </Text>
                </View>
              </View>
            </View>

            <View direction="row" justify="end">
              <Button color="primary" icon={Save} loading={saving} onClick={() => save()}>Save changes</Button>
            </View>
          </View>
        </Card>
      </View>
    </Container>
  );
}

import { useEffect, useState } from 'react';
import { Alert, Button, Loader, Modal, View } from 'reshaped';
import { FileText } from './icons';
import opportunityService from '../services/opportunityService';

// "View Resume" button that shows the PDF in a modal overlay.
export default function ResumeButton({ application, size }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let objectUrl;
    let cancelled = false;
    opportunityService.getResume(application.id)
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        setUrl(objectUrl);
      })
      .catch((err) => !cancelled && setError(err.response?.status === 404 ? 'The resume file is no longer available. Ask the applicant to apply again.' : 'Unable to load this resume.'));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, application.id]);

  const close = () => {
    setOpen(false);
    setUrl(null);
    setError(null);
  };

  const name = application.applicant_name || application.applicant?.name || 'Applicant';

  return (
    <>
      <Button variant="ghost" color="primary" size={size} icon={FileText} onClick={() => setOpen(true)}>View Resume</Button>
      <Modal active={open} onClose={close} size="900px" padding={4}>
        <Modal.Title>Resume – {name}</Modal.Title>
        <View paddingTop={3} height="75vh">
          {error && <Alert color="critical">{error}</Alert>}
          {!url && !error && <View align="center" padding={12}><Loader /></View>}
          {url && <iframe src={url} title={`Resume of ${name}`} style={{ width: '100%', height: '100%', border: 0 }} />}
        </View>
        <View direction="row" justify="end" paddingTop={3}>
          <Button variant="outline" onClick={close}>Close</Button>
        </View>
      </Modal>
    </>
  );
}

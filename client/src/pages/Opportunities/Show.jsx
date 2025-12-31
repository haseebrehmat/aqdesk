import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Alert, Badge, Button, Card, Divider, FormControl, Grid, Loader, Text, TextField, View } from 'reshaped';
import opportunityService from '../../services/opportunityService';
import { MapPin, Building2, UploadCloud, ArrowLeft, FileText } from '../../components/icons';
import { Page, EmptyState, NativeSelect } from '../../components/ui'
import { MAX_RESUME_MB, validateUpload } from '../../utils/limits';
import { formatDate } from '../../utils/format';
import ResumeButton from '../../components/ResumeModal';
import { routerLink } from '../../components/RouterLink';
import { useToast } from '../../components/ToastContainer';
import { STATUS_COLORS, statusLabel } from '../../utils/opportunity';

const STATUSES = ['Submitted', 'Reviewed', 'Shortlisted', 'Rejected', 'Accepted'];

// Employer/admin view of the candidates who applied to one opportunity.
function CandidatePipeline({ opportunityId }) {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    opportunityService.getApplications({ opportunity_id: opportunityId })
      .then((res) => setApplications(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load candidates.'));
  }, [opportunityId]);

  const changeStatus = async (application, status) => {
    try {
      await opportunityService.updateApplicationStatus(application.id, status);
      setApplications((list) => list.map((a) => (a.id === application.id ? { ...a, status } : a)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <View gap={3}>
      <Text as="h3" variant="body-2" weight="bold">Candidate Pipeline{applications ? ` (${applications.length})` : ''}</Text>
      {error && <Alert color="critical" attributes={{ role: 'alert' }}>{error}</Alert>}
      {!applications && !error && <Loader />}
      {applications?.length === 0 && <Text variant="caption-1" color="neutral-faded">No applications yet.</Text>}
      {applications?.map((app) => (
        <Card key={app.id} padding={3}>
          <View gap={2}>
            <View gap={0.5}>
              <Text variant="body-2" weight="bold">{app.applicant_name || app.applicant?.name || 'Applicant'}</Text>
              <Text variant="caption-1" color="neutral-faded">{app.applicant_email || app.applicant?.email}</Text>
              <Text variant="caption-1" color="neutral-faded">{formatDate(app.created_at)}</Text>
            </View>
            <NativeSelect
              name={`status-${app.id}`}
              value={app.status}
              onChange={({ value }) => changeStatus(app, value)}
              inputAttributes={{ 'aria-label': `Status for ${app.applicant_name || app.applicant?.name || 'applicant'}` }}
              options={STATUSES.map((st) => ({ value: st, label: st }))}
            />
            <View direction="row">
              <ResumeButton application={app} size="small" />
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

const LIFECYCLE_ACTIONS = {
  Published: [
    { status: 'Hired', label: 'Mark as Hired', confirm: 'Mark this opportunity as hired? It will stop accepting applications.', color: 'primary' },
    { status: 'Completed', label: 'Mark as Completed', confirm: 'Mark this opportunity as completed? It will stop accepting applications.', color: 'neutral' },
    { status: 'Cancelled', label: 'Cancel Opportunity', confirm: 'Cancel this opportunity? It will no longer be listed publicly.', color: 'critical' },
  ],
  Completed: [{ status: 'Published', label: 'Reopen', confirm: 'Reopen this opportunity for applications?', color: 'primary' }],
  Hired: [{ status: 'Published', label: 'Reopen', confirm: 'Reopen this opportunity for applications?', color: 'primary' }],
  Cancelled: [{ status: 'Published', label: 'Reopen', confirm: 'Reopen this opportunity for applications?', color: 'primary' }],
};

// Owner/admin controls to finish, cancel or reopen a posting.
function LifecycleControls({ opportunity, onChange }) {
  const { addToast, confirm } = useToast();
  const [busy, setBusy] = useState(false);
  const actions = LIFECYCLE_ACTIONS[opportunity.status] || [];

  const apply = async (action) => {
    if (!(await confirm(action.confirm, { title: action.label, confirmLabel: action.label, color: action.color === 'critical' ? 'critical' : 'primary' }))) return;
    setBusy(true);
    try {
      const res = await opportunityService.updateLifecycle(opportunity.id, action.status);
      onChange(res.data.data);
      addToast(`Opportunity is now ${statusLabel(action.status).toLowerCase()}.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update the opportunity.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View gap={2}>
      <View direction="row" align="center" gap={2}>
        <Text variant="body-2" weight="medium">Status</Text>
        <Badge color={STATUS_COLORS[opportunity.status] || 'neutral'} variant="faded">{statusLabel(opportunity.status)}</Badge>
      </View>
      {actions.length === 0 && <Text variant="caption-1" color="neutral-faded">This posting is awaiting moderation.</Text>}
      {actions.map((action) => (
        <Button key={action.status + action.label} variant="outline" color={action.color} fullWidth loading={busy} onClick={() => apply(action)}>{action.label}</Button>
      ))}
    </View>
  );
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const location = useLocation();
  const opportunityBasePath = location.pathname.startsWith('/dashboard/')
    ? '/dashboard/opportunities'
    : '/opportunities';
  const [opportunity, setOpportunity] = useState(null);
  const [otherOpportunities, setOtherOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    fetchOpportunityDetails();
  }, [id]);

  const fetchOpportunityDetails = async () => {
    setLoading(true);
    try {
      // Fetch target opportunity and overall job listings for the "Other Jobs" section
      const [currRes, allRes] = await Promise.allSettled([
        opportunityService.getOpportunity(id),
        opportunityService.getOpportunities ? opportunityService.getOpportunities() : Promise.resolve({ data: [] })
      ]);

      if (currRes.status === 'fulfilled') {
        setOpportunity(currRes.value.data.data || currRes.value.data);
      } else {
        throw currRes.reason;
      }

      if (allRes.status === 'fulfilled') {
        const list = allRes.value.data.data || allRes.value.data || [];
        // Filter out current job to show other listings
        setOtherOpportunities(list.filter(item => String(item.id) !== String(id)).slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load opportunity:', err);
      setError(err.response?.data?.message || 'Failed to load opportunity details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) {
      setError('Please select a PDF resume file.');
      return;
    }

    const formData = new FormData();
    formData.append('opportunity_id', id);
    formData.append('resume', resume);
    if (!user) {
      formData.append('applicant_name', applicantName);
      formData.append('applicant_email', applicantEmail);
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await opportunityService.applyToOpportunity(formData);
      setMessage('Application submitted successfully!');
      setResume(null);
      setApplicantName('');
      setApplicantEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleName = (user?.role?.role_name || '').toLowerCase();
  const isAdminUser = roleName === 'admin' || roleName === 'administrator';
  const isManager = opportunityBasePath.startsWith('/dashboard')
    && !!user && !!opportunity
    && (isAdminUser || Number(opportunity.posted_by) === Number(user.id));

  if (loading) return <View align="center" padding={12} gap={2}><Loader /><Text color="neutral-faded">Loading opportunity details...</Text></View>;
  if (error && !opportunity) return <Page width="800px"><Alert color="critical">{error}</Alert></Page>;
  if (!opportunity) return <Page width="800px"><EmptyState title="Opportunity not found." /></Page>;

  return (
    <Page width="1100px">
      <View direction="row"><Button variant="ghost" icon={ArrowLeft} {...routerLink(opportunityBasePath)}>Back to Opportunities Board</Button></View>

      <Grid columns={{ s: 1, l: '8fr 4fr' }} gap={6} align="start">
        <Card padding={{ s: 5, m: 8 }}>
          <View gap={6}>
            <View direction={{ s: 'column', m: 'row' }} justify="space-between" gap={3}>
              <View gap={2}>
                <View direction="row"><Badge color="positive" variant="faded">{opportunity.job_type || 'Full-Time'}</Badge></View>
                <Text as="h1" variant="featured-2" weight="bold">{opportunity.title}</Text>
                <View direction="row" align="center" gap={1}><Building2 size={16} aria-hidden="true" /><Text weight="medium">{opportunity.company_name}</Text></View>
              </View>
              <View direction="row" align="start"><Badge variant="faded" icon={MapPin}>{opportunity.location || 'Remote'}</Badge></View>
            </View>

            <Grid columns={{ s: 2, m: 4 }} gap={4}>
              {[
                ['Date Posted', formatDate(opportunity.created_at)],
                ['Listing Status', opportunity.status || 'Published'],
                ['Category', 'Software & Tech'],
                ['Application Deadline', opportunity.application_deadline ? formatDate(opportunity.application_deadline, { dateStyle: 'medium', timeStyle: 'short' }) : 'Open until filled'],
              ].map(([label, value]) => (
                <View key={label} gap={1}>
                  <Text variant="caption-1" color="neutral-faded">{label}</Text>
                  <Text variant="body-2" weight="medium">{value}</Text>
                </View>
              ))}
            </Grid>
            <Divider />

            <View gap={2}>
              <Text as="h2" variant="featured-5" weight="bold">Job Description &amp; Requirements</Text>
              <Text color="neutral-faded" attributes={{ style: { whiteSpace: 'pre-line' } }}>{opportunity.description}</Text>
            </View>
            <Divider />
            <View direction="row" justify="space-between">
              <Text variant="caption-1" color="neutral-faded">Opportunity ID: #{opportunity.id}</Text>
              <Text variant="caption-1" color="neutral-faded">Verified Talent Network</Text>
            </View>
          </View>
        </Card>

        <View gap={5}>
          {isManager ? (
            <Card padding={6}>
              <View gap={4}>
                <View gap={1}>
                  <Text as="h2" variant="featured-5" weight="bold">Employer Management View</Text>
                  <Text variant="body-2" color="neutral-faded">
                    You are signed in with employer/administrator credentials. Candidate applications are managed through the dashboard.
                  </Text>
                </View>
                <LifecycleControls opportunity={opportunity} onChange={setOpportunity} />
                <Button color="primary" fullWidth {...routerLink('/dashboard/applications')}>Manage Candidate Pipeline</Button>
                <Divider />
                <CandidatePipeline opportunityId={id} />
              </View>
            </Card>
          ) : !opportunity.accepts_applications ? (
            <Card padding={6}>
              <View gap={2} align="center" textAlign="center">
                <Text as="h2" variant="featured-5" weight="bold">Applications Closed</Text>
                <Text variant="body-2" color="neutral-faded">This listing is no longer accepting applications.</Text>
              </View>
            </Card>
          ) : (
            <Card padding={6}>
              <View gap={4}>
                <View gap={1}>
                  <Text as="h2" variant="featured-5" weight="bold">Apply for Position</Text>
                  <Text variant="body-2" color="neutral-faded">Submit your professional PDF resume for review.</Text>
                </View>
                {message && <Alert color="positive" attributes={{ role: 'status' }}>{message}</Alert>}
                {error && <Alert color="critical" attributes={{ role: 'alert' }}>{error}</Alert>}
                <form onSubmit={handleApply}>
                  <View gap={4}>
                    {!user && (
                      <>
                        <FormControl>
                          <FormControl.Label>Full Name</FormControl.Label>
                          <TextField name="applicant_name" value={applicantName} onChange={({ value }) => setApplicantName(value)} inputAttributes={{ required: true, autoComplete: 'name' }} />
                        </FormControl>
                        <FormControl>
                          <FormControl.Label>Email Address</FormControl.Label>
                          <TextField name="applicant_email" value={applicantEmail} onChange={({ value }) => setApplicantEmail(value)} inputAttributes={{ type: 'email', required: true, autoComplete: 'email' }} />
                        </FormControl>
                      </>
                    )}
                    <View gap={2}>
                      <Text as="label" variant="body-2" weight="medium" attributes={{ htmlFor: 'resume-upload' }}>Upload Resume Document</Text>
                      <input
                        id="resume-upload"
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0] || null;
                          const problem = validateUpload(file, { extension: 'pdf', maxMb: MAX_RESUME_MB, label: 'Resume' });
                          setError(problem);
                          setResume(problem ? null : file);
                          if (problem) e.target.value = '';
                        }}
                      />
                      <Text variant="caption-1" color="neutral-faded">PDF only, maximum {MAX_RESUME_MB} MB.</Text>
                      {resume && <View direction="row" align="center" gap={1}><FileText size={14} aria-hidden="true" /><Text variant="caption-1" color="primary">Selected: {resume.name}</Text></View>}
                    </View>
                    <Button type="submit" color="primary" fullWidth icon={UploadCloud} loading={submitting}>Submit Application</Button>
                  </View>
                </form>
                <Divider />
                <View gap={1}>
                  <Text variant="caption-1" weight="bold">Application Guidelines</Text>
                  <Text variant="caption-1" color="neutral-faded">• Ensure your contact email is up to date in your profile settings.</Text>
                  <Text variant="caption-1" color="neutral-faded">• Applications are reviewed directly by the employer.</Text>
                </View>
              </View>
            </Card>
          )}

          {otherOpportunities.length > 0 && (
            <Card padding={6}>
              <View gap={3}>
                <Text as="h2" variant="body-2" weight="bold">Other Open Roles</Text>
                {otherOpportunities.map((job) => (
                  <Card key={job.id} padding={3} {...routerLink(`${opportunityBasePath}/${job.id}`)}>
                    <View gap={1}>
                      <View direction="row" justify="space-between">
                        <Text variant="caption-1" color="positive" weight="bold">{job.job_type}</Text>
                        <Text variant="caption-1" color="neutral-faded">{job.location || 'Remote'}</Text>
                      </View>
                      <Text variant="body-2" weight="bold" maxLines={1}>{job.title}</Text>
                      <Text variant="caption-1" color="neutral-faded">{job.company_name}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            </Card>
          )}
        </View>
      </Grid>
    </Page>
  );
}

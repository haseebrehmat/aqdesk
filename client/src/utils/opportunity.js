export const STATUS_COLORS = {
  Published: 'positive',
  'Pending Review': 'warning',
  Completed: 'neutral',
  Hired: 'primary',
  Cancelled: 'critical',
  Rejected: 'critical',
  Closed: 'neutral',
};

export const statusLabel = (status) => (status === 'Published' ? 'Open' : status);

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Divider, Grid, Link as RLink, Text, TextField, View } from 'reshaped';
import { Heart } from './icons';
import Logo from './Logo';
import { NativeSelect } from './ui';
import { useBranding } from '../context/BrandingContext';
import api from '../api/axios';

// Direct SVG path components for brands
const GithubIcon = ({ size = 16, className = "" }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const XIcon = ({ size = 16, className = "" }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.98 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
  </svg>
);

function FooterLink({ to, children }) {
  return <RLink color="inherit" variant="plain" render={(attrs) => <Link {...attrs} to={to} />}>{children}</RLink>;
}

export default function PublicFooter() {
  const { appName } = useBranding();
  const [email, setEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [cohort, setCohort] = useState('General');

  const subscribe = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/newsletter/subscribe', { email, cohort });
      setNewsletterMessage(data.message);
      setEmail('');
    } catch (error) {
      setNewsletterMessage(error.response?.data?.message || 'Subscription failed. Please check the email address.');
    }
  };

  const social = [
    { href: 'https://github.com', label: 'GitHub', Icon: GithubIcon },
    { href: 'https://twitter.com', label: 'X', Icon: XIcon },
    { href: 'https://linkedin.com', label: 'LinkedIn', Icon: LinkedinIcon },
  ];

  return (
    <View as="footer" backgroundColor="elevation-base" borderTop>
      <Container width="1200px" padding={{ s: 4, m: 6 }}>
        <View paddingBlock={12} gap={10}>
          <Grid columns={{ s: 1, m: 2, l: '2fr 1fr 1fr 1.5fr' }} gap={8}>
            <View gap={4}>
              <Logo />
              <View maxWidth="380px">
                <Text variant="body-2" color="neutral-faded">
                  {appName} is an all-in-one collaborative learning platform unifying technical Q&amp;A, workspace management, mentorship, and career placements for modern software developers.
                </Text>
              </View>
              <View direction="row" gap={2}>
                {social.map(({ href, label, Icon }) => (
                  <Button key={label} variant="faded" color="neutral" href={href} attributes={{ target: '_blank', rel: 'noreferrer', 'aria-label': `${appName} on ${label}` }}>
                    <Icon size={16} />
                  </Button>
                ))}
              </View>
            </View>

            <View gap={3}>
              <Text variant="caption-1" weight="bold" color="neutral-faded">PLATFORM HUB</Text>
              <FooterLink to="/questions">Community Q&amp;A</FooterLink>
              <FooterLink to="/opportunities">Job Opportunities</FooterLink>
              <FooterLink to="/events">Live Tech Events</FooterLink>
              <FooterLink to="/podcasts">Audio Podcasts</FooterLink>
            </View>

            <View gap={3}>
              <Text variant="caption-1" weight="bold" color="neutral-faded">COMPANY</Text>
              <FooterLink to="/about">About Us</FooterLink>
              {localStorage.getItem('token') ? (
                <FooterLink to="/dashboard">Dashboard</FooterLink>
              ) : (
                <>
                  <FooterLink to="/login">Sign In</FooterLink>
                  <FooterLink to="/register">Create Account</FooterLink>
                </>
              )}
            </View>

            <View gap={3}>
              <Text variant="caption-1" weight="bold" color="neutral-faded">STAY UPDATED</Text>
              <Text variant="body-2" color="neutral-faded">Subscribe to our developer newsletter for weekly tech updates.</Text>
              <form onSubmit={subscribe}>
                <View gap={2}>
                  <TextField
                    name="newsletter-email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={({ value }) => setEmail(value)}
                    inputAttributes={{ type: 'email', required: true, 'aria-label': 'Email address for newsletter' }}
                  />
                  <NativeSelect
                    name="newsletter-cohort"
                    value={cohort}
                    onChange={({ value }) => setCohort(value)}
                    inputAttributes={{ 'aria-label': 'Newsletter topic' }}
                    options={['General', 'AI', 'Web Development', 'EdTech', 'Internet Governance'].map((v) => ({ value: v, label: v }))}
                  />
                  <Button type="submit" color="primary" fullWidth>Subscribe</Button>
                  {newsletterMessage && <Text variant="caption-1" attributes={{ role: 'status' }}>{newsletterMessage}</Text>}
                </View>
              </form>
            </View>
          </Grid>

          <Divider />
          <View direction={{ s: 'column', m: 'row' }} justify="space-between" align="center" gap={2}>
            <Text variant="caption-1" color="neutral-faded">© {new Date().getFullYear()} {appName} Platform. All rights reserved.</Text>
            <View direction="row" align="center" gap={1}>
              <Text variant="caption-1" color="neutral-faded">Engineered with</Text>
              <Heart size={14} color="#e11d48" filled aria-hidden="true" />
              <Text variant="caption-1" color="neutral-faded">for Software Engineers</Text>
            </View>
          </View>
        </View>
      </Container>
    </View>
  );
}

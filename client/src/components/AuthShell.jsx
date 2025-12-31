import { Container, Text, View } from 'reshaped';
import { CheckCircle2 } from './icons';
import Logo from './Logo';

const features = [
  'Real-time Collaborative Workspaces',
  'Peer-to-Peer Technical Q&A',
  'Verified Career Opportunities',
];

// Split-screen layout shared by the sign in and sign up pages.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <View as="main" direction={{ s: 'column', l: 'row' }} align="stretch" backgroundColor="page" attributes={{ style: { minHeight: '100vh' } }}>
      <View
        grow
        backgroundColor="primary-faded"
        padding={{ s: 6, l: 16 }}
        justify="center"
        attributes={{ style: { flexBasis: '50%' } }}
      >
        <View maxWidth="440px" width="100%" attributes={{ style: { margin: '0 auto' } }} gap={8}>
          <Logo size={40} />
          <View gap={3}>
            <Text as="h2" variant="featured-2" weight="bold">Unified Learning &amp; Collaboration Ecosystem</Text>
            <Text variant="body-2" color="neutral-faded">
              Connect with workspaces, engage in peer Q&amp;A discussions, and unlock academic opportunities.
            </Text>
          </View>
          <View gap={3}>
            {features.map((feature) => (
              <View key={feature} direction="row" align="center" gap={2}>
                <CheckCircle2 size={18} color="var(--rs-color-foreground-primary)" />
                <Text variant="body-2">{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View grow padding={{ s: 6, l: 16 }} justify="center" attributes={{ style: { flexBasis: '50%' } }}>
        <Container width="440px" padding={0}>
          <View gap={6}>
            <View gap={2}>
              <Text as="h1" variant="featured-2" weight="bold">{title}</Text>
              <Text variant="body-2" color="neutral-faded">{subtitle}</Text>
            </View>
            {children}
          </View>
        </Container>
      </View>
    </View>
  );
}

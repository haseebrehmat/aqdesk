import { Card, Grid, Text, View } from 'reshaped';
import { Users, Briefcase, Calendar, MessageSquare } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';
import { Page } from '../components/ui';

const features = [
  { icon: MessageSquare, title: 'Community Q&A Engine', text: 'Threaded technical discussions with markdown support, upvoting, and verified solution badges from experienced software engineers.' },
  { icon: Users, title: 'Collaborative Workspaces', text: 'Form development teams, issue secure invitation tokens, upload project assets, and exchange structured peer feedback.' },
  { icon: Briefcase, title: 'Career Opportunities', text: 'A dedicated hiring hub connecting employers directly with students and tech talent through verified applications.' },
  { icon: Calendar, title: 'Events & Consultation', text: 'Schedule 1-on-1 advisory sessions with verified faculty experts and attend live tech workshops.' },
];

export default function PublicAbout() {
  const { appName } = useBranding();
  return (
    <Page width="900px" paddingBlock={12}>
      <View gap={3} align="center" textAlign="center">
        <Text as="h1" variant="featured-1" weight="bold">Bridging Academic Learning &amp; Industry Execution</Text>
        <View maxWidth="640px">
          <Text variant="body-1" color="neutral-faded">
            {appName} is an all-in-one collaborative learning platform uniting technical Q&amp;A, workspace management, mentorship, and career placements.
          </Text>
        </View>
      </View>
      <Grid columns={{ s: 1, m: 2 }} gap={5}>
        {features.map(({ icon: Icon, title, text }) => (
          <Card key={title} padding={6}>
            <View gap={3}>
              <Icon size={24} color="var(--rs-color-foreground-primary)" aria-hidden="true" />
              <Text as="h2" variant="featured-5" weight="bold">{title}</Text>
              <Text variant="body-2" color="neutral-faded">{text}</Text>
            </View>
          </Card>
        ))}
      </Grid>
    </Page>
  );
}

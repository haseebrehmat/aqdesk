import { Link } from 'react-router-dom';
import { Image, Text, View } from 'reshaped';
import { useBranding } from '../context/BrandingContext';

export default function Logo({ size = 32, showName = true, to = '/' }) {
  const { appName, logoUrl } = useBranding();

  return (
    <Link to={to} aria-label={`${appName} home`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <View direction="row" align="center" gap={2}>
        <Image src={logoUrl} alt="" width={`${size}px`} height={`${size}px`} borderRadius="medium" displayMode="contain" />
        {showName && <Text variant="featured-5" weight="bold">{appName}</Text>}
      </View>
    </Link>
  );
}

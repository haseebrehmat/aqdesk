import { Badge, Card, Container, FormControl, Select, Text, TextArea, TextField, View } from 'reshaped';
import { routerLink } from './RouterLink';

// Page width wrapper used by every route.
export function Page({ children, width = '1200px', paddingBlock = 8 }) {
  return (
    <Container width={width} padding={{ s: 4, m: 6, l: 8 }}>
      <View gap={6} paddingBlock={paddingBlock}>{children}</View>
    </Container>
  );
}

// H1 + description + optional action buttons. Every page has exactly one.
export function PageHeader({ title, description, actions }) {
  return (
    <View direction={{ s: 'column', m: 'row' }} align={{ s: 'start', m: 'center' }} justify="space-between" gap={4}>
      <View gap={1} maxWidth="720px">
        <Text as="h1" variant="featured-2" weight="bold">{title}</Text>
        {description && <Text variant="body-2" color="neutral-faded">{description}</Text>}
      </View>
      {actions && <View direction="row" gap={2} wrap>{actions}</View>}
    </View>
  );
}

export function SectionHeading({ eyebrow, title, description, action, align = 'start' }) {
  return (
    <View direction={{ s: 'column', m: 'row' }} justify="space-between" align={{ s: 'start', m: 'end' }} gap={3}>
      <View gap={1} align={align === 'center' ? 'center' : 'start'} attributes={align === 'center' ? { style: { textAlign: 'center', margin: '0 auto' } } : undefined}>
        {eyebrow && <Badge color="primary" variant="faded">{eyebrow}</Badge>}
        <Text as="h2" variant="featured-3" weight="bold">{title}</Text>
        {description && <Text color="neutral-faded">{description}</Text>}
      </View>
      {action}
    </View>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <Card padding={10}>
      <View align="center" gap={2} textAlign="center">
        <Text variant="featured-5" weight="bold">{title}</Text>
        {description && <Text color="neutral-faded">{description}</Text>}
        {action}
      </View>
    </Card>
  );
}

// A Card that navigates with the router.
export function LinkCard({ to, children, padding = 5 }) {
  return (
    <Card padding={padding} height="100%" {...routerLink(to)}>
      {children}
    </Card>
  );
}


// Label + input + validation error in one go. `onChange` receives the plain value.
export function FormField({ label, name, value, onChange, error, type = 'text', multiline = false, rows = 4, options, placeholder, required, min, helper, readOnly }) {
  const id = `field-${name}`;
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <FormControl hasError={!!message}>
      <FormControl.Label>{label}</FormControl.Label>
      {options ? (
        <NativeSelect name={name} value={value} onChange={({ value: v }) => onChange(v)} options={options} inputAttributes={{ id }} />
      ) : multiline ? (
        <TextArea name={name} value={value} placeholder={placeholder} onChange={({ value: v }) => onChange(v)} inputAttributes={{ id, rows, required }} />
      ) : (
        <TextField name={name} value={value} placeholder={placeholder} onChange={({ value: v }) => onChange(v)} inputAttributes={{ id, type, required, min, readOnly }} />
      )}
      {helper && !message && <FormControl.Helper>{helper}</FormControl.Helper>}
      {message && <FormControl.Error>{message}</FormControl.Error>}
    </FormControl>
  );
}

// Native <select> wrapped by Reshaped: fully keyboard/screen-reader accessible.
export function NativeSelect({ options = [], ...props }) {
  return (
    <Select {...props}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
}

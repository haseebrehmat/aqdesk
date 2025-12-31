import { forwardRef } from 'react';

export const MaterialIcon = forwardRef(function MaterialIcon(
  { name, size = 20, filled = false, className = '', style, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={`material-symbols-rounded material-icon${filled ? ' material-icon--filled' : ''}${className ? ` ${className}` : ''}`}
      style={{ fontSize: size, ...style }}
      {...props}
    >
      {name}
    </span>
  );
});

// eslint-disable-next-line react-refresh/only-export-components
export function materialIcon(name) {
  const Icon = forwardRef(function MaterialSymbol(props, ref) {
    return <MaterialIcon ref={ref} name={name} {...props} />;
  });
  Icon.displayName = `MaterialIcon(${name})`;
  return Icon;
}

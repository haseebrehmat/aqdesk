import { createElement } from 'react';
import { Link } from 'react-router-dom';

// Spread onto Reshaped Button / MenuItem / Link / Card to route client-side:
//   <Button {...routerLink('/x')}>Go</Button>
export function routerLink(to, extra = {}) {
  return {
    render: (attrs) => createElement(Link, { ...attrs, ...extra, to }),
  };
}

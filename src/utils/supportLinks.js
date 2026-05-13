const baseSupportLinks = [
  {
    to: '/contact',
    label: 'Contact support',
    note: 'Questions about orders, products, or account help',
  },
  {
    to: '/shipping',
    label: 'Shipping info',
    note: 'Review timing, tracking, and fulfillment basics',
  },
  {
    to: '/returns',
    label: 'Returns info',
    note: 'See how exchanges and returns are handled',
  },
];

export function getSupportLinks(currentUser) {
  return [
    ...baseSupportLinks,
    {
      to: currentUser ? '/account/orders' : '/login',
      label: currentUser ? 'Review orders' : 'Sign in for orders',
      note: 'Keep order details handy while you reach out',
    },
    {
      to: currentUser ? '/account' : '/login',
      label: currentUser ? 'Open account' : 'Sign in',
      note: 'Profile and saved items live together here',
    },
  ];
}

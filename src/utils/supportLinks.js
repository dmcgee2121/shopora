const baseSupportLinks = [
  {
    to: '/contact',
    label: 'Contact us',
    note: 'Questions about orders, products, shipping, or account help',
  },
  {
    to: '/shipping',
    label: 'Shipping info',
    note: 'Review timing, tracking, and fulfillment basics',
  },
  {
    to: '/returns',
    label: 'Returns help',
    note: 'See how exchanges, refunds, and damaged items are handled',
  },
  {
    to: '/privacy',
    label: 'Privacy policy',
    note: 'See how shopper data is handled',
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

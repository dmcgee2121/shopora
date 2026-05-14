const shopDepartmentLinks = [
  { to: '/women', label: 'Women' },
  { to: '/men', label: 'Men' },
  { to: '/shoes', label: 'Shoes' },
  { to: '/accessories', label: 'Accessories' },
];

const retentionSearchLinks = [
  { to: '/search?q=new%20arrivals', label: 'Search new arrivals' },
  { to: '/search?q=sale', label: 'Search sale' },
  { to: '/search?q=women', label: 'Search women' },
  { to: '/search?q=men', label: 'Search men' },
];

export function getCustomerRetentionLinks(currentUser) {
  return {
    continueShopping: { to: '/women', label: 'Continue shopping' },
    browseSale: { to: '/sale', label: 'Browse sale' },
    savedItems: {
      to: currentUser ? '/account/saved' : '/login',
      label: 'View saved items',
    },
    orders: {
      to: currentUser ? '/account/orders' : '/login',
      label: 'View orders',
    },
    account: {
      to: currentUser ? '/account' : '/login',
      label: currentUser ? 'View account' : 'Sign in',
    },
    departmentLinks: shopDepartmentLinks,
    searchLinks: retentionSearchLinks,
  };
}

export function getCustomerNextBestAction({
  currentUser,
  savedCount = 0,
  recentOrdersCount = 0,
  recentlyViewedCount = 0,
} = {}) {
  if (!currentUser) {
    return {
      eyebrow: 'Next best action',
      title: 'Join the ShopOra member experience',
      text: 'Save favorites, revisit orders, and pick up where you left off from one account view.',
      actionLabel: 'Sign in',
      to: '/login',
    };
  }

  if (savedCount > 0) {
    return {
      eyebrow: 'Next best action',
      title: 'Return to your saved favorites',
      text: 'Pick up favorite finds, compare them again, and keep building a short list for later.',
      actionLabel: 'View saved items',
      to: '/account/saved',
    };
  }

  if (recentOrdersCount > 0) {
    return {
      eyebrow: 'Next best action',
      title: 'Review your receipts and keep browsing',
      text: 'Open receipts, confirm details, or shop the next outfit after checking what you already bought.',
      actionLabel: 'View orders',
      to: '/account/orders',
    };
  }

  if (recentlyViewedCount > 0) {
    return {
      eyebrow: 'Next best action',
      title: 'Continue your style trail',
      text: 'Your recent product trail is ready whenever you want to continue exploring.',
      actionLabel: 'Open account',
      to: '/account',
    };
  }

  return {
    eyebrow: 'Next best action',
    title: 'Browse a fresh edit',
    text: 'Start with women, men, shoes, accessories, or sale and keep the session moving.',
    actionLabel: 'Continue shopping',
    to: '/women',
  };
}

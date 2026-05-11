import { getHomepageDepartmentLinks, getRecommendedProducts } from './recommendations';
import {
  scoreEssentialsProduct,
  scoreNewArrivalProduct,
  scoreSaleProduct,
  scoreTrendingProduct,
  uniqueProducts,
} from './merchandising';

const discoveryProfiles = {
  women: {
    eyebrow: "Women's department",
    title: 'Polished layers, soft structure, and everyday ease.',
    description: 'Start with tailored staples, texture, and pieces that move easily from weekday plans to dinner.',
  },
  men: {
    eyebrow: "Men's department",
    title: 'Refined essentials with a smart-casual point of view.',
    description: 'Build from crisp layers, clean knits, and dependable pieces that make daily dressing easier.',
  },
  shoes: {
    eyebrow: 'Shoe department',
    title: 'Finish the outfit from the ground up.',
    description: 'Browse sneakers, boots, loafers, heels, and easy pairs chosen for polish and repeat wear.',
  },
  accessories: {
    eyebrow: 'Accessories department',
    title: 'Small details that make the whole look feel finished.',
    description: 'Find bags, belts, jewelry, and finishing pieces that sharpen a simple outfit fast.',
  },
  sale: {
    eyebrow: 'Sale department',
    title: 'Smart markdowns with clear reasons to shop now.',
    description: 'A focused value edit across departments, sorted toward strong ratings, useful categories, and fresh finds.',
  },
};

const searchSuggestionLinks = [
  { label: 'Blazers', to: '/search?q=blazer' },
  { label: 'Sneakers', to: '/search?q=sneakers' },
  { label: 'Tote bags', to: '/search?q=tote' },
  { label: 'Ivory styles', to: '/search?q=ivory' },
  { label: 'Sale finds', to: '/sale' },
];

function sortByScore(products, scoreFn) {
  return [...products].sort((left, right) => scoreFn(right) - scoreFn(left));
}

function toQueryString(values) {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== false && value !== null && value !== undefined) {
      params.set(key, value === true ? '1' : String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}

function getCategoryPath({ department, saleOnly } = {}) {
  if (saleOnly) return '/sale';
  return department ? `/${department}` : '/search';
}

export function getScopedDiscoveryProducts(products = [], { department, saleOnly = false } = {}) {
  return uniqueProducts(products).filter((product) => {
    if (!product) return false;
    if (department && product.department !== department) return false;
    if (saleOnly && !product.isSale) return false;
    return true;
  });
}

export function getDiscoveryDepartmentLinks() {
  return [...getHomepageDepartmentLinks()];
}

export function getSearchSuggestionLinks() {
  return [...searchSuggestionLinks];
}

export function getCategoryDiscoveryProfile({ title, department, saleOnly = false } = {}) {
  const key = saleOnly ? 'sale' : department;
  const profile = discoveryProfiles[key];

  if (profile) return profile;

  return {
    eyebrow: 'ShopOra discovery',
    title: `${title || 'The edit'} with smarter ways to browse.`,
    description: 'Use curated picks, shortcuts, filters, and sorting to move through the catalog with more intention.',
  };
}

export function getCategoryShortcutLinks({ department, saleOnly = false, categories = [] } = {}) {
  const path = getCategoryPath({ department, saleOnly });
  const primaryCategory = categories[0] ?? '';
  const secondaryCategory = categories[1] ?? '';
  const shortcutLinks = [
    {
      label: 'Top rated',
      description: 'Best-reviewed styles in this edit.',
      to: `${path}${toQueryString({ sort: 'rating' })}`,
    },
    {
      label: 'New arrivals',
      description: 'Fresh pieces to check first.',
      to: `${path}${toQueryString({ status: 'new' })}`,
    },
    {
      label: 'Sale picks',
      description: 'Markdowns worth a closer look.',
      to: saleOnly ? `${path}${toQueryString({ sort: 'priceAsc' })}` : `${path}${toQueryString({ saleOnly: true })}`,
    },
  ];

  if (primaryCategory) {
    shortcutLinks.push({
      label: primaryCategory,
      description: 'Jump into a focused category lane.',
      to: `${path}${toQueryString({ category: primaryCategory })}`,
    });
  }

  if (secondaryCategory) {
    shortcutLinks.push({
      label: secondaryCategory,
      description: 'Explore another strong section.',
      to: `${path}${toQueryString({ category: secondaryCategory })}`,
    });
  }

  return shortcutLinks.slice(0, 5);
}

export function getCategoryDiscovery(products = [], { department, saleOnly = false, limit = 4 } = {}) {
  const scopedProducts = getScopedDiscoveryProducts(products, { department, saleOnly });
  const seeds = department ? [{ department }] : [];
  const newProducts = scopedProducts.filter((product) => product.isNew);
  const saleProducts = scopedProducts.filter((product) => product.isSale);
  const topPicks = getRecommendedProducts(scopedProducts, seeds, { limit });
  const newArrivals = sortByScore(newProducts, scoreNewArrivalProduct).slice(0, limit);
  const salePicks = sortByScore(saleProducts, scoreSaleProduct).slice(0, limit);
  const completeTheLook = getRecommendedProducts(scopedProducts, topPicks.slice(0, 2), {
    excludeIds: topPicks.map((product) => product.id),
    limit,
  });

  return {
    scopedProducts,
    topPicks,
    newArrivals,
    salePicks,
    completeTheLook,
    stats: {
      total: scopedProducts.length,
      newCount: newProducts.length,
      saleCount: saleProducts.length,
      categoryCount: new Set(scopedProducts.map((product) => product.category).filter(Boolean)).size,
    },
  };
}

export function getSearchLandingProducts(products = [], { limit = 4 } = {}) {
  const catalogProducts = uniqueProducts(products);

  return sortByScore(catalogProducts, (product) => scoreTrendingProduct(product) + scoreEssentialsProduct(product)).slice(
    0,
    limit,
  );
}

import { MenuItem, AddOn, Category } from '../types';

// Menu Categories
export const CATEGORIES: { id: Category; name: string; icon: string }[] = [
  { id: 'beverages', name: 'Beverages', icon: '☕' },
  { id: 'snacks', name: 'Snacks', icon: '🍟' },
  { id: 'biryani', name: 'Biryani', icon: '🍛' },
];

// Menu Items
export const MENU_ITEMS: MenuItem[] = [
  // Beverages
  {
    id: 'tea',
    name: 'Tea',
    category: 'beverages',
    fullPrice: 15,
    hasPortions: false,
    hasAddOns: false,
  },
  {
    id: 'coffee',
    name: 'Coffee',
    category: 'beverages',
    fullPrice: 20,
    hasPortions: false,
    hasAddOns: false,
  },
  {
    id: 'cold_coffee',
    name: 'Cold Coffee',
    category: 'beverages',
    fullPrice: 40,
    hasPortions: false,
    hasAddOns: false,
  },
  {
    id: 'lassi',
    name: 'Lassi',
    category: 'beverages',
    fullPrice: 30,
    hasPortions: false,
    hasAddOns: false,
  },
  // Snacks
  {
    id: 'samosa',
    name: 'Samosa',
    category: 'snacks',
    fullPrice: 15,
    hasPortions: false,
    hasAddOns: false,
  },
  {
    id: 'cutlet',
    name: 'Cutlet',
    category: 'snacks',
    fullPrice: 20,
    hasPortions: false,
    hasAddOns: false,
  },
  {
    id: 'puff',
    name: 'Veg Puff',
    category: 'snacks',
    fullPrice: 25,
    hasPortions: false,
    hasAddOns: false,
  },
  {
    id: 'pakora',
    name: 'Pakora',
    category: 'snacks',
    fullPrice: 30,
    hasPortions: false,
    hasAddOns: false,
  },
  // Biryani
  {
    id: 'chicken_biryani',
    name: 'Chicken Biryani',
    category: 'biryani',
    fullPrice: 180,
    halfPrice: 100,
    hasPortions: true,
    hasAddOns: true,
  },
  {
    id: 'mutton_biryani',
    name: 'Mutton Biryani',
    category: 'biryani',
    fullPrice: 250,
    halfPrice: 140,
    hasPortions: true,
    hasAddOns: true,
  },
  {
    id: 'veg_biryani',
    name: 'Veg Biryani',
    category: 'biryani',
    fullPrice: 120,
    halfPrice: 70,
    hasPortions: true,
    hasAddOns: true,
  },
  {
    id: 'egg_biryani',
    name: 'Egg Biryani',
    category: 'biryani',
    fullPrice: 140,
    halfPrice: 80,
    hasPortions: true,
    hasAddOns: true,
  },
];

// Biryani Add-ons
export const ADD_ONS: AddOn[] = [
  {
    id: 'extra_rice',
    name: 'Extra Rice',
    price: 30,
    applicableTo: ['chicken_biryani', 'mutton_biryani', 'veg_biryani', 'egg_biryani'],
  },
  {
    id: 'extra_chicken',
    name: 'Extra Chicken',
    price: 50,
    applicableTo: ['chicken_biryani'],
  },
  {
    id: 'extra_mutton',
    name: 'Extra Mutton',
    price: 70,
    applicableTo: ['mutton_biryani'],
  },
  {
    id: 'raita',
    name: 'Raita',
    price: 20,
    applicableTo: ['chicken_biryani', 'mutton_biryani', 'veg_biryani', 'egg_biryani'],
  },
  {
    id: 'gravy',
    name: 'Extra Gravy',
    price: 25,
    applicableTo: ['chicken_biryani', 'mutton_biryani', 'veg_biryani', 'egg_biryani'],
  },
  {
    id: 'egg',
    name: 'Egg',
    price: 15,
    applicableTo: ['chicken_biryani', 'mutton_biryani', 'veg_biryani'],
  },
];

// Get menu items by category
export const getItemsByCategory = (category: Category): MenuItem[] => {
  return MENU_ITEMS.filter(item => item.category === category);
};

// Get applicable add-ons for an item
export const getAddOnsForItem = (itemId: string): AddOn[] => {
  return ADD_ONS.filter(addon => addon.applicableTo.includes(itemId));
};

import express from 'express';
import mongoose from 'mongoose';
import MenuItem from '../models/menuItemsModel.js';

const router = express.Router();

const FALLBACK_MENU = [
  { name: 'Veg Rice Bowl', price: 450, category: 'rice', healthy: true },
  { name: 'Chicken Kottu', price: 650, category: 'snack', healthy: false },
  { name: 'Fruit Smoothie', price: 350, category: 'beverage', healthy: true },
  { name: 'Chicken Pizza Slice', price: 700, category: 'snack', healthy: false },
  { name: 'Green Salad', price: 500, category: 'other', healthy: true },
];

const FOOD_KEYWORDS = ['rice', 'kottu', 'pizza', 'burger', 'salad', 'smoothie'];

const formatItems = (items) => {
  if (!items.length) return 'No matching items found right now.';
  return items.map((item) => `- ${item.name} (Rs. ${Number(item.price).toFixed(2)})`).join('\n');
};

const getMenuSource = async () => {
  if (mongoose.connection.readyState !== 1) return FALLBACK_MENU;

  try {
    const items = await MenuItem.find({ available: true })
      .select('name price category description')
      .lean();

    if (!items.length) return FALLBACK_MENU;
    return items;
  } catch {
    return FALLBACK_MENU;
  }
};

const buildReply = (message, menuItems) => {
  const text = (message || '').toLowerCase().trim();

  if (!text) {
    return 'Ask me about healthy meals, budget food, fast food, or specific items like rice, kottu, and pizza.';
  }

  if (text.includes('healthy')) {
    const healthyItems = menuItems.filter((item) =>
      item.healthy === true || /salad|smoothie|fruit|veg|vegetable|grilled/.test(item.name.toLowerCase())
    );
    return `Healthy recommendations:\n${formatItems(healthyItems.slice(0, 5))}`;
  }

  if (text.includes('budget') || text.includes('cheap') || text.includes('low price')) {
    const budgetItems = [...menuItems]
      .filter((item) => Number(item.price) <= 600)
      .sort((a, b) => Number(a.price) - Number(b.price));
    return `Budget-friendly options:\n${formatItems(budgetItems.slice(0, 5))}`;
  }

  if (text.includes('fast food')) {
    const fastFoodItems = menuItems.filter((item) =>
      /kottu|pizza|burger|fries|shawarma/.test(item.name.toLowerCase())
    );
    return `Fast food picks:\n${formatItems(fastFoodItems.slice(0, 5))}`;
  }

  const keyword = FOOD_KEYWORDS.find((k) => text.includes(k));
  if (keyword) {
    const matched = menuItems.filter(
      (item) => item.name.toLowerCase().includes(keyword) || item.category?.toLowerCase().includes(keyword)
    );
    return `Results for "${keyword}":\n${formatItems(matched.slice(0, 6))}`;
  }

  const suggestions = [...menuItems].slice(0, 4);
  return `Try these popular items:\n${formatItems(suggestions)}`;
};

router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body || {};
    const menuItems = await getMenuSource();
    const reply = buildReply(message, menuItems);

    res.status(200).json({
      status: 'success',
      data: { reply },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

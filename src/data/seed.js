// src/data/seed.js
//
// Starter items so the app has something on screen from minute one.
// Students replace these with their own as the course goes on.
//
// Image URLs are real TheMealDB thumbnails, which keeps the list looking
// good without anyone needing an API key on day one.

const SEED_ITEMS = [
  {
    id: 'seed-1',
    title: 'Chicken Handi',
    subtitle: 'Indian · Chicken',
    image: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
    tags: ['Indian', 'Chicken'],
    minutes: 45,
    notes: 'Rich tomato and yoghurt base. Do not rush the onions.',
    source: 'seed',          // 'seed' | 'mine' | 'online'
    favourite: false,
  },
  {
    id: 'seed-2',
    title: 'Beef Wellington',
    subtitle: 'British · Beef',
    image: 'https://www.themealdb.com/images/media/meals/vvpprx1487325699.jpg',
    tags: ['British', 'Beef'],
    minutes: 120,
    notes: 'The pastry must be cold. Everything depends on that.',
    source: 'seed',
    favourite: true,
  },
  {
    id: 'seed-3',
    title: 'Vegetable Shepherds Pie',
    subtitle: 'British · Vegetarian',
    image: 'https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg',
    tags: ['British', 'Vegetarian'],
    minutes: 60,
    notes: 'Lentils instead of mince. Nobody notices.',
    source: 'seed',
    favourite: false,
  },
  {
    id: 'seed-4',
    title: 'Teriyaki Chicken Casserole',
    subtitle: 'Japanese · Chicken',
    image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
    tags: ['Japanese', 'Chicken'],
    minutes: 35,
    notes: 'Weeknight version. One tray, no fuss.',
    source: 'seed',
    favourite: false,
  },
  {
    id: 'seed-5',
    title: 'Kapsalon',
    subtitle: 'Dutch · Lamb',
    image: 'https://www.themealdb.com/images/media/meals/sxysrt1468240488.jpg',
    tags: ['Dutch', 'Lamb'],
    minutes: 30,
    notes: 'Chips, meat, cheese, salad. Engineering, not cooking.',
    source: 'seed',
    favourite: false,
  },
  {
    id: 'seed-6',
    title: 'Dal Fry',
    subtitle: 'Indian · Vegetarian',
    image: 'https://www.themealdb.com/images/media/meals/wuxrtu1483564410.jpg',
    tags: ['Indian', 'Vegetarian'],
    minutes: 40,
    notes: 'The tempering at the end is the whole dish.',
    source: 'seed',
    favourite: true,
  },
  {
    id: 'seed-7',
    title: 'Spaghetti Alla Carbonara',
    subtitle: 'Italian · Pasta',
    image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
    tags: ['Italian', 'Pasta'],
    minutes: 25,
    notes: 'No cream. Off the heat before the egg goes in.',
    source: 'seed',
    favourite: false,
  },
  {
    id: 'seed-8',
    title: 'Honey Balsamic Chicken',
    subtitle: 'American · Chicken',
    image: 'https://www.themealdb.com/images/media/meals/1548772327.jpg',
    tags: ['American', 'Chicken'],
    minutes: 50,
    notes: 'Reduce the glaze further than you think you should.',
    source: 'seed',
    favourite: false,
  },
];

export default SEED_ITEMS;
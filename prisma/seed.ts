/**
 * Prisma Seed — inserts realistic test data for all three apps:
 * User App, Store App, Rider App
 *
 * Run: npx ts-node prisma/seed.ts
 *
 * Data volume:
 *  - 30 restaurants  × 32 menu items each  = 960 menu items
 *  - 20 grocery stores × 32 catalog products each = 640 store-product listings
 *  - 50 stores total (for pagination testing at page=1&limit=10)
 */

import { PrismaClient, StoreType, StoreStatus, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const dec = (n: number | string) => new Decimal(n);

function slug(name: string, suffix: string | number = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + (suffix ? `-${suffix}` : '');
}

// ─── Static data arrays ────────────────────────────────────────────────────────

const restaurantDefs = [
  { name: 'Pizza Palace',        subType: 'pizza',      phone: '+923111111111', fee: 99,  lat: '31.4750', lng: '74.4100', addr: 'DHA Phase 5, Main Boulevard' },
  { name: 'Burger Barn',         subType: 'burger',     phone: '+923111111112', fee: 79,  lat: '31.4760', lng: '74.4120', addr: 'Gulberg III, MM Alam Road' },
  { name: 'Karahi House',        subType: 'desi',       phone: '+923111111113', fee: 89,  lat: '31.4770', lng: '74.4130', addr: 'Model Town Link Road' },
  { name: 'Sushi World',         subType: 'japanese',   phone: '+923111111114', fee: 149, lat: '31.4780', lng: '74.4140', addr: 'Johar Town, Block G' },
  { name: 'Taco Fiesta',         subType: 'mexican',    phone: '+923111111115', fee: 99,  lat: '31.4790', lng: '74.4150', addr: 'Liberty Market, Gulberg' },
  { name: 'Biryani Brothers',    subType: 'desi',       phone: '+923111111116', fee: 69,  lat: '31.4800', lng: '74.4160', addr: 'Cavalry Ground, Main Blvd' },
  { name: 'The Grill Station',   subType: 'bbq',        phone: '+923111111117', fee: 119, lat: '31.4810', lng: '74.4170', addr: 'Bahria Town, Phase 4' },
  { name: 'Noodle Nation',       subType: 'chinese',    phone: '+923111111118', fee: 89,  lat: '31.4820', lng: '74.4180', addr: 'Canal Road, near Expo Centre' },
  { name: 'Shawarma Station',    subType: 'arabic',     phone: '+923111111119', fee: 59,  lat: '31.4830', lng: '74.4190', addr: 'DHA Phase 1, Commercial' },
  { name: 'Waffle Wonder',       subType: 'dessert',    phone: '+923111111120', fee: 49,  lat: '31.4840', lng: '74.4200', addr: 'Packages Mall Road' },
  { name: 'Desi Darbar',         subType: 'desi',       phone: '+923111111121', fee: 79,  lat: '31.4850', lng: '74.4210', addr: 'Township, Sector B' },
  { name: 'Lebanese Lounge',     subType: 'arabic',     phone: '+923111111122', fee: 129, lat: '31.4860', lng: '74.4220', addr: 'Gulshan-e-Ravi, Block J' },
  { name: 'Steakhouse Prime',    subType: 'steak',      phone: '+923111111123', fee: 179, lat: '31.4870', lng: '74.4230', addr: 'EME Sector, DHA' },
  { name: 'Wrap & Roll',         subType: 'wraps',      phone: '+923111111124', fee: 59,  lat: '31.4880', lng: '74.4240', addr: 'Allama Iqbal Town, Ravi Block' },
  { name: 'Thai Spice',          subType: 'thai',       phone: '+923111111125', fee: 139, lat: '31.4890', lng: '74.4250', addr: 'Lahore Cantt, Sarwar Road' },
  { name: 'Pasta Point',         subType: 'italian',    phone: '+923111111126', fee: 109, lat: '31.4900', lng: '74.4260', addr: 'Wapda Town, Block H' },
  { name: 'Chaat Chowk',         subType: 'street',     phone: '+923111111127', fee: 39,  lat: '31.4910', lng: '74.4270', addr: 'Anarkali Bazar, Food Street' },
  { name: 'Seafood Shack',       subType: 'seafood',    phone: '+923111111128', fee: 159, lat: '31.4920', lng: '74.4280', addr: 'Clifton, Block 4' },
  { name: 'Peri Peri Plus',      subType: 'chicken',    phone: '+923111111129', fee: 89,  lat: '31.4930', lng: '74.4290', addr: 'Garden Town, Barkat Market' },
  { name: 'The Breakfast Club',  subType: 'breakfast',  phone: '+923111111130', fee: 69,  lat: '31.4940', lng: '74.4300', addr: 'Johar Town, H Block Market' },
  // 10 additional restaurants
  { name: 'Hot Wok Express',      subType: 'chinese',    phone: '+923111111131', fee: 79,  lat: '31.4950', lng: '74.4310', addr: 'DHA Phase 2, Commercial' },
  { name: 'Tikka Town',           subType: 'desi',       phone: '+923111111132', fee: 69,  lat: '31.4960', lng: '74.4320', addr: 'Gulberg V, Jail Road' },
  { name: 'Crepe Corner',         subType: 'dessert',    phone: '+923111111133', fee: 59,  lat: '31.4970', lng: '74.4330', addr: 'Model Town, H Block' },
  { name: 'Qorma & Co',          subType: 'desi',       phone: '+923111111134', fee: 89,  lat: '31.4980', lng: '74.4340', addr: 'Gulshan-e-Iqbal, Block 13' },
  { name: 'Falafel Factory',      subType: 'arabic',     phone: '+923111111135', fee: 79,  lat: '31.4990', lng: '74.4350', addr: 'Bahria Town, Phase 1' },
  { name: 'Wings & Things',       subType: 'chicken',    phone: '+923111111136', fee: 89,  lat: '31.5000', lng: '74.4360', addr: 'DHA Phase 8, CCA' },
  { name: 'Ramen Republic',       subType: 'japanese',   phone: '+923111111137', fee: 129, lat: '31.5010', lng: '74.4370', addr: 'Canal View Housing, Block C' },
  { name: 'Zaiqa Grill',          subType: 'bbq',        phone: '+923111111138', fee: 99,  lat: '31.5020', lng: '74.4380', addr: 'Faisal Town, F Block Market' },
  { name: 'Smoothie Bar',         subType: 'healthy',    phone: '+923111111139', fee: 49,  lat: '31.5030', lng: '74.4390', addr: 'Johar Town, M Block' },
  { name: 'Mughal Darbar',        subType: 'desi',       phone: '+923111111140', fee: 99,  lat: '31.5040', lng: '74.4400', addr: 'Allama Iqbal Town, Karim Block' },
];

const groceryDefs = [
  { name: 'Fresh Mart',      subType: 'supermarket', phone: '+923122222221', fee: 49, lat: '31.4800', lng: '74.4150', addr: 'DHA Phase 6, Block D' },
  { name: 'Daily Needs',     subType: 'grocery',     phone: '+923122222222', fee: 39, lat: '31.4810', lng: '74.4155', addr: 'Gulberg II, Main Market' },
  { name: 'QuickBasket',     subType: 'grocery',     phone: '+923122222223', fee: 29, lat: '31.4820', lng: '74.4160', addr: 'Model Town, Commercial Zone' },
  { name: 'MegaMart',        subType: 'supermarket', phone: '+923122222224', fee: 59, lat: '31.4830', lng: '74.4165', addr: 'Johar Town, G Block' },
  { name: 'Corner Store',    subType: 'convenience', phone: '+923122222225', fee: 29, lat: '31.4840', lng: '74.4170', addr: 'Cavalry Ground, Ext' },
  { name: 'Nature\'s Basket',subType: 'organic',     phone: '+923122222226', fee: 69, lat: '31.4850', lng: '74.4175', addr: 'Bahria Town, Phase 7' },
  { name: 'Smart Grocery',   subType: 'grocery',     phone: '+923122222227', fee: 39, lat: '31.4860', lng: '74.4180', addr: 'DHA Phase 3, Commercial' },
  { name: 'Value Store',     subType: 'discount',    phone: '+923122222228', fee: 29, lat: '31.4870', lng: '74.4185', addr: 'Township, Block C' },
  { name: 'HyperLocal',      subType: 'supermarket', phone: '+923122222229', fee: 49, lat: '31.4880', lng: '74.4190', addr: 'Cantt, Empress Road' },
  { name: 'Green Grocer',    subType: 'organic',     phone: '+923122222230', fee: 59, lat: '31.4890', lng: '74.4195', addr: 'Garden Town, Main Blvd' },
  // 10 additional grocery stores
  { name: 'SpeedShop',       subType: 'convenience', phone: '+923122222231', fee: 29, lat: '31.4900', lng: '74.4200', addr: 'DHA Phase 4, Y Block' },
  { name: 'FreshBox',        subType: 'grocery',     phone: '+923122222232', fee: 39, lat: '31.4910', lng: '74.4205', addr: 'Gulberg I, Shadman Road' },
  { name: 'PantryPro',       subType: 'supermarket', phone: '+923122222233', fee: 49, lat: '31.4920', lng: '74.4210', addr: 'Johar Town, D Block Market' },
  { name: 'Budget Bazaar',   subType: 'discount',    phone: '+923122222234', fee: 19, lat: '31.4930', lng: '74.4215', addr: 'Township, A Block' },
  { name: 'Organic Oasis',   subType: 'organic',     phone: '+923122222235', fee: 69, lat: '31.4940', lng: '74.4220', addr: 'Bahria Town, Phase 2' },
  { name: 'CartKing',        subType: 'supermarket', phone: '+923122222236', fee: 49, lat: '31.4950', lng: '74.4225', addr: 'Canal View, Block B' },
  { name: 'Minute Mart',     subType: 'convenience', phone: '+923122222237', fee: 29, lat: '31.4960', lng: '74.4230', addr: 'Wapda Town, G Block' },
  { name: 'Farmgate Fresh',  subType: 'organic',     phone: '+923122222238', fee: 59, lat: '31.4970', lng: '74.4235', addr: 'Faisal Town, A Block' },
  { name: 'DealsMart',       subType: 'discount',    phone: '+923122222239', fee: 19, lat: '31.4980', lng: '74.4240', addr: 'Allama Iqbal Town, Zafar Block' },
  { name: 'NearbyStore',     subType: 'grocery',     phone: '+923122222240', fee: 39, lat: '31.4990', lng: '74.4245', addr: 'Cavalry Ground, Sarwar Colony' },
];

// 32 menu items per restaurant — structured across varied categories
const menuItemTemplates = [
  // Pizzas
  { name: 'Margherita Pizza',        category: 'Pizza',    price: 799,  desc: 'Classic tomato sauce, mozzarella, fresh basil' },
  { name: 'Pepperoni Pizza',         category: 'Pizza',    price: 999,  desc: 'Loaded with pepperoni slices and melted cheese' },
  { name: 'BBQ Chicken Pizza',       category: 'Pizza',    price: 1099, desc: 'Smoky BBQ base with grilled chicken and onions' },
  { name: 'Veggie Supreme Pizza',    category: 'Pizza',    price: 849,  desc: 'Bell peppers, mushrooms, olives on tomato base' },
  { name: 'Four Cheese Pizza',       category: 'Pizza',    price: 1199, desc: 'Mozzarella, cheddar, parmesan, ricotta blend' },
  // Burgers
  { name: 'Classic Beef Burger',     category: 'Burger',   price: 549,  desc: 'Juicy beef patty with lettuce, tomato, pickles' },
  { name: 'Crispy Chicken Burger',   category: 'Burger',   price: 499,  desc: 'Crunchy fried chicken with coleslaw and mayo' },
  { name: 'Double Smash Burger',     category: 'Burger',   price: 799,  desc: 'Two smashed patties with special sauce' },
  { name: 'Mushroom Swiss Burger',   category: 'Burger',   price: 649,  desc: 'Beef patty with sautéed mushrooms and Swiss cheese' },
  { name: 'BBQ Bacon Burger',        category: 'Burger',   price: 749,  desc: 'Beef patty with smoky bacon and BBQ sauce' },
  // Desi
  { name: 'Chicken Karahi',          category: 'Desi',     price: 1299, desc: 'Slow-cooked chicken in spiced tomato gravy' },
  { name: 'Beef Nihari',             category: 'Desi',     price: 799,  desc: 'Slow-braised beef shank with nalli' },
  { name: 'Mutton Biryani',          category: 'Desi',     price: 699,  desc: 'Fragrant basmati rice with tender mutton' },
  { name: 'Chicken Tikka',           category: 'Desi',     price: 899,  desc: 'Marinated chicken grilled in tandoor, half portion' },
  { name: 'Seekh Kebab (6 pcs)',     category: 'Desi',     price: 649,  desc: 'Spiced minced beef kebabs off the grill' },
  // Wraps & Sandwiches
  { name: 'Shawarma Wrap',           category: 'Wraps',    price: 349,  desc: 'Chicken shawarma with garlic sauce and veggies' },
  { name: 'Club Sandwich',           category: 'Wraps',    price: 449,  desc: 'Triple-decker with chicken, egg, cheese, lettuce' },
  { name: 'Beef Shawarma',           category: 'Wraps',    price: 399,  desc: 'Slow-roasted beef with tahini and pickles' },
  { name: 'Falafel Wrap',            category: 'Wraps',    price: 299,  desc: 'Crispy falafel, hummus, fresh veggies in pita' },
  { name: 'Panini',                  category: 'Wraps',    price: 399,  desc: 'Grilled Italian sandwich with mozzarella and pesto' },
  // Sides
  { name: 'Garlic Bread',            category: 'Sides',    price: 199,  desc: 'Toasted baguette with garlic herb butter' },
  { name: 'Loaded Fries',            category: 'Sides',    price: 349,  desc: 'Crispy fries topped with cheese sauce and jalapeños' },
  { name: 'Onion Rings',             category: 'Sides',    price: 249,  desc: 'Battered and fried golden onion rings' },
  { name: 'Caesar Salad',            category: 'Sides',    price: 399,  desc: 'Romaine, croutons, parmesan, caesar dressing' },
  { name: 'Coleslaw',                category: 'Sides',    price: 149,  desc: 'Creamy cabbage and carrot slaw' },
  // Drinks
  { name: 'Mint Lemonade',           category: 'Drinks',   price: 249,  desc: 'Freshly squeezed lemon with mint and sugar' },
  { name: 'Mango Lassi',             category: 'Drinks',   price: 199,  desc: 'Thick yogurt blended with fresh mango pulp' },
  { name: 'Cold Coffee',             category: 'Drinks',   price: 299,  desc: 'Blended iced coffee with cream' },
  { name: 'Fresh Orange Juice',      category: 'Drinks',   price: 229,  desc: 'Freshly squeezed orange juice, no sugar' },
  { name: 'Strawberry Milkshake',    category: 'Drinks',   price: 329,  desc: 'Thick strawberry shake with vanilla ice cream' },
  // Desserts
  { name: 'Chocolate Lava Cake',     category: 'Dessert',  price: 349,  desc: 'Warm chocolate cake with molten center' },
  { name: 'Gulab Jamun (4 pcs)',     category: 'Dessert',  price: 199,  desc: 'Soft milk-solid balls in rose-flavored syrup' },
];

// 32 catalog products for grocery stores
const catalogProductDefs = [
  // Dairy
  { name: 'Olpers Full Cream Milk 1L',       cat: 'Dairy',     brand: 'Olpers',      price: 249 },
  { name: 'Nestle Milkpak UHT Milk 1L',      cat: 'Dairy',     brand: 'Milkpak',     price: 239 },
  { name: 'Tarang Tea Whitener 1kg',          cat: 'Dairy',     brand: 'Tarang',      price: 480 },
  { name: 'Adams Butter 200g',                cat: 'Dairy',     brand: 'Adams',       price: 199 },
  { name: 'Nurpur Cheddar Cheese 400g',       cat: 'Dairy',     brand: 'Nurpur',      price: 549 },
  { name: 'Farm Fresh Eggs 12pcs',            cat: 'Dairy',     brand: 'Farm Fresh',  price: 329 },
  // Bakery
  { name: 'Bake Parlor White Bread',          cat: 'Bakery',    brand: 'Bake Parlor', price: 89  },
  { name: 'English Biscuits Garibaldi',       cat: 'Bakery',    brand: 'English',     price: 65  },
  { name: 'Peek Freans Sooper',               cat: 'Bakery',    brand: 'Peek Freans', price: 75  },
  { name: 'LU Prince Chocolate',              cat: 'Bakery',    brand: 'LU',          price: 80  },
  // Beverages
  { name: 'Coca-Cola 1.5L',                   cat: 'Beverages', brand: 'Coca-Cola',   price: 150 },
  { name: 'Pepsi 1.5L',                       cat: 'Beverages', brand: 'Pepsi',       price: 145 },
  { name: '7UP 1.5L',                         cat: 'Beverages', brand: '7UP',         price: 145 },
  { name: 'Nestlé Pure Life Water 1.5L',      cat: 'Beverages', brand: 'Nestlé',      price: 60  },
  { name: 'Shezan Apple Juice 1L',            cat: 'Beverages', brand: 'Shezan',      price: 179 },
  { name: 'Sting Energy Drink 250ml',         cat: 'Beverages', brand: 'Sting',       price: 80  },
  // Staples
  { name: 'Basmati Rice 5kg',                 cat: 'Staples',   brand: 'Guard',       price: 1250 },
  { name: 'Sunridge Cooking Oil 5L',          cat: 'Staples',   brand: 'Sunridge',    price: 1799 },
  { name: 'Habib Sugar 1kg',                  cat: 'Staples',   brand: 'Habib',       price: 149 },
  { name: 'Shan Biryani Masala',              cat: 'Staples',   brand: 'Shan',        price: 85  },
  { name: 'Shan Karahi Masala',               cat: 'Staples',   brand: 'Shan',        price: 75  },
  { name: 'National Salt 800g',               cat: 'Staples',   brand: 'National',    price: 55  },
  // Snacks
  { name: 'Lays Classic Salted 100g',         cat: 'Snacks',    brand: 'Lays',        price: 110 },
  { name: 'Kurkure Chutney Chaska 80g',       cat: 'Snacks',    brand: 'Kurkure',     price: 80  },
  { name: 'Peanuts Roasted 200g',             cat: 'Snacks',    brand: 'Bayara',      price: 149 },
  { name: 'Nimko Mix 250g',                   cat: 'Snacks',    brand: 'Kolson',      price: 120 },
  // Personal Care
  { name: 'Head & Shoulders Shampoo 400ml',   cat: 'Personal',  brand: 'H&S',         price: 650 },
  { name: 'Surf Excel Detergent 1kg',         cat: 'Personal',  brand: 'Surf Excel',  price: 399 },
  { name: 'Lifebuoy Soap 175g',               cat: 'Personal',  brand: 'Lifebuoy',    price: 89  },
  { name: 'Colgate Total Toothpaste 150ml',   cat: 'Personal',  brand: 'Colgate',     price: 229 },
  // Frozen
  { name: 'K&N\'s Chicken Nuggets 500g',      cat: 'Frozen',    brand: "K&N's",       price: 649 },
  { name: 'Meezan Beef Burger Patties 4pcs',  cat: 'Frozen',    brand: 'Meezan',      price: 499 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🌱  Seeding database...');

  // ── Cleanup ────────────────────────────────────────────────────────────────
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.store.deleteMany();
  await prisma.catalogProduct.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹  Cleaned existing data');

  // ── Users ─────────────────────────────────────────────────────────────────
  const user1 = await prisma.user.create({
    data: { phone: '+923001234567', name: 'Ahmed Khan', role: 'CUSTOMER' },
  });
  const user2 = await prisma.user.create({
    data: { phone: '+923007654321', name: 'Sara Ali', role: 'CUSTOMER' },
  });
  const user3 = await prisma.user.create({
    data: { phone: '+923009876543', name: 'Zara Malik', role: 'CUSTOMER' },
  });
  console.log('✅  Users created:', user1.id, user2.id, user3.id);

  // ── Addresses ─────────────────────────────────────────────────────────────
  const address1 = await prisma.address.create({
    data: {
      userId: user1.id, label: 'Home',
      street: '123 Defence Housing Society', city: 'Lahore', state: 'Punjab',
      latitude: dec('31.4697'), longitude: dec('74.4089'),
    },
  });
  await prisma.address.create({
    data: {
      userId: user1.id, label: 'Office',
      street: 'Arfa Software Technology Park, Ferozepur Road', city: 'Lahore', state: 'Punjab',
      latitude: dec('31.5204'), longitude: dec('74.3587'),
    },
  });
  await prisma.address.create({
    data: {
      userId: user2.id, label: 'Home',
      street: 'Gulberg III, MM Alam Road', city: 'Lahore', state: 'Punjab',
      latitude: dec('31.5100'), longitude: dec('74.3450'),
    },
  });
  await prisma.address.create({
    data: {
      userId: user3.id, label: 'Home',
      street: 'Bahria Town, Phase 4', city: 'Lahore', state: 'Punjab',
      latitude: dec('31.3730'), longitude: dec('74.1980'),
    },
  });
  console.log('✅  Addresses created');

  // ── Catalog Products (global — shared across grocery stores) ───────────────
  const catalogProducts = await Promise.all(
    catalogProductDefs.map((p, i) =>
      prisma.catalogProduct.create({
        data: {
          name: p.name,
          slug: slug(p.name, i + 1),
          category: p.cat,
          brand: p.brand,
        },
      })
    )
  );
  console.log(`✅  Catalog products created: ${catalogProducts.length}`);

  // ── Restaurants (20) ──────────────────────────────────────────────────────
  const restaurants: Awaited<ReturnType<typeof prisma.store.create>>[] = [];

  for (const def of restaurantDefs) {
    const store = await prisma.store.create({
      data: {
        name: def.name,
        slug: slug(def.name),
        description: `${def.name} — delicious ${def.subType} delivered to your door`,
        phone: def.phone,
        type: StoreType.RESTAURANT,
        subType: def.subType,
        status: StoreStatus.ACTIVE,
        isOpen: true,
        latitude: dec(def.lat),
        longitude: dec(def.lng),
        addressLine: def.addr,
        city: 'Lahore',
        deliveryRadiusKm: dec('5.00'),
        deliveryFeePkr: dec(def.fee),
        logoUrl: `https://placehold.co/200x200?text=${encodeURIComponent(def.name)}`,
      },
    });
    restaurants.push(store);

    // 32 menu items per restaurant
    await prisma.menuItem.createMany({
      data: menuItemTemplates.map((item) => ({
        storeId: store.id,
        name: item.name,
        description: item.desc,
        category: item.category,
        pricePkr: dec(item.price),
        isActive: true,
      })),
    });
  }
  console.log(`✅  Restaurants created: ${restaurants.length} × 32 menu items`);

  // ── Grocery Stores (10) ────────────────────────────────────────────────────
  const groceryStores: Awaited<ReturnType<typeof prisma.store.create>>[] = [];

  for (const def of groceryDefs) {
    const store = await prisma.store.create({
      data: {
        name: def.name,
        slug: slug(def.name),
        description: `${def.name} — your local ${def.subType} with fast delivery`,
        phone: def.phone,
        type: StoreType.STORE,
        subType: def.subType,
        status: StoreStatus.ACTIVE,
        isOpen: true,
        latitude: dec(def.lat),
        longitude: dec(def.lng),
        addressLine: def.addr,
        city: 'Lahore',
        deliveryRadiusKm: dec('3.00'),
        deliveryFeePkr: dec(def.fee),
        logoUrl: `https://placehold.co/200x200?text=${encodeURIComponent(def.name)}`,
      },
    });
    groceryStores.push(store);

    // All 32 catalog products listed in each grocery store
    await prisma.storeProduct.createMany({
      data: catalogProducts.map((cp, i) => ({
        storeId: store.id,
        productId: cp.id,
        pricePkr: dec(catalogProductDefs[i].price),
        isActive: true,
      })),
    });
  }
  console.log(`✅  Grocery stores created: ${groceryStores.length} × 32 products`);

  // ── Riders (2 per restaurant, 1 per grocery store) ────────────────────────
  const riderPhoneBase = 9000000000;
  let riderIdx = 0;

  const riders: Awaited<ReturnType<typeof prisma.rider.create>>[] = [];

  for (const store of restaurants) {
    for (let r = 0; r < 2; r++) {
      const rider = await prisma.rider.create({
        data: {
          phone: `+92${riderPhoneBase + riderIdx}`,
          name: `Rider ${riderIdx + 1}`,
          storeId: store.id,
          isAvailable: true,
          latitude: dec(parseFloat('31.4750') + riderIdx * 0.0001),
          longitude: dec(parseFloat('74.4100') + riderIdx * 0.0001),
        },
      });
      riders.push(rider);
      riderIdx++;
    }
  }
  for (const store of groceryStores) {
    const rider = await prisma.rider.create({
      data: {
        phone: `+92${riderPhoneBase + riderIdx}`,
        name: `Rider ${riderIdx + 1}`,
        storeId: store.id,
        isAvailable: true,
        latitude: dec(parseFloat('31.4800') + riderIdx * 0.0001),
        longitude: dec(parseFloat('74.4150') + riderIdx * 0.0001),
      },
    });
    riders.push(rider);
    riderIdx++;
  }
  console.log(`✅  Riders created: ${riders.length}`);

  // ── Sample Orders ─────────────────────────────────────────────────────────
  // Pizza Palace (first restaurant) — DELIVERED
  const pizzaMenu = await prisma.menuItem.findMany({ where: { storeId: restaurants[0].id }, take: 2 });
  const restaurantOrder = await prisma.order.create({
    data: {
      customerId: user1.id,
      storeId: restaurants[0].id,
      riderId: riders[0].id,
      addressId: address1.id,
      status: 'DELIVERED',
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      subtotalPkr: dec('1798.00'),
      deliveryFeePkr: dec('99.00'),
      totalPkr: dec('1897.00'),
      items: {
        create: pizzaMenu.map((item) => ({
          menuItemId: item.id,
          quantity: 1,
          unitPricePkr: item.pricePkr,
          totalPkr: item.pricePkr,
        })),
      },
    },
  });

  // Fresh Mart (first grocery store) — PLACED
  const groceryProducts = await prisma.storeProduct.findMany({ where: { storeId: groceryStores[0].id }, take: 3 });
  const groceryOrder = await prisma.order.create({
    data: {
      customerId: user1.id,
      storeId: groceryStores[0].id,
      riderId: riders[40].id,
      addressId: address1.id,
      status: 'PLACED',
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      subtotalPkr: dec('667.00'),
      deliveryFeePkr: dec('49.00'),
      totalPkr: dec('716.00'),
      items: {
        create: groceryProducts.map((sp) => ({
          storeProductId: sp.id,
          quantity: 1,
          unitPricePkr: sp.pricePkr,
          totalPkr: sp.pricePkr,
        })),
      },
    },
  });
  console.log('✅  Sample orders created');

  // ── Favorites ─────────────────────────────────────────────────────────────
  await prisma.favorite.createMany({
    data: [
      { userId: user1.id, storeId: restaurants[0].id },
      { userId: user1.id, storeId: restaurants[1].id },
      { userId: user1.id, storeId: groceryStores[0].id },
      { userId: user2.id, storeId: restaurants[2].id },
      { userId: user2.id, storeId: groceryStores[1].id },
    ],
  });
  console.log('✅  Favorites created');

  // ── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        receiverType: 'USER', receiverId: user1.id,
        title: 'Order Delivered!',
        body: `Your order #${restaurantOrder.id.slice(-6)} from Pizza Palace has been delivered.`,
        userId: user1.id,
      },
      {
        receiverType: 'STORE', receiverId: restaurants[0].id,
        title: 'New Order Received',
        body: `You have a new order worth PKR 1,897.`,
      },
      {
        receiverType: 'RIDER', receiverId: riders[0].id,
        title: 'Order Assigned',
        body: `You have been assigned order #${restaurantOrder.id.slice(-6)}.`,
      },
      {
        receiverType: 'USER', receiverId: user1.id,
        title: 'Order Placed',
        body: `Your grocery order #${groceryOrder.id.slice(-6)} from Fresh Mart is confirmed.`,
        userId: user1.id,
      },
    ],
  });
  console.log('✅  Notifications created');

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalStores = restaurants.length + groceryStores.length;
  const totalMenuItems = await prisma.menuItem.count();
  const totalStoreProducts = await prisma.storeProduct.count();

  console.log('\n🎉  Seed complete!\n');
  console.log(`📊  Totals:`);
  console.log(`     Stores:         ${totalStores} (${restaurants.length} restaurants + ${groceryStores.length} grocery)`);
  console.log(`     Menu items:     ${totalMenuItems}`);
  console.log(`     Store products: ${totalStoreProducts}`);
  console.log(`     Riders:         ${riders.length}`);
  console.log(`\n📞  Auth phones for testing:`);
  console.log(`     User (customer):           +923001234567`);
  console.log(`     Restaurant (Pizza Palace): +923111111111`);
  console.log(`     Grocery (Fresh Mart):      +923122222221`);
  console.log(`     Rider:                     +929000000000`);
  console.log(`\n🆔  Key IDs:`);
  console.log(`     Restaurant store ID: ${restaurants[0].id}`);
  console.log(`     Grocery store ID:    ${groceryStores[0].id}`);
  console.log(`     User ID:             ${user1.id}`);
  console.log(`     Address ID:          ${address1.id}`);
  console.log(`     Delivered order ID:  ${restaurantOrder.id}`);
  console.log(`     Placed order ID:     ${groceryOrder.id}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

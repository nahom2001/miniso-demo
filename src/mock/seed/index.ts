import { faker } from '@faker-js/faker'
import type {
  User, Category, Product, Variant, StockItem, Order, OrderItem, OrderStatus,
  Payment, Refund, ReturnRequest, Review, Coupon, Banner, Campaign, DeliveryZone,
  DeliveryPartner, Notification, Backup, AuditEntry, WishlistItem, Address,
  SyncLogEntry
} from '@/domain/types'
import type { CurrencyCode } from '@/config/currencies'

faker.seed(42) // deterministic

// ─── Categories ──────────────────────────────────────────────────────────────
export const categories: Category[] = [
  { id: 'cat-1', parentId: null, name: { en: 'Plush Toys', am: 'ፕለሽ አሻንጉሊቶች' }, slug: 'plush-toys', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', seo: { slug: 'plush-toys', metaTitle: 'Plush Toys - Miniso', metaDescription: 'Cute plush toys' }, productCount: 12 },
  { id: 'cat-2', parentId: null, name: { en: 'Stationery', am: 'ጽሕፈት መሳሪያ' }, slug: 'stationery', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=300&fit=crop', seo: { slug: 'stationery', metaTitle: 'Stationery - Miniso', metaDescription: 'Pens, notebooks, and more' }, productCount: 10 },
  { id: 'cat-3', parentId: null, name: { en: 'Beauty & Skincare', am: 'ቆዳ እንክብካቤ' }, slug: 'beauty', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=300&fit=crop', seo: { slug: 'beauty', metaTitle: 'Beauty - Miniso', metaDescription: 'Skincare and beauty products' }, productCount: 14 },
  { id: 'cat-4', parentId: null, name: { en: 'Home & Living', am: 'ቤት እና ኑሮ' }, slug: 'home', image: 'https://images.unsplash.com/photo-1603905756157-f6a8b70af7b0?w=400&h=300&fit=crop', seo: { slug: 'home', metaTitle: 'Home & Living - Miniso', metaDescription: 'Home decoration and living essentials' }, productCount: 11 },
  { id: 'cat-5', parentId: null, name: { en: 'Electronics Accessories', am: 'ኤሌክትሮኒክስ ዕቃዎች' }, slug: 'electronics', image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=300&fit=crop', seo: { slug: 'electronics', metaTitle: 'Electronics - Miniso', metaDescription: 'Phone accessories and gadgets' }, productCount: 8 },
  { id: 'cat-6', parentId: null, name: { en: 'Snacks & Food', am: 'መክሰስ እና ምግብ' }, slug: 'snacks', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', seo: { slug: 'snacks', metaTitle: 'Snacks - Miniso', metaDescription: 'Japanese snacks and more' }, productCount: 6 },
  { id: 'cat-7', parentId: null, name: { en: 'Fashion Accessories', am: 'የፋሽን ዕቃዎች' }, slug: 'fashion', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop', seo: { slug: 'fashion', metaTitle: 'Fashion - Miniso', metaDescription: 'Bags, hats, and accessories' }, productCount: 9 },
  { id: 'cat-8', parentId: null, name: { en: 'Digital Vouchers', am: 'ዲጂታል ቫውቸር' }, slug: 'vouchers', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=300&fit=crop', seo: { slug: 'vouchers', metaTitle: 'Vouchers - Miniso', metaDescription: 'Gift vouchers and e-cards' }, productCount: 5 },
]

const amharicProductNames: Record<string, string> = {
  'Corgi Plush Toy': 'ኮርጂ አሻንጉሊት',
  'Avocado Plush Pillow': 'አቭካዶ ትራስ',
  'Totoro Stuffed Animal': 'ቶቶሮ አሻንጉሊት',
  'Kawaii Bear Plush': 'ካዋይ ድብ አሻንጉሊት',
  'Notebook Set A5': 'ኖትቡክ ስብስብ A5',
  'Color Pen Set 24': '24 ቀለም ብዕር ስብስብ',
  'Sticky Notes Pack': 'ተለጣፊ ወረቀት ፓኬት',
  'Planner 2025': '2025 ዕቅድ ደብተር',
  'Rose Face Mask': 'የሮዝ ፊት ጭምብል',
  'Lip Balm Set': 'የከንፈር ሽፋን ስብስብ',
  'Moisturizing Cream': 'ቆዳ ማለስለሻ ክሬም',
  'Eye Shadow Palette': 'የዓይን ጥላ ፓሌት',
  'Aromatherapy Diffuser': 'አሮማ ዲፍዩዘር',
  'Ceramic Mug': 'ሴራሚክ ኩባያ',
  'Storage Box Set': 'የማስቀመጫ ሳጥን ስብስብ',
  'Scented Candle': 'መዓዛ ሻማ',
  'Phone Stand': 'ስልክ መደገፊያ',
  'USB-C Cable': 'USB-C ገመድ',
  'Earphones': 'ጆሮ ማዳመጫ',
  'Power Bank 10000': '10000mAh የባትሪ ምንጭ',
  'Matcha KitKat': 'ማቻ ኪትካት',
  'Pocky Sticks': 'ፖኪ ዱላዎች',
  'Mochi Ice Cream': 'ሞቺ አይስ ክሬም',
  'Mini Crossbody Bag': 'ሚኒ ቦርሳ',
  'Baseball Cap': 'ቤዝቦል ኮፍያ',
  'Miniso Gift Voucher 500': '500 ብር የስጦታ ቫውቸር',
  'Miniso Gift Voucher 1000': '1000 ብር የስጦታ ቫውቸር',
  'E-Gift Card': 'ኤሌክትሮኒክ ስጦታ ካርድ',
}

function amName(en: string): string {
  return amharicProductNames[en] ?? en + ' (AM)'
}

const productTemplates = [
  // Plush Toys
  { name: 'Corgi Plush Toy', cat: 'cat-1', price: 850, tags: ['kawaii', 'dog', 'toy'],
    imgs: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1599623560574-39d485900c95?w=600&h=600&fit=crop'] },
  { name: 'Avocado Plush Pillow', cat: 'cat-1', price: 650, tags: ['pillow', 'food', 'cute'],
    imgs: ['https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop'] },
  { name: 'Totoro Stuffed Animal', cat: 'cat-1', price: 1200, tags: ['totoro', 'anime', 'toy'],
    imgs: ['https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=600&fit=crop'] },
  { name: 'Kawaii Bear Plush', cat: 'cat-1', price: 750, tags: ['bear', 'kawaii'],
    imgs: ['https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'] },

  // Stationery
  { name: 'Notebook Set A5', cat: 'cat-2', price: 320, tags: ['notebook', 'school'],
    imgs: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1517971071642-34a2d3eaac27?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=600&fit=crop'] },
  { name: 'Color Pen Set 24', cat: 'cat-2', price: 480, tags: ['pen', 'color', 'art'],
    imgs: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&h=600&fit=crop'] },
  { name: 'Sticky Notes Pack', cat: 'cat-2', price: 180, tags: ['sticky', 'office'],
    imgs: ['https://images.unsplash.com/photo-1568027762272-e4da8b386fe9?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1517971071642-34a2d3eaac27?w=600&h=600&fit=crop'] },
  { name: 'Planner 2025', cat: 'cat-2', price: 540, tags: ['planner', 'schedule'],
    imgs: ['https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop'] },

  // Beauty & Skincare
  { name: 'Rose Face Mask', cat: 'cat-3', price: 220, tags: ['mask', 'skincare', 'rose'],
    imgs: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop'] },
  { name: 'Lip Balm Set', cat: 'cat-3', price: 390, tags: ['lip', 'care'],
    imgs: ['https://images.unsplash.com/photo-1586495777744-4e6232bf2177?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=600&fit=crop'] },
  { name: 'Moisturizing Cream', cat: 'cat-3', price: 680, tags: ['cream', 'moisturizer'],
    imgs: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop'] },
  { name: 'Eye Shadow Palette', cat: 'cat-3', price: 890, tags: ['makeup', 'eyes'],
    imgs: ['https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop'] },

  // Home & Living
  { name: 'Aromatherapy Diffuser', cat: 'cat-4', price: 1450, tags: ['aroma', 'relax'],
    imgs: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1602928309168-a13f3a2b7855?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1616321589084-c648ef89e6cd?w=600&h=600&fit=crop'] },
  { name: 'Ceramic Mug', cat: 'cat-4', price: 380, tags: ['mug', 'coffee', 'ceramic'],
    imgs: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&h=600&fit=crop'] },
  { name: 'Storage Box Set', cat: 'cat-4', price: 720, tags: ['storage', 'organize'],
    imgs: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=600&h=600&fit=crop'] },
  { name: 'Scented Candle', cat: 'cat-4', price: 560, tags: ['candle', 'aroma'],
    imgs: ['https://images.unsplash.com/photo-1603905756157-f6a8b70af7b0?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop'] },

  // Electronics Accessories
  { name: 'Phone Stand', cat: 'cat-5', price: 280, tags: ['stand', 'phone'],
    imgs: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop'] },
  { name: 'USB-C Cable', cat: 'cat-5', price: 350, tags: ['cable', 'usb-c', 'charging'],
    imgs: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1609592806596-b85c5fb3977f?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&h=600&fit=crop'] },
  { name: 'Earphones', cat: 'cat-5', price: 890, tags: ['earphone', 'audio'],
    imgs: ['https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop'] },
  { name: 'Power Bank 10000', cat: 'cat-5', price: 1680, tags: ['power', 'battery'],
    imgs: ['https://images.unsplash.com/photo-1609592806596-b85c5fb3977f?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop'] },

  // Snacks & Food
  { name: 'Matcha KitKat', cat: 'cat-6', price: 240, tags: ['kitkat', 'matcha', 'japanese'],
    imgs: ['https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1575377222312-dd1a63a51638?w=600&h=600&fit=crop'] },
  { name: 'Pocky Sticks', cat: 'cat-6', price: 180, tags: ['pocky', 'chocolate', 'japanese'],
    imgs: ['https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1575377222312-dd1a63a51638?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&h=600&fit=crop'] },
  { name: 'Mochi Ice Cream', cat: 'cat-6', price: 320, tags: ['mochi', 'japanese', 'sweet'],
    imgs: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&h=600&fit=crop'] },

  // Fashion Accessories
  { name: 'Mini Crossbody Bag', cat: 'cat-7', price: 1350, tags: ['bag', 'fashion'],
    imgs: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop'] },
  { name: 'Baseball Cap', cat: 'cat-7', price: 680, tags: ['cap', 'hat', 'fashion'],
    imgs: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=600&fit=crop'] },

  // Digital Vouchers
  { name: 'Miniso Gift Voucher 500', cat: 'cat-8', price: 500, tags: ['voucher', 'gift', 'digital'], isDigital: true,
    imgs: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1518911709364-bfc499bed43b?w=600&h=600&fit=crop'] },
  { name: 'Miniso Gift Voucher 1000', cat: 'cat-8', price: 1000, tags: ['voucher', 'gift', 'digital'], isDigital: true,
    imgs: ['https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1518911709364-bfc499bed43b?w=600&h=600&fit=crop'] },
  { name: 'E-Gift Card', cat: 'cat-8', price: 250, tags: ['gift', 'card', 'digital'], isDigital: true,
    imgs: ['https://images.unsplash.com/photo-1518911709364-bfc499bed43b?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop'] },
]

export const products: Product[] = productTemplates.map((t, i) => ({
  id: `prod-${i + 1}`,
  sku: `MINISO-${String(i + 1).padStart(4, '0')}`,
  name: { en: t.name, am: amName(t.name) },
  description: {
    en: `${t.name} — a premium lifestyle product from Miniso. High quality, great design, affordable price.`,
    am: `${amName(t.name)} — ከሚኒሶ ፕሪሚየም ምርት። ከፍተኛ ጥራት፣ ጥሩ ዲዛይን፣ ተመጣጣኝ ዋጋ።`,
  },
  categoryIds: [t.cat],
  tags: t.tags,
  brand: 'Miniso',
  images: t.imgs,
  isDigital: t.isDigital ?? false,
  status: 'active' as const,
  prices: { ETB: t.price, USD: Math.round(t.price * 0.0175 * 100) / 100 },
  scheduledPrices: [],
  seo: {
    slug: t.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    metaTitle: `${t.name} — Miniso Ethiopia`,
    metaDescription: `Buy ${t.name} at Miniso Ethiopia. Quality products at great prices.`,
  },
  rating: Math.round((3.5 + (i % 3) * 0.5) * 10) / 10,
  reviewCount: (i * 7 + 5) % 80 + 5,
  createdAt: faker.date.past({ years: 1 }).toISOString(),
}))

// Add more products to reach 60
for (let i = productTemplates.length; i < 60; i++) {
  const catIdx = (i % 7) + 1
  const price = 200 + (i * 37) % 1800
  products.push({
    id: `prod-${i + 1}`,
    sku: `MINISO-${String(i + 1).padStart(4, '0')}`,
    name: { en: `Miniso Item ${i + 1}`, am: `ሚኒሶ ምርት ${i + 1}` },
    description: { en: `Premium lifestyle product from Miniso.`, am: `ከሚኒሶ ፕሪሚየም ምርት።` },
    categoryIds: [`cat-${catIdx}`],
    tags: ['miniso', 'lifestyle'],
    brand: 'Miniso',
    images: [`https://picsum.photos/seed/prod${i + 1}/600/600`],
    isDigital: false,
    status: 'active',
    prices: { ETB: price, USD: Math.round(price * 0.0175 * 100) / 100 },
    scheduledPrices: [],
    seo: { slug: `miniso-item-${i + 1}`, metaTitle: `Miniso Item ${i + 1}`, metaDescription: '' },
    rating: Math.round((3 + (i % 5) * 0.4) * 10) / 10,
    reviewCount: (i * 13) % 50,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  })
}

// ─── Variants ────────────────────────────────────────────────────────────────
export const variants: Variant[] = []
const variantProducts = products.slice(0, 20)
variantProducts.forEach((p) => {
  const colors = ['Red', 'Blue', 'Pink', 'White', 'Black']
  const sizes = p.categoryIds.includes('cat-7') ? ['S', 'M', 'L'] : ['One Size']
  colors.slice(0, 3).forEach((color, ci) => {
    sizes.forEach((size, si) => {
      variants.push({
        id: `var-${p.id}-${ci}-${si}`,
        productId: p.id,
        sku: `${p.sku}-${color[0]}-${size[0]}`,
        options: { color, size },
        prices: { ETB: p.prices.ETB + ci * 50, USD: p.prices.USD + ci * 0.9 },
        image: p.images[ci % p.images.length],
      })
    })
  })
})

// ─── Stock ───────────────────────────────────────────────────────────────────
export const stockItems: StockItem[] = []
const locations = ['online', 'bole', 'piassa', 'megenagna'] as const
products.forEach((p, pi) => {
  const pVariants = variants.filter((v) => v.productId === p.id)
  const items = pVariants.length > 0 ? pVariants : [{ id: `default-${p.id}` }]
  items.forEach((v, vi) => {
    locations.forEach((loc, li) => {
      stockItems.push({
        variantId: v.id,
        locationId: loc,
        qty: ((pi * 13 + vi * 7 + li * 3) % 95) + 5,
        lowThreshold: 10,
      })
    })
  })
})

// ─── Users ───────────────────────────────────────────────────────────────────
export const users: User[] = [
  { id: 'usr-admin', name: 'Abebe Kebede', email: 'admin@demo', phone: '+251911000001', role: 'admin', locale: 'en', currencyPref: 'ETB', avatar: 'https://picsum.photos/seed/admin/100/100', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'usr-manager', name: 'Tigist Alemu', email: 'manager@demo', phone: '+251911000002', role: 'manager', locale: 'en', currencyPref: 'ETB', avatar: 'https://picsum.photos/seed/manager/100/100', createdAt: '2024-01-02T00:00:00Z' },
  { id: 'usr-staff', name: 'Yonas Tadesse', email: 'staff@demo', phone: '+251911000003', role: 'staff', locale: 'en', currencyPref: 'ETB', avatar: 'https://picsum.photos/seed/staff/100/100', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'usr-marketing', name: 'Meron Haile', email: 'marketing@demo', phone: '+251911000004', role: 'marketing', locale: 'en', currencyPref: 'ETB', avatar: 'https://picsum.photos/seed/mktg/100/100', createdAt: '2024-02-15T00:00:00Z' },
  { id: 'usr-finance', name: 'Daniel Bekele', email: 'finance@demo', phone: '+251911000005', role: 'finance', locale: 'en', currencyPref: 'USD', avatar: 'https://picsum.photos/seed/fin/100/100', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'usr-customer', name: 'Sara Girma', email: 'customer@demo', phone: '+251912345678', faydaId: 'FAYDA-2024-001234', role: 'customer', locale: 'am', currencyPref: 'ETB', avatar: 'https://picsum.photos/seed/cust/100/100', createdAt: '2024-04-01T00:00:00Z' },
]

// Add 40 more customers
for (let i = 0; i < 40; i++) {
  users.push({
    id: `usr-c${i}`,
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    role: 'customer',
    locale: i % 3 === 0 ? 'am' : 'en',
    currencyPref: i % 4 === 0 ? 'USD' : 'ETB',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  })
}

// ─── Addresses ───────────────────────────────────────────────────────────────
const subCities = ['Bole', 'Kirkos', 'Yeka', 'Nifas Silk', 'Kolfe', 'Gulele', 'Lideta', 'Akaki', 'Arada']

export const addresses: Address[] = users
  .filter((u) => u.role === 'customer' || u.id === 'usr-customer')
  .slice(0, 20)
  .map((u, i) => ({
    id: `addr-${i}`,
    userId: u.id,
    label: i % 2 === 0 ? 'Home' : 'Office',
    fullName: u.name,
    phone: `+251 9${Math.floor(Math.random() * 90000000 + 10000000)}`,
    city: 'Addis Ababa',
    subCity: subCities[i % subCities.length],
    woreda: String(Math.floor(Math.random() * 10 + 1)),
    detail: faker.location.streetAddress(),
    isDefault: true,
  }))

// ─── Orders ──────────────────────────────────────────────────────────────────
const orderStatuses: OrderStatus[] = ['placed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled']
const paymentMethods = ['card', 'telebirr', 'cbe_birr', 'bank_transfer', 'cash_on_delivery'] as const
const currencies: CurrencyCode[] = ['ETB', 'USD']

export const payments: Payment[] = []
export const orders: Order[] = []

for (let i = 0; i < 150; i++) {
  // Use modulo arithmetic (deterministic, no Math.random()) so indices are always in bounds
  const customerIdx = (i % 40) + 6  // indices 6..45, all valid
  const customer = users[customerIdx]!
  const numItems = (i % 4) + 1
  const startProd = i % Math.max(1, products.length - numItems)
  const orderProds = products.slice(startProd, startProd + numItems)
  const currency = currencies[i % 5 === 0 ? 1 : 0]
  const rate = currency === 'USD' ? 0.0175 : 1

  const items: OrderItem[] = orderProds.map((p) => {
    const qty = (i % 3) + 1
    const unitPrice = p.prices.ETB * rate
    return {
      variantId: `default-${p.id}`,
      productId: p.id,
      productName: p.name.en,
      variantLabel: 'Default',
      image: p.images[0],
      qty,
      unitPrice,
      total: qty * unitPrice,
    }
  })

  const subtotal = items.reduce((s, it) => s + it.total, 0)
  const discount = i % 5 === 0 ? subtotal * 0.1 : 0
  const shipping = 80 * rate
  const vat = (subtotal - discount + shipping) * 0.15
  const total = subtotal - discount + shipping + vat
  const status = orderStatuses[i % orderStatuses.length]
  const createdAt = faker.date.past({ years: 0.25 }).toISOString()

  const payment: Payment = {
    id: `pay-${i}`,
    orderId: `ord-${i}`,
    method: paymentMethods[i % paymentMethods.length],
    currency,
    amount: total,
    status: status === 'placed' ? 'pending' : status === 'cancelled' ? 'failed' : 'completed',
    gatewayRef: `GW-${faker.string.alphanumeric(8).toUpperCase()}`,
    createdAt,
  }
  payments.push(payment)

  orders.push({
    id: `ord-${i}`,
    number: `MIN-${String(10000 + i)}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    items,
    totals: { subtotal, discount, shipping, vat, total, currency },
    status,
    timeline: [{ status: 'placed', ts: createdAt }],
    paymentId: `pay-${i}`,
    deliveryZoneId: `zone-${(i % 5) + 1}`,
    partnerId: i % 3 === 0 ? 'partner-1' : null,
    notes: [],
    address: {
      label: 'Home',
      fullName: customer.name,
      phone: '+251 912345678',
      city: 'Addis Ababa',
      subCity: subCities[i % subCities.length],
      woreda: String((i % 10) + 1),
      detail: faker.location.streetAddress(),
    },
    channel: i % 10 === 0 ? 'phone' : 'online',
    createdAt,
  })
}

// ─── Refunds ─────────────────────────────────────────────────────────────────
export const refunds: Refund[] = []
for (let i = 0; i < 12; i++) {
  const order = orders[i * 10]
  refunds.push({
    id: `ref-${i}`,
    orderId: order.id,
    amount: order.totals.total * (i % 2 === 0 ? 1 : 0.5),
    type: i % 2 === 0 ? 'full' : 'partial',
    status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'approved' : 'completed',
    reason: faker.helpers.arrayElement(['Product damaged', 'Wrong item', 'Changed mind', 'Quality issue']),
    requestedBy: order.customerId ?? 'guest',
    auditLog: [],
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
  })
}

// ─── Returns ─────────────────────────────────────────────────────────────────
export const returnRequests: ReturnRequest[] = []
for (let i = 0; i < 8; i++) {
  const order = orders[i * 15 + 5]
  returnRequests.push({
    id: `ret-${i}`,
    orderId: order.id,
    items: [{ variantId: order.items[0].variantId, qty: 1, reason: 'Defective product' }],
    resolution: faker.helpers.arrayElement(['refund', 'exchange', 'store_credit']),
    status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
    createdAt: faker.date.recent({ days: 20 }).toISOString(),
  })
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviews: Review[] = []
for (let i = 0; i < 25; i++) {
  const product = products[i % products.length]
  const user = users[6 + (i % 40)]
  reviews.push({
    id: `rev-${i}`,
    productId: product.id,
    userId: user.id,
    userName: user.name,
    rating: (i % 3) + 3,
    text: faker.helpers.arrayElement([
      'Great product! Really happy with the quality.',
      'Good value for money. Will buy again.',
      'Looks exactly like the pictures. Fast delivery!',
      'My kids love it. Perfect gift.',
      'Quality could be better but overall good.',
      'Exactly what I needed. Highly recommend.',
    ]),
    status: i < 20 ? 'approved' : 'pending',
    createdAt: faker.date.past({ years: 0.5 }).toISOString(),
  })
}

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const coupons: Coupon[] = [
  { id: 'coup-1', code: 'WELCOME10', type: 'percentage', value: 10, minBasket: 500, usageLimit: 100, used: 34, expiresAt: '2027-01-01', active: true },
  { id: 'coup-2', code: 'SAVE200', type: 'fixed', value: 200, minBasket: 1000, usageLimit: 50, used: 50, expiresAt: '2026-12-31', active: false },
  { id: 'coup-3', code: 'FLASH15', type: 'percentage', value: 15, minBasket: 800, usageLimit: 200, used: 45, expiresAt: '2027-03-01', active: true },
  { id: 'coup-4', code: 'NEWUSER', type: 'fixed', value: 150, minBasket: 600, usageLimit: 1000, used: 120, expiresAt: '2027-06-01', active: true },
  { id: 'coup-5', code: 'BIRTHDAY', type: 'percentage', value: 20, minBasket: 0, usageLimit: 10, used: 10, expiresAt: '2025-12-31', active: false },
  { id: 'coup-6', code: 'SUMMER25', type: 'percentage', value: 25, minBasket: 1500, usageLimit: 300, used: 180, expiresAt: '2027-08-31', active: true },
]

// ─── Banners ─────────────────────────────────────────────────────────────────
export const banners: Banner[] = [
  { id: 'ban-1', image: 'https://picsum.photos/seed/banner1/1200/400', link: '/category/plush-toys', title: "Kawaii Season is Here!", subtitle: 'Up to 30% off on all plush toys', order: 1, startDate: '2026-10-01', endDate: '2026-12-31', active: true },
  { id: 'ban-2', image: 'https://picsum.photos/seed/banner2/1200/400', link: '/category/beauty', title: 'Glow Up with Miniso', subtitle: 'New Beauty Collection — Shop Now', order: 2, startDate: '2026-10-01', endDate: '2026-11-30', active: true },
  { id: 'ban-3', image: 'https://picsum.photos/seed/banner3/1200/400', link: '/category/home', title: 'Transform Your Space', subtitle: 'Home & Living products from Br 380', order: 3, startDate: '2026-09-01', endDate: '2026-12-31', active: true },
  { id: 'ban-4', image: 'https://picsum.photos/seed/banner4/1200/400', link: '/vouchers', title: 'Gift Someone You Love', subtitle: 'Gift Vouchers from Br 250', order: 4, startDate: '2026-10-01', endDate: '2026-12-31', active: false },
]

// ─── Campaigns ───────────────────────────────────────────────────────────────
export const campaigns: Campaign[] = [
  { id: 'camp-1', name: 'Welcome Series', channel: 'email', segment: 'new', subject: 'Welcome to Miniso Ethiopia! 🎉', body: 'Dear {{name}}, welcome to the Miniso family! Enjoy 10% off your first order with code WELCOME10.', status: 'sent', sentAt: faker.date.recent({ days: 7 }).toISOString(), stats: { sent: 1240, opened: 680, clicked: 230 }, createdAt: faker.date.past({ years: 0.2 }).toISOString() },
  { id: 'camp-2', name: 'Abandoned Cart Reminder', channel: 'sms', segment: 'abandoned_cart', subject: 'You left something behind!', body: 'Hi {{name}}, you have items in your cart. Complete your order now and get free delivery!', status: 'sent', sentAt: faker.date.recent({ days: 2 }).toISOString(), stats: { sent: 345, opened: 180, clicked: 95 }, createdAt: faker.date.past({ years: 0.1 }).toISOString() },
  { id: 'camp-3', name: 'Loyalty Reward', channel: 'email', segment: 'returning', subject: 'A special thank you from Miniso 💝', body: 'As one of our valued customers, here is an exclusive 15% discount code: LOYAL15.', status: 'draft', stats: { sent: 0, opened: 0, clicked: 0 }, createdAt: faker.date.recent({ days: 1 }).toISOString() },
]

// ─── Delivery Zones & Partners ───────────────────────────────────────────────
export const deliveryZones: DeliveryZone[] = [
  { id: 'zone-1', name: 'Addis Ababa — Bole', rate: 60, etaDays: 1 },
  { id: 'zone-2', name: 'Addis Ababa — Piassa', rate: 70, etaDays: 1 },
  { id: 'zone-3', name: 'Addis Ababa — Other', rate: 80, etaDays: 1 },
  { id: 'zone-4', name: 'Adama', rate: 180, etaDays: 2 },
  { id: 'zone-5', name: 'Bahir Dar', rate: 350, etaDays: 3 },
]

export const deliveryPartners: DeliveryPartner[] = [
  { id: 'partner-1', name: 'Addis Courier', trackingUrl: 'https://track.addiscourier.et' },
  { id: 'partner-2', name: 'Ethiopia Post', trackingUrl: 'https://www.ethiopost.gov.et' },
  { id: 'partner-3', name: 'DHL Express' },
]

// ─── Notifications ───────────────────────────────────────────────────────────
export const notifications: Notification[] = []
const notifTypes = [
  { type: 'order_placed' as const, title: 'New Order Received', body: 'Order MIN-10045 placed by Sara Girma' },
  { type: 'low_stock' as const, title: 'Low Stock Alert', body: 'Corgi Plush Toy (Red/S) — only 4 left at Bole' },
  { type: 'order_shipped' as const, title: 'Order Shipped', body: 'Order MIN-10032 has been dispatched via Addis Courier' },
  { type: 'refund_approved' as const, title: 'Refund Approved', body: 'Refund of Br 850 approved for order MIN-10018' },
]
notifTypes.forEach((n, i) => {
  notifications.push({ id: `notif-${i}`, userId: 'usr-admin', ...n, read: i > 1, ts: faker.date.recent({ days: 3 }).toISOString(), link: '/admin/orders' })
})

// ─── Backups ─────────────────────────────────────────────────────────────────
export const backups: Backup[] = Array.from({ length: 14 }, (_, i) => ({
  id: `bkp-${i}`,
  ts: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
  size: `${(12 + Math.random() * 5).toFixed(1)} MB`,
  status: i === 2 ? 'failed' : 'completed',
  type: 'auto',
}))

// ─── Audit Log ───────────────────────────────────────────────────────────────
export const auditLog: AuditEntry[] = []
for (let i = 0; i < 30; i++) {
  auditLog.push({
    id: `aud-${i}`,
    userId: users[i % 5].id,
    action: faker.helpers.arrayElement(['UPDATE_ORDER', 'APPROVE_REFUND', 'ADJUST_STOCK', 'LOGIN', 'CREATE_COUPON', 'SEND_CAMPAIGN']),
    entity: faker.helpers.arrayElement(['Order', 'Refund', 'Stock', 'User', 'Coupon', 'Campaign']),
    entityId: `entity-${i}`,
    ts: faker.date.recent({ days: 14 }).toISOString(),
  })
}

// ─── Wishlists ───────────────────────────────────────────────────────────────
export const wishlists: Record<string, WishlistItem[]> = {
  'usr-customer': products.slice(0, 5).map((p) => ({ productId: p.id, addedAt: faker.date.recent({ days: 30 }).toISOString() })),
}

// ─── Sync Log ────────────────────────────────────────────────────────────────
export const syncLog: SyncLogEntry[] = []
for (let i = 0; i < 20; i++) {
  syncLog.push({
    id: `sync-${i}`,
    direction: i % 2 === 0 ? 'storefront→erp' : 'erp→storefront',
    entity: faker.helpers.arrayElement(['inventory', 'order', 'payment']),
    entityId: `entity-${i}`,
    status: i === 5 ? 'failed' : 'success',
    ts: faker.date.recent({ days: 1 }).toISOString(),
    payload: { qty: 10, productId: `prod-${i}` },
    retryCount: i === 5 ? 2 : 0,
  })
}

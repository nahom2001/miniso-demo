import { db } from '@/mock/db'
import * as seed from '@/mock/seed'
import type { Product, Review } from '@/domain/types'

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 300))
}

export async function getProducts(opts?: { categoryId?: string; search?: string; tag?: string }): Promise<Product[]> {
  await delay(200)
  let prods = db.products.filter((p) => p.status === 'active')
  if (opts?.categoryId) prods = prods.filter((p) => p.categoryIds.includes(opts.categoryId!))
  if (opts?.search) {
    const q = opts.search.toLowerCase()
    prods = prods.filter((p) => p.name.en.toLowerCase().includes(q) || p.name.am.includes(q) || p.tags.includes(q))
  }
  if (opts?.tag) prods = prods.filter((p) => p.tags.includes(opts.tag!))
  return prods
}

export async function getProduct(id: string): Promise<Product | null> {
  await delay(150)
  return db.products.find((p) => p.id === id) ?? null
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await delay(150)
  return db.products.find((p) => p.seo.slug === slug) ?? null
}

export async function getReviews(productId: string): Promise<Review[]> {
  await delay(100)
  return seed.reviews.filter((r) => r.productId === productId && r.status === 'approved')
}

export async function getAllReviews(): Promise<Review[]> {
  await delay(150)
  return seed.reviews
}

export async function getVariants(productId: string) {
  await delay(100)
  return seed.variants.filter((v) => v.productId === productId)
}

export async function getCategories() {
  await delay(150)
  return seed.categories
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await delay(200)
  return db.products.filter((p) => p.status === 'active').slice(0, 12)
}

export async function getNewArrivals(): Promise<Product[]> {
  await delay(200)
  return db.products
    .filter((p) => p.status === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
}

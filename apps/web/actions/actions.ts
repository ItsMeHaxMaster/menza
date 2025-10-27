/**
 * Server Actions
 * API wrapper functions that run on the server side
 * These actions bridge the client components with the backend API
 * All functions are marked with 'use server' directive
 */

'use server';

import api from '@/lib/api';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Calculates subtotal with VAT breakdown for cart items
 * @param items - Array of food item IDs
 * @returns Price breakdown including subtotal, VAT, and net amounts
 */
export async function getSubtotal(items: (string | bigint)[]) {
  return await api.getSubtotal(items);
}

/**
 * Creates a Stripe checkout session for payment processing
 * @param items - Array of food item IDs to purchase
 * @param year - Year of the order
 * @param week - Week number of the order
 * @param days - Array of day numbers (1-5 for Monday-Friday)
 * @returns Stripe session with checkout URL
 */
export async function createCheckoutSession(
  items: (string | bigint)[],
  year: number,
  week: number,
  days: number[]
) {
  return await api.createCheckoutSession(items, year, week, days);
}

/**
 * Verifies a Stripe checkout session after payment redirect
 * @param sessionId - Stripe session ID from URL parameter
 * @returns Session data with payment status and customer details
 */
export async function verifyCheckoutSession(sessionId: string) {
  return await api.verifyCheckoutSession(sessionId);
}

/**
 * Retrieves user's order history
 * @param limit - Optional limit on number of orders to return
 * @returns Array of past orders with details and payment status
 */
export async function getOrderHistory(limit?: number) {
  return await api.getOrderHistory(limit);
}

/**
 * Retrieves invoice download URL for a paid order
 * @param orderId - Unique order identifier
 * @returns Invoice URL or error if unavailable
 */
export async function getInvoiceUrl(orderId: string) {
  return await api.getInvoiceUrl(orderId);
}

/**
 * Fetches weekly menu for a specific week
 * @param week - ISO week number
 * @param year - Calendar year
 * @returns Array of menu items organized by day with food options
 */
export async function getMenu(week: number, year: number) {
  return await api.getMenu(week, year);
}

/**
 * Retrieves detailed information for a specific food item
 * @param id - Unique food item identifier
 * @returns Food details including name, price, description, and allergens
 */
export async function getFood(id: string) {
  return await api.getFood(id);
}

/**
 * Logs out the user by deleting session cookie and redirecting to login
 * Note: Cookie name is 'session_mz' (different from 'mz_session' used elsewhere)
 */
export async function deleteSession() {
  (await cookies()).delete('session_mz');
  redirect('/login');
}

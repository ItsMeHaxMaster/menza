'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { getInvoiceUrl } from '@/actions/actions';
import styles from './InvoiceButton.module.css';

/**
 * Props for InvoiceButton component
 */
interface InvoiceButtonProps {
  orderId: string;
  paymentStatus: string;
}

/**
 * InvoiceButton Component
 * Allows users to download their invoice for paid orders.
 * Only enabled when payment status is 'paid'.
 * Opens invoice in a new browser tab when clicked.
 */
export default function InvoiceButton({
  orderId,
  paymentStatus
}: InvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isPaid = paymentStatus === 'paid';

  /**
   * Fetches invoice URL from the API and opens it in a new tab
   * Shows alerts for unpaid orders or download errors
   */
  const handleDownload = async () => {
    if (!isPaid) {
      alert('A számla csak a kifizetve státuszú rendeléseknél érhető el.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await getInvoiceUrl(orderId);

      if (result && result.invoiceUrl) {
        window.open(result.invoiceUrl, '_blank');
      } else {
        alert('A számla jelenleg nem érhető el.');
      }
    } catch (error) {
      console.error('Invoice download error:', error);
      alert('Hiba történt a számla letöltésekor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!isPaid || isLoading}
      className={styles.invoiceButton}
      title={
        isPaid
          ? 'Számla letöltése'
          : 'Csak kifizetve státuszú rendeléseknél érhető el'
      }
    >
      <Download size={16} />
      {isLoading ? 'Betöltés...' : 'Számla'}
    </button>
  );
}

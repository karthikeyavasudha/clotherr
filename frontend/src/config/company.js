export const COMPANY = {
    brandName: 'Clotherr',
    website: 'https://clotherr.online',
  
    // Razorpay reviewers commonly verify these are present on site:
    legalName: import.meta.env.VITE_LEGAL_NAME || 'Clotherr',
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@clotherr.online',
    ordersEmail: import.meta.env.VITE_ORDERS_EMAIL || 'orders@clotherr.online',
    supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '+91-XXXXXXXXXX',
  
    // Use a real, complete address (street, city, state, pincode, country)
    addressLines: (import.meta.env.VITE_BUSINESS_ADDRESS || 'India').split('\n'),
  
    // Optional (good to add if you have it)
    gstin: import.meta.env.VITE_GSTIN || '',
  };
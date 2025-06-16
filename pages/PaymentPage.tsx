
import React from 'react';

interface PaymentPageProps {
  grandTotal: string;
  onPaymentConfirmed: () => void;
  navigateToBill: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ grandTotal, onPaymentConfirmed, navigateToBill }) => {
  // Assume a placeholder QR code image is in the public folder or accessible via this path
  const qrCodeImageUrl = '/upi-qr-code.png'; 

  return (
    <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-[#BBD69D] flex flex-col items-center">
      <h1 className="text-2xl font-semibold text-[#475424] mb-2 text-center">Scan to Pay</h1>
      <p className="text-sm text-[#1E2229]/80 mb-6 text-center">Use any UPI app to make the payment.</p>

      <div className="mb-6 p-4 border border-[#EDB403] rounded-lg bg-[#F5F0E5]/50">
        <img 
          src={qrCodeImageUrl} 
          alt="UPI QR Code" 
          className="w-48 h-48 sm:w-56 sm:h-56 object-contain mx-auto"
          onError={(e) => {
            // Fallback for when the QR image is not found
            e.currentTarget.alt = "QR Code Image (Not Found)";
            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-100');
            e.currentTarget.outerHTML = `<span class="text-xs text-red-500 p-2">${e.currentTarget.alt} at ${qrCodeImageUrl}</span>`;
          }}
        />
      </div>

      <div className="text-center mb-8">
        <p className="text-lg text-[#1E2229]">Amount to Pay:</p>
        <p className="text-3xl font-bold text-[#EDB403]">{grandTotal}</p>
      </div>

      <button
        onClick={onPaymentConfirmed}
        className="w-full bg-[#EDB403] text-[#1E2229] font-semibold py-3 px-6 rounded-lg hover:bg-[#c9a002] focus:outline-none focus:ring-2 focus:ring-[#475424] focus:ring-opacity-75 transition-colors duration-150 text-md mb-4"
        aria-label="Confirm payment and finish order"
      >
        Payment Confirmed & Finish
      </button>

      <button
        onClick={navigateToBill}
        className="flex items-center text-[#475424] hover:text-[#EDB403] focus:outline-none focus:text-[#EDB403] transition-colors duration-150 group py-2"
        aria-label="Go back to order snap"
      >
        <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-0.5 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        <span className="font-medium text-sm">Back to Order Snap</span>
      </button>
      
    </div>
  );
};

export default PaymentPage;
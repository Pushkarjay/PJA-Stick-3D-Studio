import { useState } from 'react';
import { MessageCircle, LogIn } from 'lucide-react';

export default function CheckoutPopup({ onWhatsApp, onSaveAndLogin, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Complete Your Order</h2>
        <p className="text-slate-600 mb-6">
          Sorry, you can't order directly from the website. Please contact us on WhatsApp to finalize your purchase. Your cart will be saved!
        </p>
        <div className="space-y-3">
          <button
            onClick={onWhatsApp}
            className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2"
          >
            <MessageCircle />
            Order on WhatsApp
          </button>
          <button
            onClick={onSaveAndLogin}
            className="w-full btn btn-secondary btn-lg flex items-center justify-center gap-2"
          >
            <LogIn />
            Save Cart & Login
          </button>
        </div>
      </div>
    </div>
  );
}

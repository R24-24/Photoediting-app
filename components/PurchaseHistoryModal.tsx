import React from 'react';
import { Purchase } from '../types';

interface PurchaseHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: Purchase[];
}

const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({ isOpen, onClose, history }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-base-200 w-full max-w-lg rounded-2xl shadow-xl border border-base-300 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-base-300 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Purchase History</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {history.length === 0 ? (
                        <p className="text-center text-gray-400">You haven't made any purchases yet.</p>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-base-300">
                                    <th className="p-3 text-sm font-semibold text-gray-300">Date</th>
                                    <th className="p-3 text-sm font-semibold text-gray-300 text-center">Tokens</th>
                                    <th className="p-3 text-sm font-semibold text-gray-300 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((purchase, index) => (
                                    <tr key={index} className="border-b border-base-300/50">
                                        <td className="p-3 text-gray-300 text-sm">
                                            {new Date(purchase.date).toLocaleString()}
                                        </td>
                                        <td className="p-3 text-white font-medium text-center">
                                            +{purchase.tokens}
                                        </td>
                                        <td className="p-3 text-green-400 text-right font-semibold">
                                            ₹{purchase.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseHistoryModal;

import { CreditCard, IndianRupee, Wallet, Building2, CheckCircle } from 'lucide-react';
import { useState } from 'react';

type DonationType = {
  id: string;
  name: string;
  description: string;
  minimumAmount: number;
};

const donationTypes: DonationType[] = [
  {
    id: 'annadanam',
    name: 'Annadanam',
    description: 'Contribute to feeding devotees',
    minimumAmount: 1100,
  },
  {
    id: 'renovation',
    name: 'Temple Renovation',
    description: 'Support temple maintenance and renovation',
    minimumAmount: 2100,
  },
  {
    id: 'pooja',
    name: 'Special Pooja',
    description: 'Sponsor temple rituals and ceremonies',
    minimumAmount: 501,
  },
];

export function Donations() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [step, setStep] = useState(1);
  const [donationComplete, setDonationComplete] = useState(false);
  const [donationId, setDonationId] = useState('');
  const [error, setError] = useState<string>('');

  const selectedDonationData = donationTypes.find((type) => type.id === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1 && selectedType && amount) {
      if (parseFloat(amount) < (selectedDonationData?.minimumAmount || 0)) {
        setError(`Amount must be at least ₹${selectedDonationData?.minimumAmount}`);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!paymentMethod) {
        setError('Please select a payment method');
        return;
      }
      if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
        setError('Please fill in all card details');
        return;
      }
      if (paymentMethod === 'upi' && !upiId) {
        setError('Please enter a valid UPI ID');
        return;
      }

      const donationData = {
        donationType: selectedType,
        amount,
        paymentMethod,
        ...(paymentMethod === 'card' && { cardNumber, expiryDate, cvv }),
        ...(paymentMethod === 'upi' && { upiId }),
      };

      try {
        const response = await fetch('http://localhost:3000/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(donationData),
        });

        const result = await response.json();

        if (response.ok) {
          setDonationId(result.donationId || `DON${Math.floor(1000 + Math.random() * 9000)}`);
          setDonationComplete(true);
        } else {
          setError(result.message || 'Failed to process donation');
        }
      } catch (err) {
        console.error('❌ Donation submission error:', err);
        setError('An error occurred while processing your donation');
      }
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCardNumber(e.target.value);
    setCardNumber(value);
  };

  const handleNewDonation = () => {
    setStep(1);
    setSelectedType('');
    setAmount('');
    setPaymentMethod('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setUpiId('');
    setDonationComplete(false);
    setDonationId('');
    setError('');
  };

  const printReceipt = () => {
    if (!selectedDonationData) return;

    const receiptContent = `
      <html>
        <head>
          <title>Donation Receipt</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              margin: 20px;
              color: #333;
              background-color: #fff;
            }
            .receipt-container {
              max-width: 600px;
              margin: 0 auto;
              border: 2px solid #f59e0b;
              border-radius: 10px;
              padding: 30px;
              background: linear-gradient(to bottom, #fff7ed, #ffffff);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .receipt-header {
              text-align: center;
              border-bottom: 3px solid #f59e0b;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .receipt-header h1 {
              margin: 0;
              color: #b91c1c;
              font-size: 28px;
              font-weight: bold;
            }
            .receipt-header p {
              color: #666;
              font-size: 16px;
              margin: 5px 0;
            }
            .receipt-details {
              font-size: 16px;
              line-height: 1.8;
              margin-bottom: 20px;
            }
            .receipt-details table {
              width: 100%;
              border-collapse: collapse;
            }
            .receipt-details th, .receipt-details td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            .receipt-details th {
              width: 40%;
              font-weight: bold;
              color: #d97706;
            }
            .receipt-details td {
              color: #333;
            }
            .total {
              font-size: 18px;
              font-weight: bold;
              color: #b91c1c;
              text-align: right;
              margin-top: 20px;
              border-top: 2px solid #f59e0b;
              padding-top: 10px;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 30px;
              font-size: 14px;
              color: #666;
              font-style: italic;
            }
            @media print {
              body {
                margin: 0;
              }
              .receipt-container {
                border: none;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <h1>Donation Receipt</h1>
              <p>Sri Temple Trust</p>
              <p>Thank you for your generous contribution!</p>
            </div>
            <div class="receipt-details">
              <table>
                <tr>
                  <th>Donation ID</th>
                  <td>${donationId}</td>
                </tr>
                <tr>
                  <th>Donation Type</th>
                  <td>${selectedDonationData.name}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>${selectedDonationData.description}</td>
                </tr>
                <tr>
                  <th>Amount</th>
                  <td>₹${amount}</td>
                </tr>
                <tr>
                  <th>Payment Method</th>
                  <td>${
                    paymentMethod === 'card' ? 'Credit/Debit Card' :
                    paymentMethod === 'upi' ? 'UPI' : 'Net Banking'
                  }</td>
                </tr>
              </table>
            </div>
            <div class="total">Total Donated: ₹${amount}</div>
            <div class="receipt-footer">
              May divine blessings be upon you and your family.
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
    } else {
      console.error('Failed to open print window');
      setError('Unable to open print window. Please try again.');
    }
  };

  if (donationComplete && selectedDonationData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-24 w-24 text-green-600 animate-pulse" />
            </div>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 sm:text-6xl">
              Donation Successful!
            </h1>
            <p className="mt-4 text-2xl text-gray-700 font-light max-w-2xl mx-auto">
              Your generous contribution brings us closer to our sacred mission. May you be blessed with peace and prosperity.
            </p>
          </div>

          <div className="mt-12 bg-white rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto border-2 border-orange-200 transform transition-all duration-300 hover:shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-600 to-yellow-500"></div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-8 border-b-2 border-orange-100 pb-4">
              Donation Details
            </h2>
            <div className="space-y-6">
              {[
                { label: 'Donation ID', value: donationId },
                { label: 'Donation Type', value: selectedDonationData.name },
                { label: 'Amount', value: `₹${amount}` },
                {
                  label: 'Payment Method',
                  value:
                    paymentMethod === 'card' ? 'Credit/Debit Card' :
                    paymentMethod === 'upi' ? 'UPI' : 'Net Banking',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between py-4 px-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors duration-200"
                >
                  <span className="text-gray-700 font-medium">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex space-x-4">
              <button
                onClick={handleNewDonation}
                className="flex-1 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-500 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:from-orange-700 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
              >
                Make Another Donation
              </button>
              <button
                onClick={printReceipt}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 sm:text-6xl">
            Make a Donation
          </h1>
          <p className="mt-4 text-2xl text-gray-700 font-light max-w-2xl mx-auto">
            Your support fuels our temple’s sacred activities. Contribute today and receive divine blessings.
          </p>
        </div>

        <div className="mt-12">
          <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-3xl shadow-2xl p-10 border border-orange-200">
            {error && (
              <div className="rounded-xl bg-red-100 p-4 border border-red-300 animate-fade-in">
                <p className="text-base font-medium text-red-800">{error}</p>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {donationTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`relative rounded-xl border-2 p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                        selectedType === type.id
                          ? 'border-orange-600 bg-gradient-to-br from-orange-50 to-amber-50 ring-2 ring-orange-300'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IndianRupee className="h-8 w-8 text-orange-600 animate-pulse" />
                          <div>
                            <p className="text-lg font-semibold text-gray-900">{type.name}</p>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-orange-700">
                        Minimum: ₹{type.minimumAmount}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <label htmlFor="amount" className="block text-base font-medium text-gray-800 mb-2">
                    Donation Amount (₹)
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-200 sm:text-base p-4 transition-all duration-300 hover:border-orange-400"
                      placeholder="Enter amount"
                      min={selectedDonationData?.minimumAmount || 1}
                      required
                    />
                    <IndianRupee className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </>
            )}

            {step === 2 && selectedDonationData && (
              <div className="space-y-10">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl shadow-inner border border-orange-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 border-b-2 border-orange-100 pb-3">
                    Donation Summary
                  </h3>
                  <div className="space-y-4">
                    <p className="text-base text-gray-700">
                      <span className="font-medium">Type:</span> {selectedDonationData.name}
                    </p>
                    <p className="text-base text-gray-700">
                      <span className="font-medium">Description:</span> {selectedDonationData.description}
                    </p>
                    <p className="text-lg font-semibold text-orange-700">
                      Amount: ₹{amount}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-800 mb-4">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {[
                      { id: 'card', icon: CreditCard, label: 'Credit/Debit Card' },
                      { id: 'upi', icon: Wallet, label: 'UPI' },
                      { id: 'netbanking', icon: Building2, label: 'Net Banking' },
                    ].map(({ id, icon: Icon, label }) => (
                      <div
                        key={id}
                        className={`relative rounded-xl border-2 p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                          paymentMethod === id
                            ? 'border-orange-600 bg-gradient-to-br from-orange-50 to-amber-50 ring-2 ring-orange-300'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                        onClick={() => setPaymentMethod(id)}
                      >
                        <div className="flex items-center space-x-4">
                          <Icon className="h-8 w-8 text-orange-600 animate-pulse" />
                          <span className="text-base font-semibold text-gray-900">{label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="card-number" className="block text-base font-medium text-gray-800 mb-2">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="card-number"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="block w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-200 sm:text-base p-4 transition-all duration-300 hover:border-orange-400"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                        <CreditCard className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="expiry" className="block text-base font-medium text-gray-800 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="block w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-200 sm:text-base p-4 transition-all duration-300 hover:border-orange-400"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-base font-medium text-gray-800 mb-2">
                          CVV
                        </label>
                        <input
                          type="password"
                          id="cvv"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="block w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-200 sm:text-base p-4 transition-all duration-300 hover:border-orange-400"
                          placeholder="123"
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="upi-id" className="block text-base font-medium text-gray-800 mb-2">
                        UPI ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="upi-id"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="block w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-200 sm:text-base p-4 transition-all duration-300 hover:border-orange-400"
                          placeholder="username@upi"
                          required
                        />
                        <Wallet className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {amount && (
                      <div className="mt-6 flex justify-center">
                        <img
                          src="/assets/upi-qr-code.jpeg" // Replace with the actual path or URL to your UPI scanner image
                          alt="UPI Scanner QR Code"
                          className="w-64 h-64 rounded-xl border-2 border-orange-300 shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="rounded-xl bg-blue-50 p-6 border border-blue-200">
                    <p className="text-base text-blue-800 font-medium">
                      You will be redirected to your bank's payment portal after clicking 'Complete Donation'.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-yellow-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-orange-700 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
              >
                {step === 1 ? 'Continue to Payment' : 'Complete Donation'}
              </button>
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full rounded-xl border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-orange-300 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200"
                >
                  Back to Donation Selection
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
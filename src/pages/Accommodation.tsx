// import { Calendar, Users, Building, CreditCard, IndianRupee, Wallet, CheckCircle } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// type RoomType = {
//   id: string;
//   name: string;
//   description: string;
//   basePrice: number;
//   capacity: number;
// };

// const roomTypes: RoomType[] = [
//   {
//     id: 'standard',
//     name: 'Standard Room',
//     description: 'Comfortable room with basic amenities',
//     basePrice: 800,
//     capacity: 2,
//   },
//   {
//     id: 'deluxe',
//     name: 'Deluxe Room',
//     description: 'Spacious room with additional amenities',
//     basePrice: 1200,
//     capacity: 3,
//   },
//   {
//     id: 'suite',
//     name: 'Family Suite',
//     description: 'Large suite perfect for families',
//     basePrice: 2000,
//     capacity: 4,
//   },
// ];

// export function Accommodation() {
//   const [checkIn, setCheckIn] = useState<Date | null>(null);
//   const [checkOut, setCheckOut] = useState<Date | null>(null);
//   const [guests, setGuests] = useState('1');
//   const [selectedRoom, setSelectedRoom] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('');
//   const [cardNumber, setCardNumber] = useState('');
//   const [expiryDate, setExpiryDate] = useState('');
//   const [cvv, setCvv] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [step, setStep] = useState(0);
//   const [bookingComplete, setBookingComplete] = useState(false);
//   const [bookingId, setBookingId] = useState('');
//   const [error, setError] = useState('');
//   const [agreed, setAgreed] = useState(false);
//   const [isDateAvailable, setIsDateAvailable] = useState<boolean | null>(null);
//   const [dateAvailability, setDateAvailability] = useState<{ [key: string]: string }>({});

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const calculateDuration = (checkIn: Date | null, checkOut: Date | null): number => {
//     if (!checkIn || !checkOut) return 1;
//     const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
//   };

//   const calculateTotalPrice = () => {
//     const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);
//     if (!selectedRoomData) return 0;

//     const duration = calculateDuration(checkIn, checkOut);
//     const guestCount = parseInt(guests);
//     const extraGuestCharge = guestCount > selectedRoomData.capacity ? 
//       (guestCount - selectedRoomData.capacity) * 200 : 0;

//     return (selectedRoomData.basePrice * duration) + extraGuestCharge;
//   };

//   const fetchDateAvailability = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/api/accommodations/availability');
//       if (!response.ok) {
//         throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
//       }
//       const availability = await response.json();
//       setDateAvailability(availability);
//     } catch (err: any) {
//       console.error('Error fetching date availability:', err.message);
//       setError(`Failed to load date availability: ${err.message}.`);
//     }
//   };

//   const validateDates = async () => {
//     if (!checkIn || !checkOut) {
//       setError('Please select both check-in and check-out dates.');
//       return false;
//     }

//     const checkInDate = new Date(checkIn);
//     const checkOutDate = new Date(checkOut);
//     checkInDate.setHours(0, 0, 0, 0);
//     checkOutDate.setHours(0, 0, 0, 0);

//     if (checkInDate < today) {
//       setError('Check-in date cannot be in the past.');
//       return false;
//     }
//     if (checkOutDate <= checkInDate) {
//       setError('Check-out date must be after check-in date.');
//       return false;
//     }

//     try {
//       const response = await fetch('http://localhost:3000/api/accommodations/check', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ checkInDate: checkIn.toISOString().split('T')[0], checkOutDate: checkOut.toISOString().split('T')[0] }),
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
//       }
//       const { isAvailable } = await response.json();

//       setIsDateAvailable(isAvailable);
//       if (!isAvailable) {
//         setError('Selected dates are not available. Please choose different dates.');
//       }
//       return isAvailable;
//     } catch (err: any) {
//       console.error('Error checking availability:', err.message);
//       setError(`Failed to check date availability: ${err.message}. Please try again.`);
//       return false;
//     }
//   };

//   useEffect(() => {
//     fetchDateAvailability();
//   }, []);

//   useEffect(() => {
//     if (step === 1 && checkIn && checkOut) {
//       validateDates();
//     }
//   }, [checkIn, checkOut, step]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (step === 0 && agreed) {
//       setStep(1);
//     } else if (step === 1 && selectedRoom && fullName && email && phone && checkIn && checkOut) {
//       const isValid = await validateDates();
//       if (!isValid) return;
//       const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);
//       if (selectedRoomData && parseInt(guests) > selectedRoomData.capacity) {
//         setError(`Selected room can accommodate maximum ${selectedRoomData.capacity} guests`);
//         return;
//       }
//       setStep(2);
//     } else if (step === 2) {
//       const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);
//       if (!selectedRoomData) return;

//       const bookingData = {
//         fullName,
//         email,
//         phone,
//         checkInDate: checkIn.toISOString().split('T')[0],
//         checkOutDate: checkOut.toISOString().split('T')[0],
//         numberOfPeople: parseInt(guests),
//         roomType: selectedRoomData.name,
//         totalPrice: calculateTotalPrice(),
//       };

//       try {
//         const response = await fetch('http://localhost:3000/api/accommodations', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(bookingData),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           throw new Error(result.message || 'Failed to book accommodation');
//         }

//         setBookingId(result.id || 'BOOK123');
//         setBookingComplete(true);
//       } catch (err: any) {
//         console.error('Booking error:', err);
//         setError(err.message || 'Failed to complete booking. Please try again.');
//       }
//     } else {
//       setError('Please fill in all required fields.');
//     }
//   };

//   const formatCardNumber = (value: string) => {
//     const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
//     const matches = v.match(/\d{4,16}/g);
//     const match = (matches && matches[0]) || '';
//     const parts = [];

//     for (let i = 0, len = match.length; i < len; i += 4) {
//       parts.push(match.substring(i, i + 4));
//     }

//     if (parts.length) {
//       return parts.join(' ');
//     } else {
//       return value;
//     }
//   };

//   const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = formatCardNumber(e.target.value);
//     setCardNumber(value);
//   };

//   const handleNewBooking = () => {
//     setStep(0);
//     setSelectedRoom('');
//     setPaymentMethod('');
//     setCardNumber('');
//     setExpiryDate('');
//     setCvv('');
//     setCheckIn(null);
//     setCheckOut(null);
//     setGuests('1');
//     setFullName('');
//     setEmail('');
//     setPhone('');
//     setBookingComplete(false);
//     setBookingId('');
//     setError('');
//     setAgreed(false);
//     setIsDateAvailable(null);
//   };

//   const getDayClassName = (date: Date) => {
//     const dateStr = date.toISOString().split('T')[0];
//     if (date < today) return 'react-datepicker__day--disabled';
//     if (dateAvailability[dateStr] === 'unavailable') return 'react-datepicker__day--unavailable';
//     if (dateAvailability[dateStr] === 'filling') return 'react-datepicker__day--filling';
//     return 'react-datepicker__day--available';
//   };

//   // Function to print the receipt
//   const printReceipt = () => {
//     const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);
//     if (!selectedRoomData) return;

//     const receiptContent = `
//       <html>
//         <head>
//           <title>Booking Receipt</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               margin: 20px;
//               color: #333;
//             }
//             .receipt-container {
//               max-width: 600px;
//               margin: 0 auto;
//               border: 1px solid #ccc;
//               padding: 20px;
//               border-radius: 8px;
//             }
//             .receipt-header {
//               text-align: center;
//               border-bottom: 2px solid #f59e0b;
//               padding-bottom: 10px;
//               margin-bottom: 20px;
//             }
//             .receipt-header h1 {
//               margin: 0;
//               color: #d97706;
//               font-size: 24px;
//             }
//             .receipt-details {
//               font-size: 16px;
//               line-height: 1.6;
//             }
//             .receipt-details p {
//               margin: 8px 0;
//             }
//             .receipt-details strong {
//               display: inline-block;
//               width: 150px;
//             }
//             .total {
//               font-size: 18px;
//               font-weight: bold;
//               margin-top: 20px;
//               color: #b91c1c;
//             }
//             @media print {
//               body {
//                 margin: 0;
//               }
//               .receipt-container {
//                 border: none;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="receipt-container">
//             <div class="receipt-header">
//               <h1>Booking Receipt</h1>
//               <p>Thank you for your booking!</p>
//             </div>
//             <div class="receipt-details">
//               <p><strong>Booking ID:</strong> ${bookingId}</p>
//               <p><strong>Full Name:</strong> ${fullName}</p>
//               <p><strong>Email:</strong> ${email}</p>
//               <p><strong>Phone:</strong> ${phone}</p>
//               <p><strong>Room Type:</strong> ${selectedRoomData.name}</p>
//               <p><strong>Check-in Date:</strong> ${checkIn?.toISOString().split('T')[0]}</p>
//               <p><strong>Check-out Date:</strong> ${checkOut?.toISOString().split('T')[0]}</p>
//               <p><strong>Number of Guests:</strong> ${guests}</p>
//               <p><strong>Duration:</strong> ${calculateDuration(checkIn, checkOut)} nights</p>
//               <p><strong>Payment Method:</strong> ${
//                 paymentMethod === 'card' ? 'Credit/Debit Card' :
//                 paymentMethod === 'upi' ? 'UPI' : 'Cash at Desk'
//               }</p>
//               <p class="total"><strong>Total Amount:</strong> ₹${calculateTotalPrice()}</p>
//             </div>
//           </div>
//           <script>
//             window.onload = () => {
//               window.print();
//               window.onafterprint = () => window.close();
//             };
//           </script>
//         </body>
//       </html>
//     `;

//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(receiptContent);
//       printWindow.document.close();
//     } else {
//       console.error('Failed to open print window');
//       setError('Unable to open print window. Please try again.');
//     }
//   };

//   const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);

//   if (bookingComplete && selectedRoomData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-blue-100 py-12">
//         <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="flex justify-center animate-bounce">
//               <CheckCircle className="h-16 w-16 text-green-600" />
//             </div>
//             <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
//               Booking Confirmed!
//             </h1>
//             <p className="mt-4 text-lg text-gray-600">
//               We're thrilled to welcome you to your luxurious stay!
//             </p>
//           </div>

//           <div className="mt-12 bg-white rounded-3xl shadow-2xl p-8 border border-gold-200">
//             <h2 className="text-2xl font-semibold text-gray-900 mb-6">Booking Details</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {[
//                 { label: 'Booking ID', value: bookingId },
//                 { label: 'Full Name', value: fullName },
//                 { label: 'Room Type', value: selectedRoomData.name },
//                 { label: 'Check-in Date', value: checkIn?.toISOString().split('T')[0] },
//                 { label: 'Check-out Date', value: checkOut?.toISOString().split('T')[0] },
//                 { label: 'Number of Guests', value: guests },
//                 {
//                   label: 'Payment Method',
//                   value: paymentMethod === 'card' ? 'Credit/Debit Card' :
//                         paymentMethod === 'upi' ? 'UPI' : 'Cash at Desk'
//                 },
//                 { label: 'Total Amount', value: `₹${calculateTotalPrice()}` },
//               ].map((item) => (
//                 <div key={item.label} className="py-3 border-b border-gray-100">
//                   <span className="text-gray-600 font-medium">{item.label}</span>
//                   <p className="text-gray-900 font-semibold">{item.value}</p>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-8 flex space-x-4">
//               <button
//                 onClick={handleNewBooking}
//                 className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
//               >
//                 Book Another Room
//               </button>
//               <button
//                 onClick={printReceipt}
//                 className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
//               >
//                 Print Receipt
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-blue-100 py-12">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <div className="text-center">
//           <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-blue-600">
//             Book Your Dream Stay
//           </h1>
//           <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
//             Immerse yourself in luxury with our exquisite rooms, tailored for your comfort.
//           </p>
//         </div>

//         {error && (
//           <div className="mt-6 rounded-xl bg-red-100 p-4 animate-shake">
//             <p className="text-sm font-medium text-red-700">{error}</p>
//           </div>
//         )}

//         {isDateAvailable !== null && (
//           <div className={`mt-6 rounded-xl p-4 ${isDateAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
//             <p className={`text-sm font-medium ${isDateAvailable ? 'text-green-700' : 'text-red-700'}`}>
//               {isDateAvailable ? 'Selected dates are available!' : 'Selected dates are not available.'}
//             </p>
//           </div>
//         )}

//         <div className="mt-12">
//           <form onSubmit={handleSubmit} className="space-y-8">
//             <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gold-200">
//               {step === 0 && (
//                 <div className="space-y-6">
//                   <h2 className="text-3xl font-semibold text-gray-900 mb-6">Booking Instructions</h2>
//                   <div className="bg-amber-50 p-6 rounded-xl">
//                     <p className="text-gray-700">
//                       <strong>Welcome to our booking system!</strong> Please read the following instructions carefully:
//                     </p>
//                     <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
//                       <li>Check-in dates must be today or later.</li>
//                       <li>Check-out date must be after check-in date.</li>
//                       <li>Ensure the number of guests does not exceed the room capacity.</li>
//                       <li>Payment can be made via card, UPI, or cash at the desk.</li>
//                       <li>Bookings are confirmed only after payment (except for cash payments).</li>
//                     </ul>
//                   </div>
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id="agree"
//                       checked={agreed}
//                       onChange={(e) => setAgreed(e.target.checked)}
//                       className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
//                     />
//                     <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
//                       I agree to the booking instructions and terms.
//                     </label>
//                   </div>
//                   <button
//                     type="submit"
//                     disabled={!agreed}
//                     className={`w-full rounded-xl px-6 py-4 text-base font-semibold text-white shadow-md transition-all duration-300 ${
//                       agreed
//                         ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
//                         : 'bg-gray-400 cursor-not-allowed'
//                     }`}
//                   >
//                     Proceed to Booking
//                   </button>
//                 </div>
//               )}

//               {step === 1 && (
//                 <>
//                   <div className="mb-8">
//                     <h2 className="text-3xl font-semibold text-gray-900 mb-6">Guest Information</h2>
//                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
//                       {[
//                         { id: 'full-name', label: 'Full Name', value: fullName, setter: setFullName, type: 'text' },
//                         { id: 'email', label: 'Email', value: email, setter: setEmail, type: 'email' },
//                         { id: 'phone', label: 'Phone Number', value: phone, setter: setPhone, type: 'tel' },
//                       ].map((field) => (
//                         <div key={field.id}>
//                           <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
//                             {field.label}
//                           </label>
//                           <input
//                             type={field.type}
//                             id={field.id}
//                             value={field.value}
//                             onChange={(e) => field.setter(e.target.value)}
//                             className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-all duration-300"
//                             required
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="mb-8">
//                     <h2 className="text-3xl font-semibold text-gray-900 mb-6">Stay Details</h2>
//                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                       <div className="relative">
//                         <label htmlFor="check-in" className="block text-sm font-medium text-gray-700">
//                           Check-in Date
//                         </label>
//                         <DatePicker
//                           id="check-in"
//                           selected={checkIn}
//                           onChange={(date: Date) => setCheckIn(date)}
//                           minDate={today}
//                           dateFormat="yyyy-MM-dd"
//                           className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-all duration-300"
//                           required
//                           dayClassName={getDayClassName}
//                         />
//                         <Calendar className="absolute right-3 top-10 h-5 w-5 text-gray-400" />
//                       </div>
//                       <div className="relative">
//                         <label htmlFor="check-out" className="block text-sm font-medium text-gray-700">
//                           Check-out Date
//                         </label>
//                         <DatePicker
//                           id="check-out"
//                           selected={checkOut}
//                           onChange={(date: Date) => setCheckOut(date)}
//                           minDate={checkIn ? new Date(checkIn.getTime() + 24 * 60 * 60 * 1000) : today}
//                           dateFormat="yyyy-MM-dd"
//                           className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-all duration-300"
//                           required
//                           dayClassName={getDayClassName}
//                         />
//                         <Calendar className="absolute right-3 top-10 h-5 w-5 text-gray-400" />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mb-8">
//                     <h2 className="text-3xl font-semibold text-gray-900 mb-6">Guests</h2>
//                     <div className="relative max-w-xs">
//                       <label htmlFor="guests" className="block text-sm font-medium text-gray-700">
//                         Number of Guests
//                       </label>
//                       <select
//                         id="guests"
//                         value={guests}
//                         onChange={(e) => setGuests(e.target.value)}
//                         className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm pr-10 transition-all duration-300"
//                         required
//                       >
//                         {[1, 2, 3, 4].map((num) => (
//                           <option key={num} value={num}>
//                             {num} {num === 1 ? 'Guest' : 'Guests'}
//                           </option>
//                         ))}
//                       </select>
//                       <Users className="absolute right-3 top-10 h-5 w-5 text-gray-400" />
//                     </div>
//                   </div>

//                   <div className="mb-8">
//                     <h2 className="text-3xl font-semibold text-gray-900 mb-6">Choose Your Room</h2>
//                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
//                       {roomTypes.map((room) => (
//                         <div
//                           key={room.id}
//                           className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
//                             selectedRoom === room.id
//                               ? 'border-amber-600 bg-amber-50 shadow-lg'
//                               : 'border-gray-200 hover:border-amber-300'
//                           }`}
//                           onClick={() => setSelectedRoom(room.id)}
//                         >
//                           <div className="flex items-center mb-4">
//                             <Building className="h-8 w-8 text-amber-600 mr-3" />
//                             <div>
//                               <p className="text-xl font-semibold text-gray-900">{room.name}</p>
//                               <p className="text-sm text-gray-600">{room.description}</p>
//                             </div>
//                           </div>
//                           <div className="space-y-2">
//                             <p className="text-lg font-semibold text-amber-600">
//                               ₹{room.basePrice}/night
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               Up to {room.capacity} guests
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </>
//               )}

//               {step === 2 && selectedRoomData && (
//                 <div className="space-y-8">
//                   <div className="bg-amber-50 p-8 rounded-xl">
//                     <h3 className="text-2xl font-semibold text-gray-900 mb-6">Booking Summary</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <p className="text-sm text-gray-600">Name: <span className="font-semibold">{fullName}</span></p>
//                       <p className="text-sm text-gray-600">Email: <span className="font-semibold">{email}</span></p>
//                       <p className="text-sm text-gray-600">Phone: <span className="font-semibold">{phone}</span></p>
//                       <p className="text-sm text-gray-600">Room: <span className="font-semibold">{selectedRoomData.name}</span></p>
//                       <p className="text-sm text-gray-600">Check-in: <span className="font-semibold">{checkIn?.toISOString().split('T')[0]}</span></p>
//                       <p className="text-sm text-gray-600">Check-out: <span className="font-semibold">{checkOut?.toISOString().split('T')[0]}</span></p>
//                       <p className="text-sm text-gray-600">Guests: <span className="font-semibold">{guests}</span></p>
//                       <p className="text-sm text-gray-600">Duration: <span className="font-semibold">{calculateDuration(checkIn, checkOut)} nights</span></p>
//                       <p className="text-lg font-semibold text-amber-600 mt-2">
//                         Total: ₹{calculateTotalPrice()}
//                       </p>
//                     </div>
//                   </div>

//                   <div>
//                     <h3 className="text-2xl font-semibold text-gray-900 mb-6">Payment Method</h3>
//                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
//                       {[
//                         { id: 'card', icon: CreditCard, label: 'Credit/Debit Card' },
//                         { id: 'upi', icon: Wallet, label: 'UPI' },
//                         { id: 'cash', icon: IndianRupee, label: 'Cash at Desk' },
//                       ].map((method) => (
//                         <div
//                           key={method.id}
//                           className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
//                             paymentMethod === method.id
//                               ? 'border-amber-600 bg-amber-50 shadow-lg'
//                               : 'border-gray-200 hover:border-amber-300'
//                           }`}
//                           onClick={() => setPaymentMethod(method.id)}
//                         >
//                           <div className="flex items-center">
//                             <method.icon className="h-6 w-6 text-amber-600 mr-3" />
//                             <span className="text-lg font-semibold text-gray-900">{method.label}</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {paymentMethod === 'card' && (
//                     <div className="space-y-6">
//                       <h3 className="text-2xl font-semibold text-gray-900 mb-6">Card Details</h3>
//                       <div>
//                         <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
//                           Card Number
//                         </label>
//                         <input
//                           type="text"
//                           id="card-number"
//                           value={cardNumber}
//                           onChange={handleCardNumberChange}
//                           className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-all duration-300"
//                           placeholder="1234 5678 9012 3456"
//                           maxLength={19}
//                           required
//                         />
//                       </div>
//                       <div className="grid grid-cols-2 gap-6">
//                         <div>
//                           <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
//                             Expiry Date
//                           </label>
//                           <input
//                             type="text"
//                             id="expiry"
//                             value={expiryDate}
//                             onChange={(e) => setExpiryDate(e.target.value)}
//                             className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-all duration-300"
//                             placeholder="MM/YY"
//                             maxLength={5}
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
//                             CVV
//                           </label>
//                           <input
//                             type="password"
//                             id="cvv"
//                             value={cvv}
//                             onChange={(e) => setCvv(e.target.value)}
//                             className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-all duration-300"
//                             placeholder="123"
//                             maxLength={3}
//                             required
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {paymentMethod === 'upi' && (
//                     <div>
//                       <label htmlFor="upi-id" className="block text-sm font-medium text-gray-700">
//                         UPI ID
//                       </label>
//                       <input
//                         type="text"
//                         id="upi-id"
//                         className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-all duration-300"
//                         placeholder="username@upi"
//                         required
//                       />
//                     </div>
//                   )}

//                   {paymentMethod === 'cash' && (
//                     <div className="rounded-xl bg-blue-50 p-6">
//                       <p className="text-sm text-blue-700 font-medium">
//                         Please complete your payment at the reception desk during check-in. Your booking is confirmed but requires payment to guarantee your stay.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {step !== 0 && (
//               <div className="flex space-x-4">
//                 <button
//                   type="submit"
//                   className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
//                 >
//                   {step === 1 ? 'Continue to Payment' : 'Complete Booking'}
//                 </button>
//                 {step === 2 && (
//                   <button
//                     type="button"
//                     onClick={() => setStep(1)}
//                     className="flex-1 rounded-xl border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all duration-300"
//                   >
//                     Back to Room Selection
//                   </button>
//                 )}
//               </div>
//             )}
//           </form>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           25% { transform: translateX(-5px); }
//           75% { transform: translateX(5px); }
//         }
//         .animate-shake {
//           animation: shake 0.3s ease-in-out;
//         }
//         .react-datepicker__day--available {
//           background-color: #d1fae5;
//         }
//         .react-datepicker__day--filling {
//           background-color: #fef9c3;
//         }
//         .react-datepicker__day--unavailable {
//           background-color: #fee2e2;
//         }
//         .react-datepicker__day--disabled {
//           background-color: #f3f4f6;
//           cursor: not-allowed;
//         }
//       `}</style>
//     </div>
//   );
// }
import { Calendar, Users, Building, CreditCard, IndianRupee, Wallet, CheckCircle, Mail, Phone, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type RoomType = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  image: string;
};

const roomTypes: RoomType[] = [
  {
    id: 'standard',
    name: 'Standard Room',
    description: 'Cozy room with essential amenities for a comfortable stay.',
    basePrice: 800,
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
  },
  {
    id: 'deluxe',
    name: 'Deluxe Room',
    description: 'Spacious room with modern amenities and scenic views.',
    basePrice: 1200,
    capacity: 3,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427',
  },
  {
    id: 'suite',
    name: 'Family Suite',
    description: 'Luxurious suite ideal for families with ample space.',
    basePrice: 2000,
    capacity: 4,
    image: 'https://d2mo2a5fvrklap.cloudfront.net/app/uploads/sites/14/2022/08/20043604/familysuite-hero-desktop.jpg',
  },
];

export function Accommodation() {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState('1');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(0);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isDateAvailable, setIsDateAvailable] = useState<boolean | null>(null);
  const [dateAvailability, setDateAvailability] = useState<{ [key: string]: string }>({});
  const [showRoomDetails, setShowRoomDetails] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calculateDuration = (checkIn: Date | null, checkOut: Date | null): number => {
    if (!checkIn || !checkOut) return 1;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const calculateTotalPrice = () => {
    const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);
    if (!selectedRoomData) return 0;

    const duration = calculateDuration(checkIn, checkOut);
    const guestCount = parseInt(guests);
    const extraGuestCharge = guestCount > selectedRoomData.capacity ? 
      (guestCount - selectedRoomData.capacity) * 200 : 0;

    return (selectedRoomData.basePrice * duration) + extraGuestCharge;
  };

  const fetchDateAvailability = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/accommodations/availability');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      const availability = await response.json();
      setDateAvailability(availability);
    } catch (err: any) {
      console.error('Error fetching date availability:', err.message);
      setError(`Failed to load date availability: ${err.message}.`);
    }
  };

  const validateDates = async () => {
    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates.');
      return false;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      setError('Check-in date cannot be in the past.');
      return false;
    }
    if (checkOutDate <= checkInDate) {
      setError('Check-out date must be after check-in date.');
      return false;
    }

    try {
      const response = await fetch('http://localhost:3000/api/accommodations/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkInDate: checkIn.toISOString().split('T')[0], checkOutDate: checkOut.toISOString().split('T')[0] }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      const { isAvailable } = await response.json();

      setIsDateAvailable(isAvailable);
      if (!isAvailable) {
        setError('Selected dates are not available. Please choose different dates.');
      }
      return isAvailable;
    } catch (err: any) {
      console.error('Error checking availability:', err.message);
      setError(`Failed to check date availability: ${err.message}. Please try again.`);
      return false;
    }
  };

  useEffect(() => {
    fetchDateAvailability();
  }, []);

  useEffect(() => {
    if (step === 1 && checkIn && checkOut) {
      validateDates();
    }
  }, [checkIn, checkOut, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 0 && agreed) {
      setStep(1);
    } else if (step === 1 && selectedRoom && fullName && email && phone && checkIn && checkOut) {
      const isValid = await validateDates();
      if (!isValid) return;
      const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);
      if (selectedRoomData && parseInt(guests) > selectedRoomData.capacity) {
        setError(`Selected room can accommodate maximum ${selectedRoomData.capacity} guests`);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);
      if (!selectedRoomData) return;

      const bookingData = {
        fullName,
        email,
        phone,
        checkInDate: checkIn.toISOString().split('T')[0],
        checkOutDate: checkOut.toISOString().split('T')[0],
        numberOfPeople: parseInt(guests),
        roomType: selectedRoomData.name,
        totalPrice: calculateTotalPrice(),
      };

      try {
        const response = await fetch('http://localhost:3000/api/accommodations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to book accommodation');
        }

        setBookingId(result.id || 'BOOK123');
        setBookingComplete(true);
      } catch (err: any) {
        console.error('Booking error:', err);
        setError(err.message || 'Failed to complete booking. Please try again.');
      }
    } else {
      setError('Please fill in all required fields.');
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

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCardNumber(e.target.value);
    setCardNumber(value);
  };

  const handleNewBooking = () => {
    setStep(0);
    setSelectedRoom('');
    setPaymentMethod('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCheckIn(null);
    setCheckOut(null);
    setGuests('1');
    setFullName('');
    setEmail('');
    setPhone('');
    setBookingComplete(false);
    setBookingId('');
    setError('');
    setAgreed(false);
    setIsDateAvailable(null);
    setShowRoomDetails(null);
  };

  const getDayClassName = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (date < today) return 'react-datepicker__day--disabled';
    if (dateAvailability[dateStr] === 'unavailable') return 'react-datepicker__day--unavailable';
    if (dateAvailability[dateStr] === 'filling') return 'react-datepicker__day--filling';
    return 'react-datepicker__day--available';
  };

  const printReceipt = () => {
    const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);
    if (!selectedRoomData) return;

    const receiptContent = `
      <html>
        <head>
          <title>Booking Receipt</title>
          <style>
            body {
              font-family: 'Roboto', sans-serif;
              margin: 20px;
              color: #2d3748;
            }
            .receipt-container {
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              padding: 20px;
              border-radius: 10px;
              background-color: #fff;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 2px solid #b83227;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .receipt-header h1 {
              margin: 0;
              color: #b83227;
              font-size: 28px;
              font-weight: 700;
            }
            .receipt-details {
              font-size: 16px;
              line-height: 1.8;
            }
            .receipt-details p {
              margin: 8px 0;
            }
            .receipt-details strong {
              display: inline-block;
              width: 160px;
              color: #4a5568;
            }
            .total {
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
              color: #b83227;
            }
            @media print {
              body {
                margin: 0;
              }
              .receipt-container {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <h1>Booking Receipt</h1>
              <p>Thank you for choosing us!</p>
            </div>
            <div class="receipt-details">
              <p><strong>Booking ID:</strong> ${bookingId}</p>
              <p><strong>Full Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Room Type:</strong> ${selectedRoomData.name}</p>
              <p><strong>Check-in Date:</strong> ${checkIn?.toISOString().split('T')[0]}</p>
              <p><strong>Check-out Date:</strong> ${checkOut?.toISOString().split('T')[0]}</p>
              <p><strong>Number of Guests:</strong> ${guests}</p>
              <p><strong>Duration:</strong> ${calculateDuration(checkIn, checkOut)} nights</p>
              <p><strong>Payment Method:</strong> ${
                paymentMethod === 'card' ? 'Credit/Debit Card' :
                paymentMethod === 'upi' ? 'UPI' : 'Cash at Desk'
              }</p>
              <p class="total"><strong>Total Amount:</strong> ₹${calculateTotalPrice()}</p>
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

  const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);

  if (bookingComplete && selectedRoomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center animate-pulse">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 font-serif">
              Booking Confirmed!
            </h1>
            <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto font-sans">
              We look forward to welcoming you to a serene and divine experience.
            </p>
          </div>

          <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-orange-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-serif">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Booking ID', value: bookingId },
                { label: 'Full Name', value: fullName },
                { label: 'Room Type', value: selectedRoomData.name },
                { label: 'Check-in Date', value: checkIn?.toISOString().split('T')[0] },
                { label: 'Check-out Date', value: checkOut?.toISOString().split('T')[0] },
                { label: 'Number of Guests', value: guests },
                {
                  label: 'Payment Method',
                  value: paymentMethod === 'card' ? 'Credit/Debit Card' :
                        paymentMethod === 'upi' ? 'UPI' : 'Cash at Desk'
                },
                { label: 'Total Amount', value: `₹${calculateTotalPrice()}` },
              ].map((item) => (
                <div key={item.label} className="py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium font-sans">{item.label}</span>
                  <p className="text-gray-900 font-semibold font-sans">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleNewBooking}
                className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-sans"
              >
                Book Another Room
              </button>
              <button
                onClick={printReceipt}
                className="flex-1 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 font-sans"
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-yellow-600">
            Book Your Sacred Stay
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto font-sans">
            Enjoy a tranquil and divine experience with our premium accommodations.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-100 p-4 animate-shake border border-red-200">
            <p className="text-base font-medium text-red-800 font-sans">{error}</p>
          </div>
        )}

        {isDateAvailable !== null && (
          <div className={`mt-6 rounded-lg p-4 border ${isDateAvailable ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}>
            <p className={`text-base font-medium ${isDateAvailable ? 'text-green-800' : 'text-red-800'} font-sans`}>
              {isDateAvailable ? 'Selected dates are available!' : 'Selected dates are not available.'}
            </p>
          </div>
        )}

        <div className="mt-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
              {step === 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-serif">Booking Instructions</h2>
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <p className="text-gray-700 font-sans">
                      <strong>Welcome to our sacred booking portal!</strong> Please read the instructions carefully:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700 font-sans">
                      <li>Check-in dates must be today or later.</li>
                      <li>Check-out date must be after check-in date.</li>
                      <li>Ensure the number of guests does not exceed the room capacity.</li>
                      <li>Payment can be made via card, UPI, or cash at the desk.</li>
                      <li>Bookings are confirmed only after payment (except for cash payments).</li>
                    </ul>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="agree" className="ml-2 text-base text-gray-700 font-sans">
                      I agree to the booking instructions and terms.
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!agreed}
                    className={`w-full rounded-lg px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-300 font-sans ${
                      agreed
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Proceed to Booking
                  </button>
                </div>
              )}

              {step === 1 && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-serif">Guest Information</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {[
                        { id: 'full-name', label: 'Full Name', value: fullName, setter: setFullName, type: 'text', icon: User },
                        { id: 'email', label: 'Email', value: email, setter: setEmail, type: 'email', icon: Mail },
                        { id: 'phone', label: 'Phone Number', value: phone, setter: setPhone, type: 'tel', icon: Phone },
                      ].map((field) => (
                        <div key={field.id} className="relative">
                          <label htmlFor={field.id} className="block text-base font-medium text-gray-700 font-sans">
                            {field.label}
                          </label>
                          <div className="mt-2 flex items-center">
                            <field.icon className="absolute left-3 h-5 w-5 text-gray-500" />
                            <input
                              type={field.type}
                              id={field.id}
                              value={field.value}
                              onChange={(e) => field.setter(e.target.value)}
                              className="block w-full rounded-lg border-2 border-orange-200 bg-orange-50 pl-10 pr-4 py-3 text-base shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 font-sans"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-serif">Stay Details</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="relative">
                        <label htmlFor="check-in" className="block text-base font-medium text-gray-700 font-sans">
                          Check-in Date
                        </label>
                        <div className="mt-2 relative">
                          <DatePicker
                            id="check-in"
                            selected={checkIn}
                            onChange={(date: Date) => setCheckIn(date)}
                            minDate={today}
                            dateFormat="yyyy-MM-dd"
                            className="block w-full rounded-lg border-2 border-orange-200 bg-orange-50 pl-10 pr-4 py-3 text-base shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 font-sans"
                            required
                            dayClassName={getDayClassName}
                          />
                          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="relative">
                        <label htmlFor="check-out" className="block text-base font-medium text-gray-700 font-sans">
                          Check-out Date
                        </label>
                        <div className="mt-2 relative">
                          <DatePicker
                            id="check-out"
                            selected={checkOut}
                            onChange={(date: Date) => setCheckOut(date)}
                            minDate={checkIn ? new Date(checkIn.getTime() + 24 * 60 * 60 * 1000) : today}
                            dateFormat="yyyy-MM-dd"
                            className="block w-full rounded-lg border-2 border-orange-200 bg-orange-50 pl-10 pr-4 py-3 text-base shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 font-sans"
                            required
                            dayClassName={getDayClassName}
                          />
                          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-serif">Guests</h2>
                    <div className="relative max-w-xs">
                      <label htmlFor="guests" className="block text-base font-medium text-gray-700 font-sans">
                        Number of Guests
                      </label>
                      <div className="mt-2 relative">
                        <select
                          id="guests"
                          value={guests}
                          onChange={(e) => setGuests(e.target.value)}
                          className="block w-full rounded-lg border-2 border-orange-200 bg-orange-50 pl-10 pr-10 py-3 text-base shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 font-sans"
                          required
                        >
                          {[1, 2, 3, 4].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                        </select>
                        <Users className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-serif">Choose Your Room</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {roomTypes.map((room) => (
                        <div
                          key={room.id}
                          className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                            selectedRoom === room.id
                              ? 'border-orange-500 bg-orange-50 shadow-lg'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-full h-40 object-cover rounded-lg mb-4"
                          />
                          <div className="flex items-center mb-4">
                            <Building className="h-8 w-8 text-orange-600 mr-3" />
                            <div>
                              <p className="text-xl font-semibold text-gray-900 font-serif">{room.name}</p>
                              <p className="text-sm text-gray-600 font-sans">{room.description}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-orange-600 font-sans">
                              ₹{room.basePrice}/night
                            </p>
                            <p className="text-sm text-gray-600 font-sans">
                              Up to {room.capacity} guests
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRoomDetails(room.id);
                            }}
                            className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-sans"
                          >
                            View Details
                          </button>
                          {showRoomDetails === room.id && (
                            <div className="absolute inset-0 bg-white rounded-lg p-6 z-10 shadow-2xl">
                              <h3 className="text-lg font-semibold text-gray-900 font-serif">{room.name} Details</h3>
                              <p className="mt-2 text-sm text-gray-600 font-sans">{room.description}</p>
                              <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 font-sans">
                                <li>Free Wi-Fi</li>
                                <li>Air Conditioning</li>
                                <li>24/7 Room Service</li>
                                <li>Complimentary Breakfast</li>
                              </ul>
                              <button
                                onClick={() => setShowRoomDetails(null)}
                                className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-white text-sm font-sans"
                              >
                                Close
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && selectedRoomData && (
                <div className="space-y-8">
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 font-serif">Booking Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p className="text-sm text-gray-600 font-sans">Name: <span className="font-semibold">{fullName}</span></p>
                      <p className="text-sm text-gray-600 font-sans">Email: <span className="font-semibold">{email}</span></p>
                      <p className="text-sm text-gray-600 font-sans">Phone: <span className="font-semibold">{phone}</span></p>
                      <p className="text-sm text-gray-600 font-sans">Room: <span className="font-semibold">{selectedRoomData.name}</span></p>
                      <p className="text-sm text-gray-600 font-sans">Check-in: <span className="font-semibold">{checkIn?.toISOString().split('T')[0]}</span></p>
                      <p className="text-sm text-gray-600 font-sans">Check-out: <span className="font-semibold">{checkOut?.toISOString().split('T')[0]}</span></p>
                      <p className="text-sm text-gray-600 font-sans">Guests: <span className="font-semibold">{guests}</span></p>
                      <p className="text-sm text-gray-600 font-sans">Duration: <span className="font-semibold">{calculateDuration(checkIn, checkOut)} nights</span></p>
                      <p className="text-lg font-semibold text-orange-600 mt-2 font-sans">
                        Total: ₹{calculateTotalPrice()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 font-serif">Payment Method</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {[
                        { id: 'card', icon: CreditCard, label: 'Credit/Debit Card' },
                        { id: 'upi', icon: Wallet, label: 'UPI' },
                        { id: 'cash', icon: IndianRupee, label: 'Cash at Desk' },
                      ].map((method) => (
                        <div
                          key={method.id}
                          className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                            paymentMethod === method.id
                              ? 'border-orange-500 bg-orange-50 shadow-lg'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                          onClick={() => setPaymentMethod(method.id)}
                        >
                          <div className="flex items-center">
                            <method.icon className="h-6 w-6 text-orange-600 mr-3" />
                            <span className="text-base font-semibold text-gray-900 font-sans">{method.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 font-serif">Card Details</h3>
                      <div>
                        <label htmlFor="card-number" className="block text-base font-medium text-gray-700 font-sans">
                          Card Number
                        </label>
                        <div className="mt-2 relative">
                          <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                          <input
                            type="text"
                            id="card-number"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className="block w-full rounded-lg border-2 border-orange-200 bg-orange-50 pl-10 pr-4 py-3 text-base shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 font-sans"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="expiry" className="block text-base font-medium text-gray-700 font-sans">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            id="expiry"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="mt-2 block w-full rounded-lg border-2 border-orange-200 bg-orange-50 px-4 py-3 text-base shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 font-sans"
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-base font-medium text-gray-700 font-sans">
                            CVV
                          </label>
                          <input
                            type="password"
                            id="cvv"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            className="mt-2 block w-full rounded-lg border-2 border-orange-200 bg-orange-50 px-4 py-3 text-base shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 font-sans"
                            placeholder="123"
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div>
                      <label htmlFor="upi-id" className="block text-base font-medium text-gray-700 font-sans">
                        UPI ID
                      </label>
                      <div className="mt-2 relative">
                        <Wallet className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                        <input
                          type="text"
                          id="upi-id"
                          className="block w-full rounded-lg border-2 border-orange-200 bg-orange-50 pl-10 pr-4 py-3 text-base shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 font-sans"
                          placeholder="username@upi"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="rounded-lg bg-yellow-50 p-6 border border-yellow-200">
                      <p className="text-base text-yellow-800 font-medium font-sans">
                        Please complete your payment at the reception desk during check-in. Your booking is confirmed but requires payment to guarantee your stay.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {step !== 0 && (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-sans"
                >
                  {step === 1 ? 'Continue to Payment' : 'Complete Booking'}
                </button>
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-lg border-2 border-orange-200 px-6 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-orange-50 transition-all duration-300 font-sans"
                  >
                    Back to Room Selection
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .react-datepicker__day--available {
          background-color: #fefcbf;
          color: #7f4f24;
        }
        .react-datepicker__day--filling {
          background-color: #fed7aa;
          color: #9b2226;
        }
        .react-datepicker__day--unavailable {
          background-color: #fee2e2;
          color: #9b2226;
        }
        .react-datepicker__day--disabled {
          background-color: #f3f4f6;
          color: #6b7280;
          cursor: not-allowed;
        }
        .react-datepicker__day:hover {
          background-color: #fed7aa;
          color: #7f4f24;
        }
      `}</style>
    </div>
  );
}
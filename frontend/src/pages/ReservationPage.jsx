import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, UsersIcon, CheckCircleIcon, QrCodeIcon, } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

const generateDateOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    const options = [
        `Today ${formatDate(today)}`, 
        `Tomorrow ${formatDate(tomorrow)}`
    ];
    
    for (let i = 2; i < 4; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        options.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }));
    }
    return options;
};

const INITIAL_DATE_OPTIONS = generateDateOptions();

const TIME_SLOTS = [

    { time: '8:30 AM', available: true },
    { time: '9:00 AM', available: true },
    { time: '9:30 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '11:30 AM', available: true },
    { time: '12:00 PM', available: false },
    { time: '12:30 PM', available: false },
    { time: '1:00 PM', available: true },
    { time: '1:30 PM', available: true },
    { time: '2:00 PM', available: true },
    { time: '2:30 PM', available: true },
    { time: '3:00 PM', available: true },
    { time: '3:30 PM', available: true },
    { time: '4:00 PM', available: true },
    { time: '4:30 PM', available: true },
    { time: '5:00 PM', available: true },
    { time: '5:30 PM', available: true },
    { time: '6:00 PM', available: true },
    { time: '6:30 PM', available: true },
    { time: '7:00 PM', available: true },
];
const LOCATIONS = [
  {
    id: 'main-dining',
    name: 'Main Dining Area',
    tables: [
      { id: 1, seats: 2, status: 'available' },
      { id: 2, seats: 4, status: 'occupied' },
      { id: 3, seats: 4, status: 'available' },
      { id: 4, seats: 4, status: 'available' },
      { id: 5, seats: 4, status: 'occupied' },
      { id: 6, seats: 4, status: 'available' },
      { id: 7, seats: 1, status: 'available' },
      { id: 8, seats: 4, status: 'available' },
    ]
  },
  {
    id: 'study-area',
    name: 'Study Area Main',
    tables: [
      { id: 9, seats: 4, status: 'available' },
      { id: 10, seats: 4, status: 'available' },
      { id: 11, seats: 4, status: 'occupied' },
      { id: 12, seats: 4, status: 'available' },
    ]
  },
  {
    id: 'anohana',
    name: 'Anohana Canteen',
    tables: [
      { id: 13, seats: 4, status: 'available' },
      { id: 14, seats: 4, status: 'available' },
      { id: 15, seats: 2, status: 'available' },
      { id: 16, seats: 4, status: 'available' },
    ]
  },
    {
    id: 'birdnest-dining',
    name: 'Bird Nest Canteen Dining Area',
    tables: [
      { id: 1, seats: 2, status: 'available' },
      { id: 2, seats: 4, status: 'occupied' },
      { id: 3, seats: 4, status: 'available' },
      { id: 4, seats: 4, status: 'available' },
      { id: 5, seats: 4, status: 'occupied' },
      { id: 6, seats: 4, status: 'available' },
      { id: 7, seats: 1, status: 'available' },
      { id: 8, seats: 4, status: 'available' },
    ]
  },
];

export function ReservationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(INITIAL_DATE_OPTIONS[0]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState(1);
    const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].id);
    const [selectedTable, setSelectedTable] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reservations, setReservations] = useState([]);
    const [reservationCode, setReservationCode] = useState("");

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch('/api/reservations');
                if (response.ok) {
                    const data = await response.json();
                    
                    const validReservations = [];
                    const now = new Date();
                    
                    for (const r of data) {
                        let shouldDelete = false;
                        
                        // Check if the reservation is past 30 mins
                        if (r.date && r.date.startsWith('Today') && r.time) {
                            const [timePart, modifier] = r.time.split(' ');
                            if (timePart && modifier) {
                                let [hours, minutes] = timePart.split(':').map(Number);
                                
                                if (modifier === 'PM' && hours !== 12) hours += 12;
                                if (modifier === 'AM' && hours === 12) hours = 0;
                                
                                const reservationTime = new Date();
                                reservationTime.setHours(hours, minutes, 0, 0);
                                
                                const diffMins = (now - reservationTime) / (1000 * 60);
                                if (diffMins >= 2) {
                                    shouldDelete = true;
                                }
                            }
                        }
                        
                        if (shouldDelete) {
                            try {
                                await fetch(`/api/reservations/${r._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                });
                            } catch (e) {
                                console.error('Failed to auto-delete check', e);
                            }
                        } else {
                            validReservations.push(r);
                        }
                    }

                    setReservations(validReservations);
                }
            } catch (error) {
                console.error("Failed to fetch reservations", error);
            }
        };
        fetchReservations();
    }, []);



    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert("Please log in to make a reservation.");
                navigate('/login');
                return;
            }
            const user = JSON.parse(userStr);
            const userId = user.id || user._id;

            const payload = {
                userId,
                date: selectedDate,
                time: selectedTime,
                seats: selectedSeats,
                location: LOCATIONS.find(l => l.id === selectedLocation)?.name || selectedLocation,
                tableId: selectedTable
            };

            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to create reservation');
            } else {
                const data = await response.json();
                setReservationCode(data.reservationCode);
            }

            setStep(2);
        } catch (error) {
            console.error("Reservation failed:", error);
            alert("Reservation failed: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen bg-surface-50 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900">
          Reserve a Table
        </h1>
        <p className="text-surface-500 mt-1">
          Book your spot at the food court to skip the wait.
        </p>
      </div>

      {step === 1 ? (<div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Date & Time Selection */}
            <div className="bg-surface-0 rounded-2xl overflow-hidden shadow-card border border-surface-100 p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                <CalendarIcon size={20} className="text-brand-500"/>
                Select Date & Time
              </h2>

              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 hide-scrollbar">
                {INITIAL_DATE_OPTIONS.map((date) => (<button key={date} onClick={() => { setSelectedDate(date); setSelectedTable(null); }} className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedDate === date ? 'bg-surface-900 text-white shadow-md' : 'bg-surface-50 text-surface-600 hover:bg-surface-100'}`}>
                      {date}
                    </button>))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot, i) => {
                  let isSlotAvailable = slot.available;
                  
                  if (selectedDate.startsWith('Today')) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    
                    const [timePart, modifier] = slot.time.split(' ');
                    let [hours, minutes] = timePart.split(':').map(Number);
                    
                    if (modifier === 'PM' && hours !== 12) hours += 12;
                    if (modifier === 'AM' && hours === 12) hours = 0;
                    
                    if (hours < currentHour || (hours === currentHour && minutes <= currentMinute)) {
                      isSlotAvailable = false;
                    }
                  }

                  return (
                      <button 
                        key={i} 
                        disabled={!isSlotAvailable} 
                        onClick={() => { setSelectedTime(slot.time); setSelectedTable(null); }} 
                        className={`py-3 rounded-xl text-sm font-medium transition-all border ${!isSlotAvailable ? 'bg-surface-50 border-surface-100 text-surface-400 cursor-not-allowed' : selectedTime === slot.time ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm' : 'bg-surface-0 border-surface-200 text-surface-700 hover:border-brand-300'}`}
                      >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seats & Location Selection */}
            <div className="bg-surface-0 rounded-2xl overflow-hidden shadow-card border border-surface-100 p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                <UsersIcon size={20} className="text-brand-500"/>
                Select Seats & Location
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-surface-700 mb-3">Number of Seats Required</label>
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {[1, 2, 3, 4].map((num) => (<button key={num} onClick={() => setSelectedSeats(num)} className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedSeats === num ? 'bg-surface-900 text-white shadow-md' : 'bg-surface-50 text-surface-600 hover:bg-surface-100'}`}>
                      {num} {num === 1 ? 'Seat' : 'Seats'}
                    </button>))}
                </div>
                <p className="text-xs text-surface-500 mt-2">*Note: All tables seat up to 4 people.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-3">Area</label>
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {LOCATIONS.map((loc) => (<button key={loc.id} onClick={() => { setSelectedLocation(loc.id); setSelectedTable(null); }} className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedLocation === loc.id ? 'bg-surface-900 text-white shadow-md' : 'bg-surface-50 text-surface-600 hover:bg-surface-100'}`}>
                      {loc.name}
                    </button>))}
                </div>
              </div>
            </div>

            {/* Table Map */}
            <motion.div initial={{
                opacity: 0,
                y: 20,
            }} animate={{
                opacity: selectedTime ? 1 : 0.5,
                y: 0,
            }} className={!selectedTime ? 'pointer-events-none' : ''}>
              <div className="bg-surface-0 rounded-2xl overflow-hidden shadow-card border border-surface-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                    <UsersIcon size={20} className="text-brand-500"/>
                    Select a Table
                  </h2>
                  <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-success-500"></div>
                      Available
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full border-2 border-yellow-400 bg-yellow-50"></div>
                      Available (Shared)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      Full
                    </div>
                  </div>
                </div>

                <div className="bg-surface-50 p-6 rounded-xl border border-surface-200 relative">
                  {/* Decorative elements to look like a floor plan */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-surface-300 rounded-b-lg"></div>
                  <div className="text-center text-xs text-surface-400 font-medium mb-8 uppercase tracking-widest">
                    Entrance
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    {LOCATIONS.find(l => l.id === selectedLocation)?.tables.map((table) => {
                      const locationName = LOCATIONS.find(l => l.id === selectedLocation)?.name || selectedLocation;
                      
                      // sum all active reservations for this specific table slot
                      const reservedSeats = reservations
                        .filter(r => 
                            r.date === selectedDate && 
                            r.time === selectedTime && 
                            r.location === locationName && 
                            String(r.tableId) === String(table.id) &&
                            r.status !== 'Cancelled'
                        )
                        .reduce((sum, r) => sum + Number(r.seats), 0);

                      const availableSeats = table.seats - reservedSeats;
                      const isTooSmall = availableSeats < selectedSeats;
                      const isFullyOccupied = availableSeats <= 0;
                      
                      const isDisabled = isTooSmall || isFullyOccupied;
                      
                      return (
                        <button 
                          key={table.id} 
                          disabled={isDisabled} 
                          onClick={() => setSelectedTable(table.id)} 
                          className={`
                            relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all
                            ${isFullyOccupied ? 'bg-red-50 border-2 border-red-200 text-red-400 cursor-not-allowed' 
                              : isTooSmall ? 'bg-surface-100 border-2 border-surface-200 text-surface-400 cursor-not-allowed opacity-60'
                              : selectedTable === table.id ? 'bg-brand-500 border-2 border-brand-600 text-white shadow-glow-orange scale-105 z-10' 
                              : reservedSeats > 0 ? 'bg-yellow-50 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-100' // Partially occupied
                              : 'bg-success-50 border-2 border-success-400 text-success-700 hover:bg-success-100'}
                          `}
                        >
                          <span className="font-bold text-lg mb-1">
                            T{table.id}
                          </span>
                          <span className="text-xs opacity-80 font-medium tracking-tight">
                            {reservedSeats > 0 && !isFullyOccupied ? `${availableSeats} Seats Left` : isFullyOccupied ? 'Full' : `${table.seats} Seats`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface-0 rounded-2xl overflow-hidden shadow-card border border-surface-100 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-surface-900 mb-4">
                Reservation Summary
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-surface-500">Date</span>
                  <span className="font-medium text-surface-900">
                    {selectedDate}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-surface-500">Time</span>
                  <span className="font-medium text-surface-900">
                    {selectedTime || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-surface-500">Location</span>
                  <span className="font-medium text-surface-900">
                    {LOCATIONS.find(l => l.id === selectedLocation)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-surface-500">Seats</span>
                  <span className="font-medium text-surface-900">
                    {selectedSeats} {selectedSeats === 1 ? 'Seat' : 'Seats'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-surface-500">Table</span>
                  <span className="font-medium text-surface-900">
                    {selectedTable ? `Table ${selectedTable}` : 'Not selected'}
                  </span>
                </div>
              </div>

              <button className={`w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 focus:ring-brand-500 shadow-soft px-8 py-3.5 text-lg ${isSubmitting ? 'opacity-75 cursor-wait' : ''}`} disabled={!selectedTime || !selectedTable || !selectedSeats || isSubmitting} onClick={handleConfirm}>
                {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div> /* Success State */) : (<motion.div initial={{
                opacity: 0,
                scale: 0.95,
            }} animate={{
                opacity: 1,
                scale: 1,
            }} className="max-w-md mx-auto mt-12">
          <div className="bg-surface-0 rounded-2xl shadow-card border text-center overflow-hidden border-success-200">
            <div className="bg-success-50 py-8 px-6 border-b border-success-100">
              <div className="w-16 h-16 bg-success-100 text-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon size={32}/>
              </div>
              <h2 className="text-2xl font-bold text-surface-900 mb-2">
                Reservation Confirmed!
              </h2>
              <p className="text-surface-600">
                Your table is booked and waiting for you.
              </p>
            </div>

            <div className="p-8">
              <div 
                className="bg-surface-50 p-4 rounded-2xl border border-surface-200 inline-block mb-6 relative group cursor-pointer transition-transform hover:scale-105" 
                onClick={() => navigate(`/checkin/${selectedLocation}/${selectedTable}`)}
                title="Click to simulate scanning QR code on table"
              >
                <div className="absolute inset-0 bg-brand-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-brand-600 font-bold text-xs bg-white px-2 py-1 rounded shadow-sm">Scan</span>
                </div>
                <QrCodeIcon size={120} className="text-surface-800"/>
              </div>
              
              <div className="mb-6 -mt-2">
                <span className="inline-block px-4 py-2 bg-brand-50 text-brand-700 font-bold text-2xl rounded-xl tracking-widest border border-brand-200 uppercase">
                    {reservationCode}
                </span>
                <p className="text-sm text-surface-500 mt-3">
                  Click the QR code above or enter this PIN at the table to check in.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left bg-surface-50 p-4 rounded-xl mb-8">
                <div>
                  <p className="text-xs text-surface-500">Date</p>
                  <p className="font-semibold text-surface-900">
                    {selectedDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-500">Time</p>
                  <p className="font-semibold text-surface-900">
                    {selectedTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-500">Location & Seats</p>
                  <p className="font-semibold text-surface-900">
                    {LOCATIONS.find(l => l.id === selectedLocation)?.name} ({selectedSeats} {selectedSeats === 1 ? 'Seat' : 'Seats'})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-500">Table</p>
                  <p className="font-semibold text-surface-900">
                    T{selectedTable}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 focus:ring-brand-500 shadow-soft px-5 py-2.5 text-base" onClick={() => setStep(1)}>
                  Book Another Table
                </button>
                <button className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-surface-0 text-surface-800 border-2 border-surface-200 hover:border-brand-500 hover:text-brand-600 focus:ring-surface-200 px-5 py-2.5 text-base" onClick={() => navigate('/menu')}>
                  Pre-order Food
                </button>
              </div>
            </div>
          </div>
        </motion.div>)}
            </main>
        </div>);
}

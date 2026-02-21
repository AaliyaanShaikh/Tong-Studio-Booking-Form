import { useState, useEffect, useCallback, useRef, type FC, type FormEvent, type TouchEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { FEATURED_STUDIOS } from '../constants/FeaturedConstants';

const TIMING_SLOTS = [
  { id: '2h', label: '2 hours', price: '₹6,000', tag: 'Quick session' },
  { id: '4h', label: '4 hours', price: '₹10,000', tag: 'Half day' },
  { id: '12h', label: '12 hours', price: '₹30,000', tag: 'Full day' },
  { id: '24h', label: '24 hours', price: '₹60,000', tag: 'Extended' },
];

const ADDONS = [
  { id: 'lighting', label: 'Professional lighting kit', price: '+₹2,000' },
  { id: 'crew', label: 'Dedicated crew support', price: '+₹5,000' },
  { id: 'teleprompter', label: 'Teleprompter', price: '+₹1,500' },
  { id: 'backdrop', label: 'Custom backdrop setup', price: '+₹3,000' },
  { id: 'greenroom', label: 'Green room access', price: '+₹1,000' },
];

const STEPS = [
  { id: 1, title: 'Select setup' },
  { id: 2, title: 'Select date' },
  { id: 3, title: 'Select timing' },
  { id: 4, title: 'Add-ons & requests' },
];

const STEP_TRANSITION = { duration: 0.3 };
const INPUT_CLASS =
  'rounded-xl border-2 border-stone-200 font-sans px-5 py-4 focus:outline-none focus:ring-2 focus:ring-champagne-400 focus:border-transparent';

const BookingPage: FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [studioIndex, setStudioIndex] = useState(0);
  const [booking, setBooking] = useState({
    setup: '',
    date: '',
    timing: '',
    addons: [] as string[],
    extraRequests: '',
    name: '',
    email: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const canProceed =
    step === 1 ? !!booking.setup : step === 2 ? !!booking.date : step === 3 ? !!booking.timing : true;

  const currentStudio = FEATURED_STUDIOS[studioIndex];

  const goPrev = useCallback(() => {
    setStudioIndex((i) => {
      const prev = i === 0 ? FEATURED_STUDIOS.length - 1 : i - 1;
      setBooking((b) => ({ ...b, setup: FEATURED_STUDIOS[prev].id }));
      return prev;
    });
  }, []);

  const goNext = useCallback(() => {
    setStudioIndex((i) => {
      const next = i === FEATURED_STUDIOS.length - 1 ? 0 : i + 1;
      setBooking((b) => ({ ...b, setup: FEATURED_STUDIOS[next].id }));
      return next;
    });
  }, []);

  useEffect(() => {
    if (step === 1) {
      const idx = FEATURED_STUDIOS.findIndex((s) => s.id === booking.setup);
      if (idx >= 0) setStudioIndex(idx);
      else setBooking((b) => ({ ...b, setup: FEATURED_STUDIOS[studioIndex].id }));
    }
  }, [step]);

  const wheelLockedUntil = useRef(0);
  useEffect(() => {
    if (step !== 1) return;
    const LOCK_MS = 400;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now < wheelLockedUntil.current) return;
      wheelLockedUntil.current = now + LOCK_MS;
      if (e.deltaY < 0) goNext();
      else if (e.deltaY > 0) goPrev();
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [step, goNext, goPrev]);

  const touchStart = useRef(0);
  const lastTouchNav = useRef(0);
  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: TouchEvent) => {
    if (step !== 1) return;
    const now = Date.now();
    if (now - lastTouchNav.current < 300 || Math.abs(e.changedTouches[0].clientX - touchStart.current) < 60) return;
    lastTouchNav.current = now;
    e.changedTouches[0].clientX > touchStart.current ? goNext() : goPrev();
  };

  const selectStudio = (i: number) => {
    setStudioIndex(i);
    setBooking((b) => ({ ...b, setup: FEATURED_STUDIOS[i].id }));
  };

  const handleAddonToggle = (id: string) => {
    setBooking((b) => ({
      ...b,
      addons: b.addons.includes(id)
        ? b.addons.filter((x) => x !== id)
        : [...b.addons, id],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center px-4 sm:px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-full bg-champagne-200 flex items-center justify-center">
            <Check className="w-8 h-8 sm:w-10 sm:h-10 text-champagne-600" strokeWidth={2.5} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal-900 mb-4">Booking confirmed</h1>
          <p className="font-sans text-stone-600 mb-8 leading-relaxed">
            Thank you for your booking. We&apos;ll send a confirmation to your email shortly and reach out to finalise the details.
          </p>
          <Link
            to="/"
            className="inline-block px-8 sm:px-10 py-4 rounded-full bg-charcoal-900 text-white font-sans text-sm font-bold uppercase tracking-[0.2em] hover:bg-charcoal-800 active:bg-charcoal-950 transition-colors touch-manipulation min-h-[48px]"
          >
            Return home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alabaster relative">
      {/* Full-screen background for step 1 */}
      {step === 1 && (
        <div className="fixed inset-0 z-0 bg-charcoal-900">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={currentStudio.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="absolute inset-0"
            >
              <img
                src={currentStudio.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/50 to-charcoal-900/30" />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 pt-[max(1.75rem,env(safe-area-inset-top))] md:pt-12 pb-5 sm:pb-6 md:pb-8 px-4 sm:px-6 md:px-12 transition-colors ${
        step === 1 ? 'bg-transparent' : 'bg-alabaster/95 backdrop-blur-sm border-b border-stone-200'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className={`font-serif text-xl sm:text-2xl font-bold transition-colors ${
              step === 1 ? 'text-white hover:text-champagne-300' : 'text-charcoal-900 hover:text-champagne-600'
            }`}
          >
            TONG STUDIO
          </Link>
          <div className={`font-sans text-sm uppercase tracking-wider ${
            step === 1 ? 'text-white/90' : 'text-stone-500'
          }`}>
            Step {step} of 4
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className={`relative z-10 pt-20 sm:pt-28 md:pt-32 pb-6 sm:pb-8 px-4 sm:px-6 ${step === 1 ? 'text-white' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 md:gap-4">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s.id <= step ? 'bg-champagne-500' : step === 1 ? 'bg-white/30' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
          <p className={`font-sans uppercase tracking-[0.2em] text-xs font-bold mt-4 ${
            step === 1 ? 'text-champagne-300' : 'text-champagne-600'
          }`}>
            {STEPS[step - 1]?.title}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className={`relative z-10 px-4 sm:px-6 pb-[calc(6rem+env(safe-area-inset-bottom))] max-w-4xl mx-auto ${step === 1 ? 'min-h-[50vh]' : ''}`}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={STEP_TRANSITION}
              className="relative flex flex-col items-center justify-center min-h-[55vh] touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                onClick={goPrev}
                className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors touch-manipulation"
                aria-label="Previous studio"
              >
                <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors touch-manipulation"
                aria-label="Next studio"
              >
                <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>

              <div className="text-center text-white px-4 sm:px-12 md:px-24">
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{currentStudio.title}</h3>
                <p className="font-sans text-champagne-200 text-sm sm:text-base md:text-lg mb-1 sm:mb-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{currentStudio.location}</p>
                <p className="font-sans text-white text-xs sm:text-sm md:text-base mb-3 sm:mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] max-sm:line-clamp-2">{currentStudio.features.join(' · ')}</p>
                <p className="font-sans text-champagne-300 font-semibold text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{currentStudio.price}</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={STEP_TRANSITION}
              className="space-y-6"
            >
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal-900">Select a date</h2>
              <p className="font-sans text-stone-500">Pick your preferred booking date.</p>
              <div>
                <input
                  type="date"
                  value={booking.date}
                  onChange={(e) => setBooking((b) => ({ ...b, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full max-w-md text-lg text-charcoal-900 ${INPUT_CLASS}`}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={STEP_TRANSITION}
              className="space-y-6"
            >
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal-900">Select timing</h2>
              <p className="font-sans text-stone-500">Choose your booking duration.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {TIMING_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setBooking((b) => ({ ...b, timing: slot.id }))}
                    className={`p-4 sm:p-6 rounded-2xl border-2 text-left transition-all touch-manipulation ${
                      booking.timing === slot.id
                        ? 'border-champagne-500 bg-champagne-100'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-900">{slot.label}</span>
                    <span className="block font-sans text-champagne-600 font-semibold mt-1">{slot.price}</span>
                    <span className="block font-sans text-stone-500 text-sm mt-1">{slot.tag}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.form
              key="step4"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={STEP_TRANSITION}
              className="space-y-8"
            >
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal-900">Add-ons & contact</h2>
              <p className="font-sans text-stone-500">Enhance your booking and share any special requests.</p>

              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-3">
                  Add-on services
                </label>
                <div className="space-y-2">
                  {ADDONS.map((addon) => (
                    <label
                      key={addon.id}
                      className={`flex items-center justify-between gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all touch-manipulation ${
                        booking.addons.includes(addon.id)
                          ? 'border-champagne-500 bg-champagne-100'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="font-sans font-medium text-charcoal-900 min-w-0 truncate">{addon.label}</span>
                      <span className="font-sans text-champagne-600 font-semibold shrink-0">{addon.price}</span>
                      <input
                        type="checkbox"
                        checked={booking.addons.includes(addon.id)}
                        onChange={() => handleAddonToggle(addon.id)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="extra" className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
                  Extra requests
                </label>
                <textarea
                  id="extra"
                  rows={4}
                  value={booking.extraRequests}
                  onChange={(e) => setBooking((b) => ({ ...b, extraRequests: e.target.value }))}
                  placeholder="Any special requirements, equipment, or setup preferences..."
                  className={`w-full resize-none ${INPUT_CLASS}`}
                />
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-serif text-xl text-charcoal-900">Your details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={booking.name}
                    onChange={(e) => setBooking((b) => ({ ...b, name: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={booking.email}
                    onChange={(e) => setBooking((b) => ({ ...b, email: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone"
                    value={booking.phone}
                    onChange={(e) => setBooking((b) => ({ ...b, phone: e.target.value }))}
                    className={`sm:col-span-2 ${INPUT_CLASS}`}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-stone-300 text-charcoal-900 font-sans font-semibold hover:bg-stone-100 active:bg-stone-200 transition-colors touch-manipulation"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-4 rounded-full bg-charcoal-900 text-white font-sans text-sm font-bold uppercase tracking-[0.2em] hover:bg-charcoal-800 active:bg-charcoal-950 transition-colors touch-manipulation"
                >
                  Confirm booking
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Navigation (steps 1–3) */}
        {step < 4 && (
          <div className="flex flex-col items-center gap-4 mt-6 sm:mt-8">
            <div className="flex flex-row gap-2 sm:gap-4 w-full">
              <button
                type="button"
                onClick={() => (step === 1 ? navigate('/') : setStep((s) => s - 1))}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-3 sm:px-6 sm:py-4 rounded-full bg-white border-2 border-stone-300 text-charcoal-900 font-sans text-sm sm:text-base font-semibold hover:bg-stone-100 active:bg-stone-200 transition-colors touch-manipulation min-h-[44px] sm:min-h-[48px] shrink-0"
              >
                <ArrowLeft size={18} />
                {step === 1 ? 'Home' : 'Back'}
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed}
                className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-full font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-colors min-h-[44px] sm:min-h-[48px] touch-manipulation ${
                  canProceed
                    ? 'bg-charcoal-900 text-white hover:bg-charcoal-800 active:bg-charcoal-950'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight size={18} />
              </button>
            </div>
            {step === 1 && (
              <div className="flex gap-2 pt-6">
                {FEATURED_STUDIOS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectStudio(i)}
                    className={`h-2 rounded-full transition-all touch-manipulation flex-shrink-0 ${
                      i === studioIndex ? 'bg-champagne-400 w-8' : 'bg-white/50 hover:bg-white/70 w-2'
                    }`}
                    aria-label={`Select ${s.title}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingPage;

import React, { useRef, useState } from "react";
import { Modal, Button, Carousel } from "antd";
import { Star, Target, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RulesModal({ isOpen, onClose }) {
  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    carouselRef.current?.next();
  };

  const handleClose = () => {
    setCurrentSlide(0);
    if (carouselRef.current) {
      carouselRef.current.goTo(0, true);
    }
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={600}
      className="rules-modal"
      classNames={{
        content: 'bg-white rounded-3xl p-6 shadow-2xl overflow-hidden'
      }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">How to Play</h2>
        <p className="text-slate-500">Master the topics by balancing your practice!</p>
      </div>

      <Carousel 
        ref={carouselRef}
        dotPosition="bottom"
        afterChange={(current) => setCurrentSlide(current)}
      >
        {/* Slide 1 */}
        <div className="px-4 pb-12 outline-none">
          <div className="bg-slate-50 rounded-2xl p-6 text-center h-[280px] flex flex-col justify-center items-center border border-slate-100">
            <Target size={48} className="text-indigo-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">1. Choose Your Difficulty</h3>
            <p className="text-slate-600 leading-relaxed">
              When you click <strong className="text-slate-800">Start</strong> on a topic, you'll be asked to choose between Easy, Medium, and Hard. Each difficulty has a unique set of questions and time limit.
            </p>
          </div>
        </div>

        {/* Slide 2 */}
        <div className="px-4 pb-12 outline-none">
          <div className="bg-slate-50 rounded-2xl p-6 text-center h-[280px] flex flex-col justify-center items-center border border-slate-100">
            <div className="flex gap-2 mb-4 justify-center">
              <Star size={32} fill="#10b981" color="#10b981" />
              <Star size={32} fill="#eab308" color="#eab308" />
              <Star size={32} fill="#ef4444" color="#ef4444" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">2. Earn Multipliers</h3>
            <p className="text-slate-600 leading-relaxed mb-3">
              Pass a test with a score of 70% or higher to earn a star for that difficulty.
            </p>
            <p className="text-slate-600 text-sm bg-white px-4 py-2 rounded-lg border border-slate-200">
              Pass it again to increase your multiplier (e.g. 🌟 <strong className="text-slate-800">× 2</strong>)!
            </p>
          </div>
        </div>

        {/* Slide 3 */}
        <div className="px-4 pb-12 outline-none">
          <div className="bg-slate-50 rounded-2xl p-6 text-center h-[280px] flex flex-col justify-center items-center border border-slate-100">
            <Trophy size={48} className="text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">3. Rank Up</h3>
            <p className="text-slate-600 leading-relaxed">
              Your Mastery Rank is determined by your <strong className="text-slate-800">lowest</strong> multiplier. 
              To reach Intermediate, you must earn at least 1 star in Easy, Medium, AND Hard.
            </p>
            <p className="text-xs text-slate-400 mt-4 uppercase tracking-widest font-bold">
              Novice → Intermediate → Advanced → Expert → Master → Grandmaster
            </p>
          </div>
        </div>
      </Carousel>

      <div className="mt-6 flex justify-center gap-3 min-h-[40px]">
        <AnimatePresence mode="popLayout">
          {currentSlide > 0 && (
            <motion.div
              key="prev-btn"
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                type="primary" 
                size="large" 
                className="font-bold px-8 bg-blue-500 text-white border-none hover:bg-blue-500 hover:text-white focus:bg-blue-500 active:bg-blue-600 transition-none"
                onClick={() => carouselRef.current?.prev()}
              >
                Previous
              </Button>
            </motion.div>
          )}
          
          {currentSlide < 2 ? (
            <motion.div
              key="next-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                type="primary" 
                size="large" 
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-none font-bold px-8 shadow-md shadow-violet-500/20"
                onClick={handleNext}
              >
                Next
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="got-it-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                type="primary" 
                size="large" 
                className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 border-none font-bold px-8 shadow-md shadow-emerald-500/20"
                onClick={handleClose}
              >
                Got it!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

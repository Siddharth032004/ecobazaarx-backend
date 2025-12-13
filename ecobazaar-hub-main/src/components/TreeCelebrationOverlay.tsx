import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, ShoppingBag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Custom CSS for animations embedded within the component for simplicity
// In a larger app, these might go in a separate CSS file
const animationStyles = `
  @keyframes growTree {
    0% { transform: scale(0.5) translateY(50px); opacity: 0; }
    60% { transform: scale(1.1) translateY(0); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes floatLeaf {
    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: translateY(100px) translateX(20px) rotate(180deg); opacity: 0; }
  }
  @keyframes floatParticle {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-40px) scale(0); opacity: 0; }
  }
  @keyframes fadeInSlideUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes modalEnter {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  .animate-grow-tree { animation: growTree 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  .animate-leaf-1 { animation: floatLeaf 3s ease-in-out infinite; animation-delay: 1.5s; }
  .animate-leaf-2 { animation: floatLeaf 3.5s ease-in-out infinite; animation-delay: 1.0s; }
  .animate-leaf-3 { animation: floatLeaf 4s ease-in-out infinite; animation-delay: 1.8s; }
  .animate-fade-in-up { animation: fadeInSlideUp 0.8s ease-out forwards; }
  .animate-modal-enter { animation: modalEnter 0.5s ease-out forwards; }
  
  .particle {
    position: absolute;
    background: #10B981;
    border-radius: 50%;
  }
`;

interface TreeCelebrationOverlayProps {
    co2Saved: number;
    totalCo2Saved?: number;
    pointsEarned?: number;
    onClose: () => void;
    isOpen: boolean;
}

export const TreeCelebrationOverlay = ({
    co2Saved,
    totalCo2Saved,
    pointsEarned,
    onClose,
    isOpen
}: TreeCelebrationOverlayProps) => {
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Delay content display slightly for backdrop fade
            setTimeout(() => setShowContent(true), 100);
        } else {
            setShowContent(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <style>{animationStyles}</style>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-teal-900/90 to-black/80 backdrop-blur-sm transition-opacity duration-500 ease-in-out"
                    style={{ opacity: showContent ? 1 : 0 }}
                />

                {/* Modal Card */}
                {showContent && (
                    <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white/10 p-1 shadow-2xl animate-modal-enter border border-white/20">
                        {/* Glassy Background Inner */}
                        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-teal-800/80 to-teal-950/90 p-8 text-center backdrop-blur-md">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Tree Animation Section */}
                            <div className="relative mb-8 mt-4 h-48 w-48 flex items-end justify-center">
                                {/* Particles */}
                                <div className="absolute inset-0 z-0">
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="particle"
                                            style={{
                                                left: `${20 + Math.random() * 60}%`,
                                                top: `${40 + Math.random() * 40}%`,
                                                width: `${4 + Math.random() * 6}px`,
                                                height: `${4 + Math.random() * 6}px`,
                                                animation: `floatParticle 1.5s ease-out infinite`,
                                                animationDelay: `${Math.random() * 2 + 1}s`,
                                                opacity: 0
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Tree Icon - Growing */}
                                <div className="relative z-10 animate-grow-tree origin-bottom">
                                    <svg
                                        width="120"
                                        height="120"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1" // Thinner stroke for elegance
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                    >
                                        {/* Stylized Tree */}
                                        <path d="M12 22v-14" strokeWidth="2" />
                                        <path d="M12 8c-2-3-6-3-6 1s4 4 6 5c2-1 6-2 6-5s-4-4-6-1z" fill="#34D399" fillOpacity="0.8" stroke="none" />
                                        {/* Using a simpler leaf path for the "foliage" part */}
                                        <path d="M12 8 C 8 4, 4 8, 7 12 C 9 14, 12 13, 12 13 C 12 13, 15 14, 18 12 C 20 8, 16 4, 12 8" stroke="#34D399" strokeWidth="1.5" fill="#10B981" />
                                    </svg>

                                    {/* Floating Leaves */}
                                    <Leaf className="absolute -top-4 -left-6 h-6 w-6 text-emerald-300 animate-leaf-1" style={{ opacity: 0 }} />
                                    <Leaf className="absolute top-0 -right-8 h-5 w-5 text-emerald-200 animate-leaf-2" style={{ opacity: 0 }} />
                                    <Leaf className="absolute -top-8 left-2 h-4 w-4 text-emerald-400 animate-leaf-3" style={{ opacity: 0 }} />
                                </div>
                            </div>

                            {/* Text Section */}
                            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                                <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
                                    Thank You! 🌱
                                </h2>
                                <p className="text-teal-100 text-lg leading-relaxed max-w-xs mx-auto">
                                    Your order just made the planet a little greener.
                                </p>

                                {/* Stats */}
                                <div className="my-6 inline-block rounded-lg border border-emerald-500/30 bg-emerald-900/30 px-6 py-3 shadow-inner">
                                    <p className="text-sm font-medium text-emerald-200 uppercase tracking-wider">CO₂ Saved Included</p>
                                    <p className="text-4xl font-extrabold text-white mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                        {co2Saved.toFixed(1)} <span className="text-xl font-normal text-emerald-300">kg</span>
                                    </p>
                                    {totalCo2Saved !== undefined && totalCo2Saved > co2Saved && (
                                        <p className="text-xs text-emerald-400/80 mt-1">
                                            Total Lifetime Impact: {totalCo2Saved.toFixed(1)} kg
                                        </p>
                                    )}
                                    {pointsEarned !== undefined && (
                                        <div className="mt-3 pt-3 border-t border-emerald-500/30">
                                            <p className="text-sm font-medium text-emerald-200 uppercase tracking-wider">Points Earned</p>
                                            <p className="text-2xl font-bold text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                                +{pointsEarned} <span className="text-lg font-normal text-yellow-100">pts</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                                <Button
                                    onClick={() => { onClose(); navigate("/profile"); }}
                                    className="w-full bg-white/90 text-teal-900 hover:bg-white sm:w-auto font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                >
                                    View Order Details
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => { onClose(); navigate("/products"); }}
                                    className="w-full border-teal-200/30 bg-teal-800/30 text-teal-100 hover:bg-teal-700/50 hover:text-white sm:w-auto backdrop-blur-sm transition-all hover:scale-105"
                                >
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Continue Shopping
                                </Button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

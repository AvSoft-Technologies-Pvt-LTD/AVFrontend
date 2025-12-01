import { CheckCircle2, MapPin, Calendar, User, CreditCard } from 'lucide-react';

export default function UserDetailsDisplay({ userData, onReset, onNext }) {
    const maskAadhar = (aadhar) => {
        return `XXXX XXXX ${aadhar.slice(-4)}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="w-full max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-gray-100">
            {/* Header */}
            <div className="px-4 sm:px-6 lg:px-10 py-5 sm:py-7 border-b border-gray-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <CheckCircle2 className="w-7 h-7 sm:w-9 sm:h-9 text-[var(--accent-color)] flex-shrink-0" />
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Verification Successful</h2>
                            <p className="text-xs sm:text-sm text-gray-600">Identity confirmed and verified</p>
                        </div>
                    </div>
                    <div className="bg-[var(--accent-color)]/20 px-3 sm:px-5 py-1.5 rounded-full w-fit">
                        <span className="text-[var(--accent-color)] font-bold text-xs sm:text-sm">VERIFIED</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-10">
                <div className="flex flex-col md:flex-row gap-6 lg:gap-12">
                    {/* LEFT COLUMN - Photo and Aadhar */}
                    <div className="w-full md:w-48 lg:w-56 flex-shrink-0">
                        <div className="relative mb-4 sm:mb-6">
                            <div className="absolute inset-0 bg-[var(--accent-color)]/20 blur-2xl rounded-full"></div>

                            {/* PHOTO */}
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-full md:aspect-square mx-auto rounded-2xl overflow-hidden border-4 border-[var(--accent-color)] shadow-xl bg-gray-100">
                                {userData.photoUrl ? (
                                    <img src={userData.photoUrl} alt="user photo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100">
                                        <User className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* AUTHENTIC Badge */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--accent-color)] text-white px-3 py-1 rounded-full shadow-lg">
                                <span className="text-[10px] xs:text-xs font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    AUTHENTIC
                                </span>
                            </div>
                        </div>

                        {/* AADHAR BOX */}
                        <div className="w-full bg-gray-50 rounded-xl p-3 space-y-1 shadow-sm mt-6 sm:mt-8">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Aadhar Number</span>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-[var(--primary-color)] tracking-wider break-all">
                                {maskAadhar(userData.aadharNumber)}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - All other information */}
                    <div className="flex-1">
                        <div className="space-y-5">
                            {/* PERSONAL INFO */}
                            <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-3 sm:mb-4 uppercase tracking-wide">
                                    Personal Information
                                </h3>
                                <div className="space-y-2 sm:space-y-3">
                                    {/* Name */}
                                    <div className="flex flex-col xs:grid xs:grid-cols-[120px,1fr] gap-1.5 xs:gap-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                                            <User className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>Full Name</span>
                                        </div>
                                        <p className="text-sm sm:text-base font-semibold text-[var(--primary-color)] break-words">
                                            Rajesh Kumar Sharma
                                        </p>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="flex flex-col xs:grid xs:grid-cols-[120px,1fr] gap-1.5 xs:gap-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>Date of Birth</span>
                                        </div>
                                        <p className="text-sm sm:text-base font-semibold text-[var(--primary-color)]">
                                            15 May 1990
                                        </p>
                                    </div>

                                    {/* Gender */}
                                    <div className="flex flex-col xs:grid xs:grid-cols-[120px,1fr] gap-1.5 xs:gap-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                                            <User className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>Gender</span>
                                        </div>
                                        <p className="text-sm sm:text-base font-semibold text-[var(--primary-color)]">
                                            Male
                                        </p>
                                    </div>

                                    {/* Address */}
                                    <div className="flex flex-col xs:grid xs:grid-cols-[120px,1fr] gap-1.5 xs:gap-4">
                                        <div className="flex items-start gap-2 text-gray-500 text-xs sm:text-sm">
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                            <span>Address</span>
                                        </div>
                                        <p className="text-sm sm:text-base text-[var(--primary-color)] leading-relaxed break-words">
                                            123, Green Park Society, Sector 12, Viman Nagar, Pune, Maharashtra - 411014
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* VERIFICATION DETAILS */}
                            <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-3 sm:mb-4 uppercase tracking-wide">
                                    Verification Details
                                </h3>

                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-6">
                                    <div className="bg-[var(--accent-color)]/5 rounded-xl p-3 sm:p-4 lg:p-5">
                                        <p className="text-xs text-gray-500 mb-1">Method Used</p>
                                        <p className="text-sm font-bold text-[var(--primary-color)] capitalize">
                                            {userData.verificationMethod || 'Aadhar'}
                                        </p>
                                    </div>

                                    <div className="bg-[var(--accent-color)]/5 rounded-xl p-3 sm:p-4 lg:p-5">
                                        <p className="text-xs text-gray-500 mb-1">Verified At</p>
                                        <p className="text-sm font-bold text-[var(--primary-color)]">
                                            {userData.verifiedAt ? formatDate(userData.verifiedAt) : "Just now"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-300">
                    <div className="text-center mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Is this you?</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Please confirm your details before proceeding</p>
                    </div>
                    <div className="flex flex-col xs:flex-row justify-center gap-3 sm:gap-4">
                        <button
                            onClick={onReset}
                            className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            No, try again
                        </button>
                        <button 
                            onClick={onNext} 
                            className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-[var(--accent-color)] text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                            Yes, it's me
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

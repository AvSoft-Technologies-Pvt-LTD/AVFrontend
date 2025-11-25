import { CheckCircle2, MapPin, Calendar, User, CreditCard, ArrowRight, Share2 } from 'lucide-react';

export default function UserDetailsDisplay({ userData, onReset,onNext }) {
    const maskAadhar = (aadhar) => {
        return `XXXX XXXX ${aadhar.slice(-4)}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="w-full  mx-auto rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-gray-100">
            {/* Header */}
            <div className=" px-10 py-7 border-b border-gray-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 ">
                        <CheckCircle2 className="w-9 h-9 text-[var(--accent-color)]" />
                        <div>
                            <h2 className="h4-heading ">Verification Successful</h2>
                            <p className="text-sm">Identity confirmed and verified</p>
                        </div>
                    </div>

                    <div className="bg-[var(--accent-color)]/20 px-5 py-2 rounded-full">
                        <span className="text-[var(--accent-color)] font-bold text-sm">VERIFIED</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-10 py-10">
                <div className="flex gap-12">
                    {/* LEFT COLUMN - Photo and Aadhar */}
                    <div className="w-40 flex-shrink-0">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-[var(--accent-color)]/20 blur-2xl rounded-full"></div>

                            {/* PHOTO */}
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-[var(--accent-color)] shadow-xl bg-gray-100">
                                {userData.photoUrl ? (
                                    <img src={userData.photoUrl} alt="user photo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100">
                                        <User className="w-24 h-24 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* AUTHENTIC Badge */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--accent-color)] text-white px-5 py-1.5 rounded-full shadow-lg">
                                <span className="text-xs font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    AUTHENTIC
                                </span>
                            </div>
                        </div>

                        {/* AADHAR BOX - Moved below photo */}
                        <div className="w-full bg-gray-50 rounded-xl  p-2 space-y-2 shadow-sm mt-8">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CreditCard className="w-4 h-4" />
                                <span>Aadhar Number</span>
                            </div>
                            <p className="text-sm font-bold text-[var(--primary-color)] tracking-wider">
                                {maskAadhar(userData.aadharNumber)}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - All other information */}
                    <div className="flex-1">

                        {/* RIGHT COLUMN */}
                        <div className="space-y-5">

                            {/* PERSONAL INFO */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                                    Personal Information
                                </h3>
                                <div className="space-y-3">
                                    {/* Name */}
                                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <User className="w-4 h-4" />
                                            Full Name
                                        </div>
                                        <p className="font-semibold text-[var(--primary-color)]">
                                            Rajesh Kumar Sharma
                                        </p>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            Date of Birth
                                        </div>
                                        <p className="font-semibold text-[var(--primary-color)]">
                                            15 May 1990
                                        </p>
                                    </div>

                                    {/* Gender */}
                                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <User className="w-4 h-4" />
                                            Gender
                                        </div>
                                        <p className="font-semibold text-[var(--primary-color)]">
                                            Male
                                        </p>
                                    </div>

                                    {/* Address */}
                                    <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <MapPin className="w-4 h-4" />
                                            Address
                                        </div>
                                        <p className="text-base text-[var(--primary-color)] leading-relaxed">
                                            123, Green Park Society, Sector 12, Viman Nagar, Pune, Maharashtra - 411014
                                        </p>
                                    </div>
                                </div>
                            </div>


                            {/* VERIFICATION DETAILS */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                                    Verification Details
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-[var(--accent-color)]/5 rounded-xl p-5">
                                        <p className="text-xs text-gray-500 mb-1">Method Used</p>
                                        <p className="text-sm font-bold text-[var(--primary-color)] capitalize">
                                            {userData.verificationMethod}
                                        </p>
                                    </div>

                                    <div className="bg-[var(--accent-color)]/5 rounded-xl p-5">
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
     <div className="mt-8 pt-6 border-t border-gray-300">
  <div className="text-center mb-6">
    <h3 className="text-lg font-semibold text-gray-800">Is this you?</h3>
    <p className="text-gray-600 mt-1">Please confirm your details before proceeding</p>
  </div>
  <div className="flex flex-col sm:flex-row justify-center gap-4">
    <button
      onClick={onReset}
      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
    >
      No, try again
    </button>
    <button 
      onClick={onNext} 
      className="px-6 py-2.5 bg-[var(--accent-color)] text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
    >
      Yes, it's me
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
</div>
            </div>
        </div>
    );
}

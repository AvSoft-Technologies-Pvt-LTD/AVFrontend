import React, { useState } from "react";
import * as Lucide from "lucide-react";

const Help = ({ onBackToPayment }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const helpCards = [
    {
      id: "payment-essentials",
      title: "Payment Essentials",
      icon: Lucide.CreditCard,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-blue-600",
      description: "Complete guide to payment methods",
      topics: [
        "How to pay with UPI",
        "How to pay with Cards",
        "Netbanking guide",
        "Wallet payments",
        "EMI options for treatments",
      ],
    },
    {
      id: "refunds-issues",
      title: "Refunds & Issues",
      icon: Lucide.RefreshCw,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      gradient: "from-red-500 to-red-600",
      description: "Resolve payment and refund problems",
      topics: [
        "Payment deducted but not updated",
        "Refund timelines explained",
        "Failed UPI / Card transactions",
        "Duplicate charges",
        "Session timeout errors",
      ],
    },
    {
      id: "healthcare-billing",
      title: "Healthcare & Billing",
      icon: Lucide.Heart,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-green-600",
      description: "Health services and billing support",
      topics: [
        "Using HealthCard for payments",
        "Linking Insurance coverage",
        "Hospital/Lab billing process",
        "Appointment booking payments",
        "Medicine delivery charges",
      ],
    },
    {
      id: "security-safety",
      title: "Security & Safety",
      icon: Lucide.Shield,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-purple-600",
      description: "Keep your payments secure",
      topics: [
        "SSL & PCI Compliance",
        "Protecting your UPI PIN/OTP",
        "Reporting suspicious activity",
        "Safe online payment practices",
        "Data privacy & protection",
      ],
    },
  ];

  const commonQuestions = [
    {
      question: "How do I pay for my medical consultation?",
      answer:
        "You can pay using UPI (GPay, PhonePe, Paytm), Credit/Debit cards, Netbanking, or digital wallets. Select your preferred payment method during checkout and follow the on-screen instructions.",
    },
    {
      question: "Can I use my health insurance for online payments?",
      answer:
        "Yes, you can link your health insurance policy during registration. Eligible treatments and consultations will automatically apply insurance coverage, and you only pay the remaining amount.",
    },
    {
      question: "What if my payment fails during appointment booking?",
      answer:
        "If payment fails, your appointment slot is held for 10 minutes. Try using a different payment method or check your internet connection. Failed payments are automatically refunded within 3-5 business days.",
    },
    {
      question: "How do I get refund for cancelled appointments?",
      answer:
        "Refunds are processed automatically based on our cancellation policy. Cancellations 24 hours before appointment get full refund, while same-day cancellations may have charges as per doctor's policy.",
    },
    {
      question: "Is it safe to store my card details for future payments?",
      answer:
        "Yes, we use bank-grade encryption and tokenization to securely store payment methods. Your actual card details are never stored on our servers, only secure tokens are used for future transactions.",
    },
    {
      question: "Can I pay for family members' treatments?",
      answer:
        "Absolutely! You can add family members to your account and pay for their consultations, lab tests, and medicine orders using your saved payment methods or HealthCard balance.",
    },
  ];

  const filteredQuestions = commonQuestions.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleCardClick = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleBack = () => {
    // Navigate back to previous page
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white bg-gray-800 hover:bg-gray-700 rounded-full px-4 py-2 transition-colors"
        >
          <Lucide.ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="heading-fade-up-inview">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              How can we help you today?
            </h1>
            <p className="text-lg text-green-100 mb-6 max-w-2xl mx-auto">
              Get instant help with payments, healthcare services, and account
              management
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lucide.Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search help topics, issues, or solutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-12 pr-6 py-3 text-base bg-white rounded-xl border-0 shadow-lg focus:ring-4 focus:ring-green-200 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {helpCards.map((card) => {
            const IconComponent = card.icon;
            const isExpanded = expandedCard === card.id;

            return (
              <div
                key={card.id}
                className="card-stat bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`card-icon w-14 h-14 ${card.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent className={`w-7 h-7 ${card.iconColor}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="h4-heading mb-2">{card.title}</h3>
                        <button className="text-[var(--accent-color)] hover:text-[var(--primary-color)] font-medium text-sm transition-colors">
                          {isExpanded ? "Hide" : "See all"} →
                        </button>
                      </div>
                      <p className="paragraph mb-4">{card.description}</p>

                      {!isExpanded && (
                        <div className="space-y-2">
                          {card.topics.slice(0, 2).map((topic, index) => (
                            <div
                              key={index}
                              className="paragraph text-sm flex items-center"
                            >
                              <Lucide.Minus className="w-3 h-3 text-gray-400 mr-2" />
                              {topic}
                            </div>
                          ))}
                          {card.topics.length > 2 && (
                            <div className="text-sm text-[var(--accent-color)]">
                              +{card.topics.length - 2} more topics
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6 modal-slideUp">
                    <div className="space-y-3">
                      {card.topics.map((topic, index) => (
                        <div
                          key={index}
                          className="flex items-center paragraph hover:text-[var(--accent-color)] cursor-pointer transition-colors"
                        >
                          <Lucide.Minus className="w-3 h-3 text-gray-400 mr-3" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Common Questions Section */}
        <div className="mb-16">
          <div className="text-center mb-12 heading-fade-up-inview">
            <h2 className="h2-heading mb-4">Common Questions</h2>
            <p className="paragraph text-xl">
              Quick answers to frequently asked questions
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {(searchTerm ? filteredQuestions : commonQuestions).map(
              (faq, index) => {
                const isExpanded = expandedFaq === index;

                return (
                  <div
                    key={index}
                    className="card-stat bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                    >
                      <h3 className="h4-heading pr-4">{faq.question}</h3>
                      <Lucide.ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-4 modal-slideUp">
                          <p className="paragraph leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
          {searchTerm && filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <Lucide.Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="h4-heading mb-2">No results found</h3>
              <p className="paragraph">
                Try searching with different keywords or browse our help topics
                above.
              </p>
            </div>
          )}
        </div>

        {/* Contact Support Section with Gradient */}
        <div className="bg-gradient-to-br from-[var(--primary-color)] via-gray-800 to-[var(--accent-color)] rounded-2xl text-white shadow-xl p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              Need More Help?
            </h2>
            <p className="text-sm sm:text-base text-green-100">
              Our expert support team is available 24/7 to assist you
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Live Chat */}
            <div className="text-center group p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20">
                <Lucide.MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                Live Chat
              </h3>
              <p className="text-green-100 text-xs sm:text-sm mb-2">
                Get instant help from our support team
              </p>
              <button className="bg-white text-[var(--primary-color)] hover:bg-green-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium">
                Start Chat
              </button>
            </div>

            {/* Email Support */}
            <div className="text-center group p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20">
                <Lucide.Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                Email Support
              </h3>
              <p className="text-green-100 text-xs sm:text-sm mb-2">
                support@avswasthya.com
              </p>
              <button className="bg-white text-[var(--primary-color)] hover:bg-green-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium">
                Send Email
              </button>
            </div>

            {/* Phone Support */}
            <div className="text-center group p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20">
                <Lucide.Phone className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                Phone Support
              </h3>
              <p className="text-green-100 text-xs sm:text-sm mb-2">
                1800-AV-HEALTH (1800-284-32584)
              </p>
              <button className="bg-white text-[var(--primary-color)] hover:bg-green-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium">
                Call Now
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-green-100 text-xs sm:text-sm">
              <Lucide.Clock className="w-4 h-4" />
              <span className="font-medium">
                Available 24/7 • Avg response: 2 min
              </span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="flex flex-wrap justify-center gap-6">
            {[
              "Terms & Conditions",
              "Privacy Policy",
              "Refund Policy",
              "Security Policy",
            ].map((link, index) => (
              <a
                key={index}
                href="#"
                className="text-sm hover:text-[var(--accent-color)] transition-colors font-medium hover:underline"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>
              &copy; 2025 AV Swasthya. All rights reserved. | Made with ❤️ for
              better healthcare
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

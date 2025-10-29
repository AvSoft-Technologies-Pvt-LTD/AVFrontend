import React from 'react';


const testimonials = [
  {
    text: "After my knee surgery, the combination of online consultations made my recovery smoother than I could have imagined.",
    author: "Linda P.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
  },
  {
    text: "Managing chronic conditions like diabetes requires a lot of vigilance, but the telehealth platform has transformed my life.",
    author: "Henry B.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    text: "The prescription refill system is a game changer for managing my diabetes. It's really efficient and completely hassle-free.",
    author: "Joshua T.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
  },
  {
    text: "Finding a doctor who really understands all of my health needs has now been easier. The platform has changed my life.",
    author: "Samantha K.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  }
];

function Testimonial() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="p-8 max-w-4xl w-full ">
        <div className="text-center mb-8 ">
          <h2 className="text-3xl font-bold text-gray-800">Patient Testimonials</h2>
          <p className="text-gray-600 mt-2">Discover the difference we make through the voices of those we've served.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-cyan-50 shadow-lg relative ">
              <img
                src={testimonial.image}
                alt={testimonial.author}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="text-gray-700 mb-2">{testimonial.text}</p>
                <p className="text-blue-600 font-medium">{testimonial.author}</p>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Testimonial;

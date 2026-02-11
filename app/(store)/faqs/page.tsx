"use client";

import { useState } from 'react';
import Link from 'next/link';

function MinimalAccordion({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-6 group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left focus:outline-none"
      >
        <span className="font-serif text-lg md:text-xl text-gray-900 group-hover:text-gray-600 transition-colors">{question}</span>
        <i className={`ri-arrow-down-s-line text-2xl text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-500 font-light leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'orders', name: 'Orders' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'returns', name: 'Returns' },
    { id: 'payment', name: 'Payment' },
    { id: 'account', name: 'Account' }
  ];

  const faqs = [
    {
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'Browse our products, add items to your cart, proceed to checkout, provide your delivery address, select payment method, and confirm your order. You\'ll receive an email confirmation with your order details and tracking number.'
    },
    {
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 1 hour of placing it. Contact our customer service immediately. Once an order is processed, modifications may not be possible.'
    },
    {
      category: 'orders',
      question: 'How do I track my order?',
      answer: 'After your order ships, you\'ll receive a tracking number via email. Visit our Order Tracking page to see real-time updates.'
    },
    {
      category: 'orders',
      question: 'What if I receive the wrong item?',
      answer: 'Contact us within 48 hours with photos of the item received. We\'ll arrange for the correct item to be sent immediately.'
    },
    {
      category: 'shipping',
      question: 'What are your delivery times?',
      answer: 'Standard delivery takes 2-5 business days. Express delivery (next-day) is available for select cities.'
    },
    {
      category: 'shipping',
      question: 'How much does shipping cost?',
      answer: 'Standard shipping costs are calculated at checkout. Orders over a certain amount qualify for complimentary shipping.'
    },
    {
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'Currently, we ship within the country. We are working on expanding our reach.'
    },
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 14-day return policy for unused items in original packaging. Refunds are processed within 5-7 business days after we receive the item.'
    },
    {
      category: 'returns',
      question: 'Which items cannot be returned?',
      answer: 'For hygiene reasons, opened cosmetics, intimate apparel, and earrings are non-returnable unless defective.'
    },
    {
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit/debit cards and mobile money options. All payments are processed securely.'
    },
    {
      category: 'account',
      question: 'Do I need an account to place an order?',
      answer: 'No, you can checkout as a guest. However, an account allows you to track orders and save your details for faster checkout.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">

      {/* Minimalist Header */}
      <section className="pt-32 pb-16 text-center px-4">
        <span className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Support</span>
        <h1 className="font-serif text-5xl md:text-6xl mb-8">Frequently Asked Questions</h1>

        <div className="max-w-xl mx-auto relative border-b border-gray-300 focus-within:border-black transition-colors">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full py-4 bg-transparent focus:outline-none text-center placeholder:text-gray-400"
          />
          <i className="ri-search-line absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-32">
        {/* Categories as minimalist tabs */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-16">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`text-sm uppercase tracking-widest pb-2 transition-all ${activeCategory === category.id
                ? 'border-b border-black text-black font-bold'
                : 'text-gray-400 hover:text-black border-transparent hover:border-gray-200'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQs List */}
        <div className="max-w-3xl mx-auto min-h-[400px]">
          {filteredFAQs.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredFAQs.map((faq, index) => (
                <MinimalAccordion key={index} {...faq} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-gray-400">
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Minimalist Footer Contact */}
        <div className="mt-32 pt-16 border-t border-gray-100 text-center">
          <h3 className="font-serif text-3xl mb-4">Still need help?</h3>
          <p className="text-gray-500 font-light mb-8">Our team is available Mon-Fri, 9am - 6pm.</p>
          <div className="flex justify-center gap-8">
            <Link href="/contact" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
              Contact Us
            </Link>
            <a href="mailto:support@standardstore.com" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
              Email Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

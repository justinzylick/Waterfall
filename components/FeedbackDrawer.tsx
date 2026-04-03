'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppState } from '@/hooks/useAppState';

export default function FeedbackDrawer() {
  const feedbackOpen = useAppState((s) => s.feedbackOpen);
  const setFeedbackOpen = useAppState((s) => s.setFeedbackOpen);
  const activeChart = useAppState((s) => s.activeChart);
  const isDarkMode = useAppState((s) => s.isDarkMode);

  const [category, setCategory] = useState('feature');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (feedbackOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [feedbackOpen]);

  useEffect(() => {
    if (!feedbackOpen) {
      // Reset form after close animation
      const timer = setTimeout(() => {
        setCategory('feature');
        setMessage('');
        setEmail('');
        setStatus('idle');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [feedbackOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim() || undefined,
          context: { chartType: activeChart, isDarkMode },
        }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('sent');
      setTimeout(() => setFeedbackOpen(false), 1500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {feedbackOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={() => setFeedbackOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[400px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out ${
          feedbackOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Send feedback"
        aria-hidden={!feedbackOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Send Feedback
            </h2>
            <button
              onClick={() => setFeedbackOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close feedback"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
            {/* Category */}
            <div className="space-y-1.5">
              <label htmlFor="fb-category" className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Category
              </label>
              <select
                id="fb-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="chart">New Chart Type</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div className="space-y-1.5 flex-1">
              <label htmlFor="fb-message" className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Message
              </label>
              <textarea
                ref={textareaRef}
                id="fb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what you'd like to see..."
                required
                rows={6}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="fb-email" className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Email <span className="text-gray-400 dark:text-gray-500 normal-case">(optional, for follow-up)</span>
              </label>
              <input
                id="fb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!message.trim() || status === 'sending' || status === 'sent'}
              className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {status === 'idle' && 'Send Feedback'}
              {status === 'sending' && 'Sending...'}
              {status === 'sent' && 'Sent! Thank you'}
              {status === 'error' && 'Failed — Try Again'}
            </button>

            {status === 'error' && (
              <p className="text-xs text-red-500 dark:text-red-400 text-center">
                Something went wrong. Please try again or email us directly.
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";

export default function ForgotPasswordForm({
  email,
  onEmailChange,
  onSubmit,
  onBack,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-md mx-auto w-full"
    >
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FB070F] to-[#ff4d4d] bg-clip-text text-transparent">
          إعادة تعيين كلمة المرور
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
          أدخل بريدك الإلكتروني لاستلام رمز إعادة التعيين
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaEnvelope className="text-[#FB070F] dark:text-[#ff4d4d] text-lg transition-all duration-300 group-focus-within:scale-110" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="بريدك الإلكتروني المسجل"
            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#FB070F] dark:focus:ring-[#ff4d4d] focus:border-transparent transition-all duration-200 group-hover:border-[#FB070F]/50 dark:group-hover:border-[#ff4d4d]/50 text-right"
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onBack}
            className="flex-1 py-3.5 border-2 border-[#FB070F] dark:border-[#ff4d4d] text-[#FB070F] dark:text-[#ff4d4d] rounded-xl font-semibold hover:bg-[#FB070F] dark:hover:bg-[#ff4d4d] hover:text-white transition-all duration-300"
          >
            رجوع
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!email}
            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
              email
                ? "bg-gradient-to-r from-[#FB070F] to-[#ff4d4d] text-white hover:shadow-xl hover:shadow-[#FB070F]/25 dark:hover:shadow-[#ff4d4d]/25"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            إرسال رمز إعادة التعيين
            {email && (
              <div className="absolute inset-0 bg-white/20 translate-x-full hover:translate-x-0 transition-transform duration-700"></div>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

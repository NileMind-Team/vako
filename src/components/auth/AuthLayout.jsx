import { forwardRef } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaGoogle } from "react-icons/fa";

const AuthLayout = forwardRef(
  (
    {
      children,
      activeTab,
      onTabChange,
      onBack,
      showWelcome,
      isProcessingGoogle,
      onGoogleLogin,
      isGoogleLoading,
      onLoginTabClick,
      onRegisterTabClick,
    },
    ref,
  ) => {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff5f5] to-[#ffebeb] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4 relative font-sans overflow-hidden transition-colors duration-300`}
        dir="rtl"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-r from-[#FB070F]/10 to-[#ff4d4d]/10 dark:from-[#FB070F]/20 dark:to-[#ff4d4d]/20 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-r from-[#ff4d4d]/10 to-[#FB070F]/10 dark:from-[#ff4d4d]/20 dark:to-[#FB070F]/20 rounded-full blur-3xl"></div>
        </div>

        {!showWelcome && !isProcessingGoogle && (
          <button
            onClick={onBack}
            className="fixed top-6 left-6 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-[#FB070F] hover:text-white rounded-full p-3 text-[#FB070F] dark:text-gray-300 border border-[#FB070F]/30 dark:border-gray-600 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            style={{ left: "1.5rem", right: "auto" }}
          >
            <FaArrowLeft size={18} />
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-300"
          ref={ref}
        >
          {/* Form Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FB070F]/5 to-transparent rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#ff4d4d]/5 to-transparent rounded-tr-3xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[600px]">
            {/* Left Side - Brand Section with Tabs - Hide during Google processing */}
            {!isProcessingGoogle && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:col-span-1 bg-gradient-to-br from-[#fff5f5] to-[#ffebeb] dark:from-gray-800 dark:to-gray-700 rounded-l-3xl p-8 flex flex-col transition-colors duration-300"
              >
                {/* Brand Content */}
                <div className="space-y-6 mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight text-right">
                    مرحباً بك في{" "}
                    <span className="bg-gradient-to-r from-[#FB070F] to-[#ff4d4d] bg-clip-text text-transparent">
                      Vako
                    </span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-right">
                    انضم إلى مجتمعنا واستمتع بأفضل الخدمات مع نظام أمان متكامل.
                  </p>
                </div>

                {/* Tabs Navigation - Vertical */}
                <div className="flex flex-col gap-3 flex-1 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onTabChange("login");
                      if (window.innerWidth < 1024 && onLoginTabClick) {
                        onLoginTabClick();
                      }
                    }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      activeTab === "login"
                        ? "bg-white dark:bg-gray-800 text-[#FB070F] dark:text-[#ff4d4d] shadow-lg border border-[#FB070F]/20 dark:border-[#ff4d4d]/30"
                        : "text-gray-600 dark:text-gray-400 hover:text-[#FB070F] dark:hover:text-[#ff4d4d] hover:bg-white/50 dark:hover:bg-gray-700/50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-2 h-8 rounded-full ${
                        activeTab === "login"
                          ? "bg-[#FB070F] dark:bg-[#ff4d4d]"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    ></div>
                    <span className="flex-1 text-right">تسجيل الدخول</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onTabChange("register");
                      if (window.innerWidth < 1024 && onRegisterTabClick) {
                        onRegisterTabClick();
                      }
                    }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      activeTab === "register"
                        ? "bg-white dark:bg-gray-800 text-[#FB070F] dark:text-[#ff4d4d] shadow-lg border border-[#FB070F]/20 dark:border-[#ff4d4d]/30"
                        : "text-gray-600 dark:text-gray-400 hover:text-[#FB070F] dark:hover:text-[#ff4d4d] hover:bg-white/50 dark:hover:bg-gray-700/50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-2 h-8 rounded-full ${
                        activeTab === "register"
                          ? "bg-[#FB070F] dark:bg-[#ff4d4d]"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    ></div>
                    <span className="flex-1 text-right">إنشاء حساب</span>
                  </motion.button>
                </div>

                {/* Google Login Button - Now in Layout */}
                <div className="mt-6 mb-6">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-gradient-to-br from-[#fff5f5] to-[#ffebeb] dark:from-gray-800 dark:to-gray-700 text-gray-500 dark:text-gray-400">
                        أو تابع باستخدام
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onGoogleLogin}
                    disabled={isGoogleLoading}
                    className={`w-full flex items-center justify-center gap-3 font-semibold py-3.5 rounded-xl transition-all duration-300 border ${
                      isGoogleLoading
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg"
                    }`}
                  >
                    {isGoogleLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#DB4437]"></div>
                        <span className="text-gray-700 dark:text-gray-300">
                          جاري التوجيه...
                        </span>
                      </div>
                    ) : (
                      <>
                        <FaGoogle className="text-[#DB4437]" size={20} />
                        <span className="text-gray-700 dark:text-gray-300">
                          {activeTab === "login"
                            ? "تسجيل الدخول عبر Google"
                            : "إنشاء حساب عبر Google"}
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Animated Dots */}
                <div className="flex justify-center mt-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-[#FB070F] dark:bg-[#ff4d4d] rounded-full animate-bounce"></div>
                    <div
                      className="w-3 h-3 bg-[#ff4d4d] dark:bg-[#FB070F] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-[#FB070F] dark:bg-[#ff4d4d] rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Right Side - Auth Form - Full width during Google processing */}
            <div
              className={`${
                isProcessingGoogle ? "lg:col-span-3" : "lg:col-span-2"
              } flex flex-col justify-center px-6 py-6 md:px-8 md:py-8`}
            >
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
);

AuthLayout.displayName = "AuthLayout";

export default AuthLayout;

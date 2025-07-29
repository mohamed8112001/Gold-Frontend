import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import GoldPriceDisplay from "../common/GoldPriceDisplay.jsx";
import { useTranslation } from "react-i18next";

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isShopOwner, logout, isRegularUser } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Enhanced scroll detection effect
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 5) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlHeader();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full bg-white/90 backdrop-blur-lg border-b border-amber-100/50 shadow-sm z-50 font-cairo transition-all duration-500 ease-in-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
        dir="rtl"
      >
        <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-16 sm:h-20 md:h-24 lg:h-28 py-2 sm:py-3 md:py-4">
            {/* Right Section: Logo + Gold Prices + Navigation */}
            <div className="flex items-center gap-6 lg:gap-10">
              {/* Enhanced Logo */}
              <Link to="/" className="flex items-center group relative">
                <div className="flex items-center space-x-reverse space-x-4">
                  <div className="relative">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                      <img
                        src="/logo.webp"
                        alt="متجر الذهب"
                        className="w-full h-full rounded-full object-cover ring-2 ring-amber-200/50 transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 rounded-full hidden items-center justify-center shadow-inner">
                        <div className="text-white text-xl font-bold">💍</div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-black font-cairo bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent tracking-tight group-hover:brightness-110 transition-all duration-300 mr-10">
                      متجر الذهب
                    </span>
                  
                  </div>
                </div>
              </Link>

              {/* Gold Prices */}
              <div className="hidden lg:block">
                <GoldPriceDisplay
                  className="scale-95 hover:scale-100 transition-transform duration-300"
                  updateInterval={300000}
                  compact={false}
                />
              </div>

              {/* Navigation */}
              <nav
                className="hidden lg:flex items-center space-x-reverse space-x-4"
                dir="rtl"
              >
                {[
                  { to: "/home", label: t("navigation.home") },
                  { to: "/shops", label: t("navigation.shops") },
                  { to: "/products", label: t("navigation.products") },
                  ...(isAuthenticated && user && isShopOwner
                    ? [{ to: "/dashboard", label: t("navigation.dashboard") }]
                    : []),
                  ...(isAuthenticated && user && isRegularUser
                    ? [
                        { to: "/favorites", label: t("navigation.favorites") },
                        { to: "/my-reservations", label: "حجوزاتي" },
                      ]
                    : []),
                  ...(isAdmin
                    ? [{ to: "/admin", label: t("admin_panel"), isAdmin: true }]
                    : []),
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.to}
                    className={`relative text-amber-800 hover:text-amber-600 font-semibold font-cairo text-base px-6 py-3 rounded-xl hover:bg-amber-50/50 hover:shadow-md hover:scale-105 transition-all duration-300 ${
                      item.isAdmin
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50/50"
                        : ""
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-50/0 to-amber-100/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Left Section: Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-reverse space-x-6 flex-shrink-0">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative flex-shrink-0 cursor-pointer group">
                      <div className="w-15 h-15 bg-gradient-to-br from-[#C37C00] via-[#A66A00] to-[#8A5700] hover:from-[#A66A00] hover:via-[#8A5700] hover:to-[#6D4500] rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg">
                        <span className="text-white font-bold text-base">
                          {user?.firstName?.charAt(0)?.toUpperCase() ||
                            user?.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                    </div>
                  </DropdownMenuTrigger>


                <DropdownMenuContent
  align="end"
  className="w-[90vw] sm:w-[380px] bg-white/95 backdrop-blur-lg border border-amber-200/50 rounded-2xl p-4 mt-2 shadow-2xl"
>
  <div className="px-4 py-4 border-b border-amber-100/50 mb-4 bg-amber-50/30 rounded-xl">
    <div className="flex items-center gap-4 flex-row-reverse">
      <div className="relative w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
        <User className="w-5 h-5 text-amber-700" />
      </div>
      <div className="flex-1 min-w-0 space-y-1 text-right">
        <p
          className="font-semibold text-amber-800 text-base truncate"
          title={user?.firstName || user?.email?.split("@")[0] || "مستخدم"}
        >
          مرحباً، {user?.firstName || user?.email?.split("@")[0] || "مستخدم"}
        </p>
        <span className="inline-flex items-center text-xs font-medium bg-amber-100/40 text-amber-700 px-3 py-1 rounded-full border border-amber-200/50">
          {user?.role === "admin"
            ? "مدير النظام"
            : user?.role === "seller"
            ? "صاحب متجر"
            : user?.role === "customer"
            ? "عضو"
            : ""}
        </span>
      </div>
    </div>
  </div>

  {/* الملف الشخصي */}
  <DropdownMenuItem asChild>
    <Link
      to="/profile"
      className="flex flex-row-reverse items-center gap-3 px-4 py-3 hover:bg-amber-100/30 rounded-xl transition-all duration-300 group"
    >
      <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200 group-hover:bg-amber-100 transition-all">
        <User className="w-4 h-4 text-amber-700 group-hover:text-amber-600" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-amber-800 font-medium text-sm group-hover:text-amber-600">
          {t("navigation.profile")}
        </span>
      </div>
    </Link>
  </DropdownMenuItem>

  {/* تسجيل الخروج */}
  <DropdownMenuItem
    onClick={handleLogout}
    className="flex flex-row-reverse items-center gap-3 px-4 py-3 hover:bg-red-100/30 rounded-xl transition-all duration-300 text-red-600 hover:text-red-700 group"
  >
    <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center border border-red-200 group-hover:bg-red-100 transition-all">
      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
    </div>
    <div className="flex flex-col text-left">
      <span className="font-medium text-sm">{t("navigation.logout")}</span>
    </div>
  </DropdownMenuItem>
</DropdownMenuContent>

                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-reverse space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="border-2 border-amber-300/50 bg-white text-amber-700 hover:text-white hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-600 font-semibold font-tajawal px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-md ml-5"
                  >
                    <span className="flex items-center gap-2">
                      تسجيل الدخول
                    </span>
                  </Button>
                  <Button
                    onClick={() => navigate("/register")}
                    className=""
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      إنشاء حساب
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden ml-4">
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-amber-600 hover:bg-amber-50/50 p-3 rounded-xl transition-all duration-300 hover:shadow-sm"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-6 border-t border-amber-100/50 bg-white/95 backdrop-blur-lg">
              <div className="px-4 mb-6">
                <GoldPriceDisplay compact={true} className="w-full scale-95" />
              </div>
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-4 py-5 px-6 bg-amber-50/30 rounded-2xl border border-amber-200/50 mb-6">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 rounded-xl flex items-center justify-center ring-2 ring-amber-100/50">
                        <span className="text-white font-bold text-lg">
                          {user?.firstName?.charAt(0)?.toUpperCase() ||
                            user?.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0 space-y-1">
                      <span
                        className="text-amber-800 font-bold text-lg truncate block"
                        title={
                          user?.firstName ||
                          user?.email?.split("@")[0] ||
                          "مستخدم"
                        }
                      >
                        مرحباً،{" "}
                        {user?.firstName ||
                          user?.email?.split("@")[0] ||
                          "مستخدم"}
                      </span>
                      <span className="inline-flex items-center text-xs font-semibold bg-amber-50/50 text-amber-700 px-3 py-1 rounded-full border border-amber-200/50">
                        {user?.role === "admin"
                          ? "👑 مدير النظام"
                          : user?.role === "shop_owner"
                          ? "🏪 صاحب متجر"
                          : "👤 عضو"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3 px-4">
                    {[
                      { to: "/home", label: `🏠 ${t("navigation.home")}` },
                      { to: "/shops", label: `🏪 ${t("navigation.shops")}` },
                      {
                        to: "/products",
                        label: `💎 ${t("navigation.products")}`,
                      },
                      ...(isAdmin || isShopOwner
                        ? [
                            {
                              to: "/dashboard",
                              label: `📊 ${t("navigation.dashboard")}`,
                            },
                          ]
                        : []),
                      ...(isRegularUser
                        ? [
                            {
                              to: "/favorites",
                              label: `❤️ ${t("navigation.favorites")}`,
                            },
                            { to: "/my-reservations", label: "📅 حجوزاتي" },
                          ]
                        : []),
                      ...(isAdmin
                        ? [
                            {
                              to: "/admin",
                              label: `⚙️ ${t("admin_panel")}`,
                              isAdmin: true,
                            },
                          ]
                        : []),
                      {
                        to: "/profile",
                        label: `👤 ${t("navigation.profile")}`,
                      },
                    ].map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        className={`text-amber-800 hover:text-amber-600 font-semibold text-base px-6 py-3 rounded-xl hover:bg-amber-50/50 hover:shadow-md hover:scale-105 transition-all duration-300 ${
                          item.isAdmin
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50/50"
                            : ""
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-center border-2 border-red-200/50 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 font-semibold text-base py-3 rounded-xl transition-all duration-300 hover:shadow-md"
                    >
                     {t("navigation.logout")}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-4 px-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full border-2 border-amber-300/50 text-amber-700 hover:text-white hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-600 font-semibold text-base py-3 rounded-xl transition-all duration-300 hover:shadow-md"
                  >
                     تسجيل الدخول
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/register");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-semibold text-base py-3 rounded-xl transition-all duration-300 hover:shadow-md relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2 justify-center">
                      إنشاء حساب
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;

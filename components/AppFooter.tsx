"use client";

import React from "react";
import Link from "next/link";

export const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 mt-16 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Şirket Bilgisi */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              <span className="text-blue-400">TEKNO</span>STORE
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              En yeni teknoloji ürünlerini güvenle ve uygun fiyatla satın alınız.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-blue-400 transition-colors">
                  Siparişlerim
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-blue-400 transition-colors">
                  Sepetim
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-blue-400 transition-colors">
                  Profilim
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-white font-semibold mb-4">İletişim</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <strong className="text-gray-300">Email:</strong> info@teknostore.com
              </p>
              <p>
                <strong className="text-gray-300">Telefon:</strong> +90 (212) 123 45 67
              </p>
            </div>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} TeknoStore. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

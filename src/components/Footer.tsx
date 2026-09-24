"use client";

import { Link } from '@/i18n/routing';
import { Gamepad2, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GAME_URL } from '@/lib/links';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-[#050C14]/85 backdrop-blur-sm mt-auto w-full relative z-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-headline font-bold text-lg mb-4 text-white">
              {t('title')}
            </h3>
            <p className="text-sm text-white/60">
              {t('description')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/surf-lessons" className="text-white/60 hover:text-white transition-colors">
                  {t('surfLessons')}
                </Link>
              </li>
              <li>
                <a
                  href={GAME_URL}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 text-[#FFB07A] hover:text-white transition-colors"
                >
                  <Gamepad2 className="h-4 w-4" aria-hidden />
                  {tNav('game')} · Ripping
                </a>
              </li>
              <li>
                <Link href="/contacto" className="text-white/60 hover:text-white transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">{t('contactSection')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:josephquesada92@gmail.com"
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  josephquesada92@gmail.com
                </a>
              </li>
              <li className="text-white/60">
                {t('location')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60 text-center md:text-left">
            {t('copyright', { year })}
          </p>
          <p className="text-sm text-white/60 text-center md:text-right">
            {t('poweredBy')}{' '}
            <a
              href="https://www.wedoitwithai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#06B6D4] hover:text-[#22D3EE] transition-colors font-semibold"
            >
              We Do It With AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

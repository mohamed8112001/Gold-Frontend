import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Home, ArrowRight } from 'lucide-react';
import { ROUTES } from '../utils/constants.js';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-yellow-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('pages.not_found.title')}
          </h2>
          <p className="text-gray-600">
            {t('pages.not_found.message')}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            <Link to={ROUTES.HOME} className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <Home className="w-4 h-4" />
              <span>{t('pages.not_found.back_home')}</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-50"
          >
            <Link to={ROUTES.SHOPS} className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <span>{t('navigation.shops')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


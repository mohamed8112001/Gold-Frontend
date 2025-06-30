import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Phone } from 'lucide-react';

const StoreCard = ({ store }) => {
  const {
    id,
    name,
    description,
    location,
    rating,
    reviewsCount,
    image,
    openingHours,
    specialties
  } = store;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 rtl:space-x-reverse">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{rating}</span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* اسم المحل */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {description}
            </p>
          </div>

          {/* الموقع */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{location}</span>
          </div>

          {/* ساعات العمل */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{openingHours}</span>
          </div>

          {/* التقييم والمراجعات */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({reviewsCount})</span>
            </div>
          </div>

          {/* التخصصات */}
          <div className="flex flex-wrap gap-2">
            {specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{specialties.length - 3}
              </span>
            )}
          </div>

          {/* زر عرض المحل */}
          <div className="pt-2">
            <Link to={`/store/${id}`} className="w-full">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                عرض المحل
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreCard;


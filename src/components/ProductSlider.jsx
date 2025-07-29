import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';

const ProductSlider = ({ products }) => {
    return (
        <div className="w-full py-8 px-4">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                    1024: {
                        slidesPerView: 4,
                    },
                }}
                className="product-slider"
            >
                {products.map((product, index) => (
                    <SwiperSlide key={index}>
                        <Card className="h-full">
                            <div className="relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <Badge className="absolute top-2 right-2 bg-primary">
                                    {product.category}
                                </Badge>
                                <button className="absolute top-2 left-2 p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors">
                                    <Heart className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-lg mb-2 text-right">{product.name}</h3>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-primary font-bold">{product.price} جنيه</span>
                                    <Badge variant="outline">{product.weight} جرام</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        أضف للسلة
                                    </Button>
                                    <Button size="sm" variant="default">
                                        عرض التفاصيل
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ProductSlider;

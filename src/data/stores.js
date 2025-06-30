// بيانات وهمية للمحلات
export const mockStores = [
  {
    id: 1,
    name: "Royal Gold Cairo",
    description: "محل مجوهرات فاخر متخصص في الذهب الخالص والمجوهرات الملكية",
    location: "القاهرة، مصر",
    rating: 4.8,
    reviewsCount: 156,
    image: "/store1.jpg",
    ownerId: 3,
    phone: "02-12345678",
    address: "شارع الملك فيصل، الجيزة",
    openingHours: "9:00 ص - 10:00 م",
    specialties: ["خواتم ذهبية", "قلائد", "أساور"],
    established: "2010"
  },
  {
    id: 2,
    name: "Alexandria Jewels",
    description: "مجوهرات عصرية وتقليدية بأجود أنواع الذهب والأحجار الكريمة",
    location: "الإسكندرية، مصر",
    rating: 4.5,
    reviewsCount: 89,
    image: "/store2.jpg",
    ownerId: 4,
    phone: "03-12345678",
    address: "كورنيش الإسكندرية، سموحة",
    openingHours: "10:00 ص - 9:00 م",
    specialties: ["مجوهرات عصرية", "خواتم خطوبة", "ساعات ذهبية"],
    established: "2015"
  },
  {
    id: 3,
    name: "Pharaoh's Treasures",
    description: "كنوز فرعونية أصيلة ومجوهرات مستوحاة من التراث المصري القديم",
    location: "الأقصر، مصر",
    rating: 4.9,
    reviewsCount: 234,
    image: "/store3.jpg",
    ownerId: 5,
    phone: "095-12345678",
    address: "شارع المعابد، الأقصر",
    openingHours: "8:00 ص - 11:00 م",
    specialties: ["مجوهرات فرعونية", "تماثيل ذهبية", "قلائد أثرية"],
    established: "2008"
  },
  {
    id: 4,
    name: "Golden Nile",
    description: "مجوهرات راقية على ضفاف النيل بتصاميم حديثة وكلاسيكية",
    location: "أسوان، مصر",
    rating: 4.7,
    reviewsCount: 67,
    image: "/store4.jpg",
    ownerId: 3,
    phone: "097-12345678",
    address: "كورنيش النيل، أسوان",
    openingHours: "9:30 ص - 9:30 م",
    specialties: ["خواتم نوبية", "قلائد النيل", "أساور تقليدية"],
    established: "2012"
  },
  {
    id: 5,
    name: "Cleopatra Designs",
    description: "تصاميم مجوهرات مبتكرة مستوحاة من جمال كليوباترا وأناقتها",
    location: "الزمالك، القاهرة",
    rating: 4.6,
    reviewsCount: 123,
    image: "/store5.jpg",
    ownerId: 4,
    phone: "02-87654321",
    address: "شارع 26 يوليو، الزمالك",
    openingHours: "11:00 ص - 8:00 م",
    specialties: ["تصاميم حصرية", "مجوهرات مخصصة", "أحجار كريمة"],
    established: "2018"
  },
  {
    id: 6,
    name: "Pyramid Gold",
    description: "مجوهرات ذهبية فاخرة بجودة عالمية وأسعار منافسة",
    location: "المنصورة، مصر",
    rating: 4.4,
    reviewsCount: 45,
    image: "/store6.jpg",
    ownerId: 5,
    phone: "050-12345678",
    address: "شارع الجمهورية، المنصورة",
    openingHours: "10:00 ص - 10:00 م",
    specialties: ["ذهب عيار 21", "مجوهرات أطفال", "هدايا مناسبات"],
    established: "2020"
  },
  {
    id: 7,
    name: "Nubian Crafts",
    description: "حرف يدوية نوبية أصيلة ومجوهرات تراثية بلمسة عصرية",
    location: "أسوان، مصر",
    rating: 4.7,
    reviewsCount: 78,
    image: "/store1.jpg",
    ownerId: 3,
    phone: "097-87654321",
    address: "القرية النوبية، أسوان",
    openingHours: "8:00 ص - 6:00 م",
    specialties: ["حرف نوبية", "فضة مشغولة", "إكسسوارات تراثية"],
    established: "2005"
  },
  {
    id: 8,
    name: "El Khan Jewelry",
    description: "مجوهرات خان الخليلي الأصيلة بتصاميم إسلامية وعربية راقية",
    location: "خان الخليلي، القاهرة",
    rating: 4.8,
    reviewsCount: 189,
    image: "/store2.jpg",
    ownerId: 4,
    phone: "02-25912345",
    address: "خان الخليلي، القاهرة الفاطمية",
    openingHours: "9:00 ص - 12:00 ص",
    specialties: ["مجوهرات إسلامية", "خط عربي", "تحف ذهبية"],
    established: "1995"
  },
  {
    id: 9,
    name: "Red Sea Gold",
    description: "مجوهرات بحرية مستوحاة من جمال البحر الأحمر وكنوزه",
    location: "الغردقة، مصر",
    rating: 4.5,
    reviewsCount: 92,
    image: "/store3.jpg",
    ownerId: 5,
    phone: "065-12345678",
    address: "مارينا الغردقة، البحر الأحمر",
    openingHours: "10:00 ص - 11:00 م",
    specialties: ["مجوهرات بحرية", "لؤلؤ طبيعي", "مرجان أحمر"],
    established: "2016"
  }
];

// دالة للحصول على محل بالمعرف
export const getStoreById = (id) => {
  return mockStores.find(store => store.id === id);
};

// دالة للحصول على محلات صاحب المحل
export const getStoresByOwnerId = (ownerId) => {
  return mockStores.filter(store => store.ownerId === ownerId);
};

// دالة للبحث في المحلات
export const searchStores = (query) => {
  if (!query) return mockStores;
  
  return mockStores.filter(store => 
    store.name.toLowerCase().includes(query.toLowerCase()) ||
    store.description.toLowerCase().includes(query.toLowerCase()) ||
    store.location.toLowerCase().includes(query.toLowerCase())
  );
};


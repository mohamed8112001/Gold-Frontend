// بيانات وهمية للمستخدمين
export const mockUsers = [
  {
    id: 1,
    firstName: "أحمد",
    lastName: "محمد",
    email: "ahmed@gmail.com",
    phone: "01234567890",
    password: "password123",
    userType: "user", 
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    firstName: "فاطمة",
    lastName: "علي",
    email: "fatma@example.com",
    phone: "01234567891",
    password: "password123",
    userType: "user",
    createdAt: "2024-01-20"
  },
  {
    id: 3,
    firstName: "محمد",
    lastName: "خالد",
    email: "mohamed@gmail.com",
    phone: "01234567892",
    password: "password123",
    userType: "store-owner",
    storeId: 1,
    createdAt: "2024-01-10"
  },
  {
    id: 4,
    firstName: "سارة",
    lastName: "أحمد",
    email: "sara@gmail.com",
    phone: "01234567893",
    password: "password123",
    userType: "store-owner",
    storeId: 2,
    createdAt: "2024-01-12"
  },
  {
    id: 5,
    firstName: "عمر",
    lastName: "حسن",
    email: "omar@example.com",
    phone: "01234567894",
    password: "password123",
    userType: "store-owner",
    storeId: 3,
    createdAt: "2024-01-08"
  }
];

// دالة للبحث عن مستخدم بالإيميل وكلمة المرور
export const authenticateUser = (email, password) => {
  return mockUsers.find(user => user.email === email && user.password === password);
};

// دالة للبحث عن مستخدم بالمعرف
export const getUserById = (id) => {
  return mockUsers.find(user => user.id === id);
};


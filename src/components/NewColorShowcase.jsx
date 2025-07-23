import React from 'react';
import { Button } from '@/components/ui/button';

const NewColorShowcase = () => {

  return (
    <div className="min-h-screen bg-white p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: '#2A2209' }}>
          نظام الألوان الجديد - New Design System
        </h1>

        {/* Color Swatches */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#FAF7EA' }}>
            <div className="font-semibold" style={{ color: '#2A2209' }}>Primary 1</div>
            <div className="text-sm">#FAF7EA</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#F6EED5' }}>
            <div className="font-semibold" style={{ color: '#2A2209' }}>Primary 2</div>
            <div className="text-sm">#F6EED5</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#F2F2F2' }}>
            <div className="font-semibold" style={{ color: '#2A2209' }}>Secondary 1</div>
            <div className="text-sm">#F2F2F2</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#E6E6E6' }}>
            <div className="font-semibold" style={{ color: '#2A2209' }}>Secondary 2</div>
            <div className="text-sm">#E6E6E6</div>
          </div>
        </div>

        {/* Button Tests */}
        <div className="bg-white p-6 rounded-lg border mb-8" style={{ borderColor: '#E6E6E6' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2A2209' }}>
            أنواع الأزرار - Button Variants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="primary" className="w-full">
              زر أساسي
            </Button>
            <Button variant="success" className="w-full">
              زر نجاح
            </Button>
            <Button variant="error" className="w-full">
              زر خطأ
            </Button>
            <Button variant="secondary" className="w-full">
              زر ثانوي
            </Button>
          </div>
        </div>

        {/* Background Examples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-lg border" style={{ backgroundColor: '#FAF7EA', borderColor: '#E6E6E6' }}>
            <h3 className="font-semibold mb-2" style={{ color: '#2A2209' }}>Primary 1 Background</h3>
            <p style={{ color: '#4D4D4D' }}>خلفية أساسية فاتحة</p>
          </div>
          <div className="p-6 rounded-lg border" style={{ backgroundColor: '#F6EED5', borderColor: '#E6E6E6' }}>
            <h3 className="font-semibold mb-2" style={{ color: '#2A2209' }}>Primary 2 Background</h3>
            <p style={{ color: '#4D4D4D' }}>خلفية أساسية متوسطة</p>
          </div>
          <div className="p-6 rounded-lg border" style={{ backgroundColor: '#F2F2F2', borderColor: '#E6E6E6' }}>
            <h3 className="font-semibold mb-2" style={{ color: '#2A2209' }}>Secondary 1 Background</h3>
            <p style={{ color: '#4D4D4D' }}>خلفية ثانوية</p>
          </div>
        </div>

        {/* Text Examples */}
        <div className="bg-white p-6 rounded-lg border" style={{ borderColor: '#E6E6E6' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2A2209' }}>
            أمثلة النصوص - Text Examples
          </h2>
          <div className="space-y-2">
            <h3 className="text-xl font-bold" style={{ color: '#2A2209' }}>
              نص أساسي - Primary Text (#2A2209)
            </h3>
            <p className="text-lg" style={{ color: '#4D4D4D' }}>
              نص ثانوي - Secondary Text (#4D4D4D)
            </p>
            <p style={{ color: '#737373' }}>
              نص مكتوم - Muted Text (#737373)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewColorShowcase;

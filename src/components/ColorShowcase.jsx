import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ColorShowcase = () => {
  const primaryColors = [
    { name: 'primary-50', value: '#FDF8F0', description: 'Lightest golden tint' },
    { name: 'primary-100', value: '#FAF0E1', description: 'Very light golden' },
    { name: 'primary-200', value: '#F4E0C3', description: 'Light golden' },
    { name: 'primary-300', value: '#EDCFA4', description: 'Medium light golden' },
    { name: 'primary-400', value: '#E6BE86', description: 'Medium golden' },
    { name: 'primary-500', value: '#D4A574', description: 'Your existing primary' },
    { name: 'primary-600', value: '#A37F41', description: 'Base golden brown' },
    { name: 'primary-700', value: '#8B6B35', description: 'Dark golden brown' },
    { name: 'primary-800', value: '#6D552C', description: 'Darker brown' },
    { name: 'primary-900', value: '#49391D', description: 'Very dark brown' },
    { name: 'primary-950', value: '#241C0F', description: 'Darkest brown' },
  ];

  const secondaryColors = [
    { name: 'secondary-50', value: '#F8F4ED', description: 'Main backgrounds' },
    { name: 'secondary-100', value: '#F0E8DB', description: 'Card backgrounds' },
    { name: 'secondary-200', value: '#E2D2B6', description: 'Section backgrounds' },
    { name: 'secondary-300', value: '#D3BB92', description: 'Medium beige' },
    { name: 'secondary-400', value: '#C5A56D', description: 'Medium dark beige' },
    { name: 'secondary-500', value: '#B8956A', description: 'Balanced beige' },
    { name: 'secondary-600', value: '#92723A', description: 'Dark beige' },
    { name: 'secondary-700', value: '#6D552C', description: 'Brown beige' },
    { name: 'secondary-800', value: '#49391D', description: 'Dark brown' },
    { name: 'secondary-900', value: '#241C0F', description: 'Very dark brown' },
    { name: 'secondary-950', value: '#120E07', description: 'Darkest brown' },
  ];

  const ColorSwatch = ({ color }) => (
    <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg bg-white  border border-secondary-200">
      <div 
        className="w-12 h-12 rounded-lg  border border-secondary-300"
        style={{ backgroundColor: color.value }}
      />
      <div className="flex-1">
        <div className="font-medium text-primary-900">{color.name}</div>
        <div className="text-sm text-primary-700">{color.value}</div>
        <div className="text-xs text-primary-600">{color.description}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-950 mb-4">
            🎨 Golden Brown Color Theme
          </h1>
          <p className="text-lg text-primary-800 max-w-3xl mx-auto">
            A harmonious blend of golden brown and beige tones creating a calm, elegant, 
            and premium feel perfect for a professional jewelry marketplace.
          </p>
        </div>

        {/* Component Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Buttons Showcase */}
          <Card className="bg-secondary-100 border-secondary-200">
            <CardHeader>
              <CardTitle className="text-primary-950">Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button className="w-full bg-primary-600 hover:bg-primary-700 text-secondary-50">
                  Primary Button
                </Button>
                <Button variant="secondary" className="w-full bg-secondary-200 hover:bg-secondary-300 text-primary-900">
                  Secondary Button
                </Button>
                <Button variant="outline" className="w-full border-primary-600 text-primary-600 hover:bg-primary-50">
                  Outline Button
                </Button>
                <Button variant="ghost" className="w-full text-primary-700 hover:bg-secondary-200">
                  Ghost Button
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cards Showcase */}
          <Card className="bg-secondary-100 border-secondary-200">
            <CardHeader>
              <CardTitle className="text-primary-950">Card Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                <h4 className="font-semibold text-primary-900 mb-2">Light Card</h4>
                <p className="text-primary-700 text-sm">Perfect for main content areas</p>
              </div>
              <div className="p-4 bg-secondary-100 rounded-lg border border-secondary-300">
                <h4 className="font-semibold text-primary-900 mb-2">Medium Card</h4>
                <p className="text-primary-700 text-sm">Great for secondary content</p>
              </div>
              <div className="p-4 bg-secondary-200 rounded-lg border border-secondary-400">
                <h4 className="font-semibold text-primary-900 mb-2">Darker Card</h4>
                <p className="text-primary-700 text-sm">Ideal for emphasis</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges and Tags */}
        <Card className="bg-secondary-100 border-secondary-200 mb-12">
          <CardHeader>
            <CardTitle className="text-primary-950">Badges & Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-primary-600 text-secondary-50">Primary Badge</Badge>
              <Badge variant="secondary" className="bg-secondary-300 text-primary-900">Secondary Badge</Badge>
              <Badge variant="outline" className="border-primary-600 text-primary-600">Outline Badge</Badge>
              <Badge className="bg-primary-500 text-secondary-50">Golden Badge</Badge>
              <Badge className="bg-primary-700 text-secondary-50">Dark Golden</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Color Palettes */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Primary Colors */}
          <Card className="bg-secondary-100 border-secondary-200">
            <CardHeader>
              <CardTitle className="text-primary-950">Primary Golden Brown Palette</CardTitle>
              <p className="text-primary-700 text-sm">Based on #A37F41 - Use for branding and primary actions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {primaryColors.map((color) => (
                  <ColorSwatch key={color.name} color={color} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Secondary Colors */}
          <Card className="bg-secondary-100 border-secondary-200">
            <CardHeader>
              <CardTitle className="text-primary-950">Secondary Beige & Earthy Tones</CardTitle>
              <p className="text-primary-700 text-sm">Use for backgrounds, cards, and section separations</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {secondaryColors.map((color) => (
                  <ColorSwatch key={color.name} color={color} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Guidelines */}
        <Card className="bg-secondary-100 border-secondary-200 mt-8">
          <CardHeader>
            <CardTitle className="text-primary-950">Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold text-primary-900 mb-2">Backgrounds</h4>
                <ul className="text-sm text-primary-700 space-y-1">
                  <li>• Main: secondary-50</li>
                  <li>• Cards: secondary-100</li>
                  <li>• Sections: secondary-200</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary-900 mb-2">Text</h4>
                <ul className="text-sm text-primary-700 space-y-1">
                  <li>• Primary: primary-950</li>
                  <li>• Secondary: primary-900</li>
                  <li>• Muted: primary-800</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary-900 mb-2">Buttons</h4>
                <ul className="text-sm text-primary-700 space-y-1">
                  <li>• Primary: primary-600</li>
                  <li>• Secondary: secondary-200</li>
                  <li>• Hover: +100 shade</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary-900 mb-2">Borders</h4>
                <ul className="text-sm text-primary-700 space-y-1">
                  <li>• Light: secondary-200</li>
                  <li>• Medium: secondary-300</li>
                  <li>• Dark: secondary-400</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ColorShowcase;

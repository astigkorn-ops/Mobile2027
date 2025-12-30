import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Briefcase, Check, Trash2, RotateCcw } from 'lucide-react';

const defaultChecklist = [
  { id: 1, category: 'Documents', item: 'Valid IDs (Photocopy)', checked: false },
  { id: 2, category: 'Documents', item: 'Insurance documents', checked: false },
  { id: 3, category: 'Documents', item: 'Emergency contact list', checked: false },
  { id: 4, category: 'Documents', item: 'Medical records/prescriptions', checked: false },
  { id: 5, category: 'Water & Food', item: 'Drinking water (3 liters/person)', checked: false },
  { id: 6, category: 'Water & Food', item: 'Canned goods (3-day supply)', checked: false },
  { id: 7, category: 'Water & Food', item: 'Ready-to-eat food', checked: false },
  { id: 8, category: 'Water & Food', item: 'Can opener', checked: false },
  { id: 9, category: 'First Aid', item: 'First aid kit', checked: false },
  { id: 10, category: 'First Aid', item: 'Prescription medications', checked: false },
  { id: 11, category: 'First Aid', item: 'Pain relievers', checked: false },
  { id: 12, category: 'First Aid', item: 'Bandages and antiseptic', checked: false },
  { id: 13, category: 'Tools & Safety', item: 'Flashlight with extra batteries', checked: false },
  { id: 14, category: 'Tools & Safety', item: 'Battery-powered radio', checked: false },
  { id: 15, category: 'Tools & Safety', item: 'Whistle (for signaling)', checked: false },
  { id: 16, category: 'Tools & Safety', item: 'Multi-tool or knife', checked: false },
  { id: 17, category: 'Clothing', item: 'Change of clothes', checked: false },
  { id: 18, category: 'Clothing', item: 'Rain gear/poncho', checked: false },
  { id: 19, category: 'Clothing', item: 'Sturdy shoes', checked: false },
  { id: 20, category: 'Clothing', item: 'Blanket or sleeping bag', checked: false },
  { id: 21, category: 'Communication', item: 'Fully charged power bank', checked: false },
  { id: 22, category: 'Communication', item: 'Phone charger', checked: false },
  { id: 23, category: 'Communication', item: 'Emergency cash (small bills)', checked: false },
  { id: 24, category: 'Hygiene', item: 'Toothbrush and toothpaste', checked: false },
  { id: 25, category: 'Hygiene', item: 'Soap and hand sanitizer', checked: false },
  { id: 26, category: 'Hygiene', item: 'Toilet paper', checked: false },
  { id: 27, category: 'Hygiene', item: 'Face masks', checked: false },
];

const categories = ['Documents', 'Water & Food', 'First Aid', 'Tools & Safety', 'Clothing', 'Communication', 'Hygiene'];

const categoryColors = {
  'Documents': 'bg-blue-500',
  'Water & Food': 'bg-cyan-500',
  'First Aid': 'bg-red-500',
  'Tools & Safety': 'bg-orange-500',
  'Clothing': 'bg-purple-500',
  'Communication': 'bg-green-500',
  'Hygiene': 'bg-pink-500',
};

export default function GoBagChecklist() {
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('gobag-checklist');
    return saved ? JSON.parse(saved) : defaultChecklist;
  });
  const [syncStatus, setSyncStatus] = useState('local');

  useEffect(() => {
    localStorage.setItem('gobag-checklist', JSON.stringify(checklist));
  }, [checklist]);

  const toggleItem = (id) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteItem = (id) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const resetChecklist = () => {
    if (window.confirm('Reset all items to unchecked?')) {
      setChecklist(prev => prev.map(item => ({ ...item, checked: false })));
    }
  };

  const resetToDefault = () => {
    if (window.confirm('Reset to default checklist? This will remove any custom items.')) {
      setChecklist(defaultChecklist);
    }
  };

  const checkedCount = checklist.filter(i => i.checked).length;
  const progress = Math.round((checkedCount / checklist.length) * 100);

  const groupedItems = categories.map(cat => ({
    category: cat,
    items: checklist.filter(item => item.category === cat)
  })).filter(group => group.items.length > 0);

  return (
    <div 
      className="min-h-screen bg-white relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(234, 88, 12, 0.05) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(234, 88, 12, 0.05) 0%, transparent 20%),
          linear-gradient(45deg, transparent 49%, rgba(234, 88, 12, 0.03) 50%, transparent 51%),
          linear-gradient(-45deg, transparent 49%, rgba(234, 88, 12, 0.03) 50%, transparent 51%)
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-950 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

<div className="fixed mx-auto max-w-md w-full top-0 left-0 right-0 z-50">

    <Header title="GO BAG CHECKLIST" showBack icon={Briefcase} />

</div>

      <main className="px-4 py-6 pt-16 max-w-2xl mx-auto space-y-6 relative z-10">
        
        
        {/* Progress Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200" data-testid="progress-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-950 font-bold text-lg">Preparation Progress</h3>
            <div className="flex items-center gap-2">
              <span className="text-blue-950 font-bold text-xl">{progress}%</span>
            </div>
          </div>
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-yellow-500 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            />
          </div>
          <p className="text-slate-600 text-sm">
            {checkedCount} of {checklist.length} items ready
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetChecklist}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-950 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition-all duration-300 transform hover:scale-105"
            data-testid="reset-checks-btn"
            title="Uncheck all items"
          >
            <RotateCcw className="w-5 h-5" />
            Reset All
          </button>
        </div>

        {/* Checklist by Category */}
        <div className="space-y-4" data-testid="checklist-categories">
          {groupedItems.map(({ category, items }) => (
            <div 
              key={category} 
              className="bg-white rounded-xl overflow-hidden shadow-md border border-slate-200 transform transition-all duration-300 hover:shadow-lg"
            >
              <div className={`p-4 ${categoryColors[category]} flex items-center justify-between`}>
                <h3 className="text-white font-bold text-base">{category}</h3>
                <span className="text-white/80 text-sm">
                  {items.filter(i => i.checked).length}/{items.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="checklist-item flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-200"
                    data-testid={`checklist-item-${item.id}`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="flex items-center gap-3 flex-1"
                      data-testid={`toggle-item-${item.id}`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                        item.checked 
                          ? 'bg-green-500 border-green-500 transform scale-110' 
                          : 'border-slate-300'
                      }`}>
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-sm transition-all duration-300 ${
                        item.checked 
                          ? 'text-slate-500 line-through' 
                          : 'text-slate-700'
                      }`}>
                        {item.item}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetToDefault}
          className="w-full text-blue-950 text-sm py-3 bg-yellow-500 hover:bg-yellow-400 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold"
          data-testid="reset-default-btn"
        >
          Reset to Default Checklist
        </button>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
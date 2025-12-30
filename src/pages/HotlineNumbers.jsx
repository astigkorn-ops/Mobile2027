import { Header } from '../components/Header';
import { Phone, ChevronRight } from 'lucide-react';

const getCategoryColor = (category) => {
  const colors = {
    emergency: 'bg-red-500',
    local: 'bg-blue-500',
    police: 'bg-blue-700',
    fire: 'bg-orange-500',
    medical: 'bg-green-500',
    weather: 'bg-cyan-500',
    social: 'bg-purple-500',
  };
  return colors[category] || 'bg-slate-500';
};

// Static hotlines (unlinked from database) - Merged by agency
const STATIC_HOTLINES = [
  { 
    label: 'MDRMMO - Municipal Disaster Risk Reduction Management Office', 
    numbers: ['0917-772-5016', '0966-395-6804'], 
    category: 'emergency' 
  },
  { 
    label: 'PSO - Public Safety Officer', 
    numbers: ['0946-743-2735'], 
    category: 'police' 
  },
  { 
    label: "Mayor's Office", 
    numbers: ['0961-690-2026', '0995-072-9306'], 
    category: 'local' 
  },
  { 
    label: 'MSWDO - Municipal Social Welfare and Development Office', 
    numbers: ['0910-122-8971', '0919-950-9515'], 
    category: 'social' 
  },
  { 
    label: 'BFP - Bureau of Fire Protection - Pio Duran Fire Station', 
    numbers: ['0949-889-7134', '0931-929-3408'], 
    category: 'fire' 
  },
  { 
    label: 'PNP - Philippine National Police - Pio Duran MPS', 
    numbers: ['0998-598-5946'], 
    category: 'police' 
  },
  { 
    label: 'Maritime Police', 
    numbers: ['0917-500-2325'], 
    category: 'police' 
  },
  { 
    label: 'BJMP - Bureau of Jail Management and Penology', 
    numbers: ['0936-572-9067'], 
    category: 'police' 
  },
  { 
    label: 'PCG - Philippine Coast Guard - Pio Duran Sub Station', 
    numbers: ['0970-667-5457'], 
    category: 'police' 
  },
  { 
    label: 'RHU - Rural Health Unit Pio Duran', 
    numbers: ['0927-943-4663', '0907-640-7701'], 
    category: 'medical' 
  },
  { 
    label: 'PDMDH - Pio Duran Memorial District Hospital', 
    numbers: ['0985-317-1769'], 
    category: 'medical' 
  },
];

export default function HotlineNumbers() {
  const hotlines = STATIC_HOTLINES;

  const handleCall = (number) => {
    const cleanNumber = String(number || '').replace(/[^\d+]/g, '');
    window.open(`tel:${cleanNumber}`, '_self');
  };

  return (
    <div className="relative min-h-screen bg-white mb-16">
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-950/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-500/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-950/5 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10">
        <Header title="HOTLINE NUMBERS" showBack icon={Phone} />

        <main className="px-4 py-6 max-w-2xl mx-auto">
          <div className="flex items-start justify-between gap-3">
            <p className="text-blue-950/70 text-sm" data-testid="hotlines-subtitle">
              Tap a number to dial immediately
            </p>
          </div>

          <div className="mt-4 space-y-3" data-testid="hotlines-list">
            {hotlines.map((hotline) => (
              <div
                key={`${hotline.label}`}
                className="w-full bg-white border-2 border-blue-950/20 rounded-xl p-4 hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg group"
                data-testid={`hotline-${hotline.label.replace(/\s/g, '-')}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${getCategoryColor(hotline.category)} flex items-center justify-center mt-1`}>
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-blue-950 font-semibold text-sm mb-2" data-testid={`hotline-label-${hotline.label.replace(/\s/g, '-')}`}>
                      {hotline.label}
                    </h3>
                    <div className="space-y-2">
                      {hotline.numbers.map((number, index) => (
                        <button
                          key={`${hotline.label}-${number}`}
                          onClick={() => handleCall(number)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-100 transition-colors"
                          data-testid={`hotline-number-${number.replace(/\s/g, '-')}`}
                          type="button"
                        >
                          <span className="text-blue-950/80 text-xs font-medium">{number}</span>
                          <ChevronRight className="w-4 h-4 text-blue-950/40 group-hover:text-yellow-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
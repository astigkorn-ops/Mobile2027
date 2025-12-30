import { Header } from '../components/Header';
import { BookOpen, ExternalLink, Phone, Globe, MapPin, Info, FileText, Users } from 'lucide-react';

const resources = [
  {
    category: 'Government Agencies',
    items: [
      {
        name: 'NDRRMC',
        description: 'National Disaster Risk Reduction and Management Council',
        link: 'https://ndrrmc.gov.ph',
        icon: Globe,
      },
      {
        name: 'PAGASA',
        description: 'Philippine weather forecasts and warnings',
        link: 'https://bagong.pagasa.dost.gov.ph',
        icon: Globe,
      },
      {
        name: 'PHIVOLCS',
        description: 'Volcanic and seismic monitoring',
        link: 'https://phivolcs.dost.gov.ph',
        icon: Globe,
      },
      {
        name: 'OCD Region V',
        description: 'Office of Civil Defense Bicol Region',
        link: 'https://ocd.gov.ph',
        icon: Globe,
      },
    ],
  },
  {
    category: 'Emergency Assistance',
    items: [
      {
        name: 'Philippine Red Cross',
        description: 'Disaster relief and blood services',
        phone: '143',
        icon: Phone,
      },
      {
        name: 'DSWD Hotline',
        description: 'Social welfare assistance',
        phone: '8931-8101',
        icon: Phone,
      },
      {
        name: 'DOH Health Emergency',
        description: '24/7 health assistance',
        phone: '1555',
        icon: Phone,
      },
    ],
  },
  {
    category: 'Local Resources',
    items: [
      {
        name: 'MDRRMO Pio Duran',
        description: 'Municipal Disaster Risk Reduction',
        address: 'Municipal Hall, Poblacion',
        icon: MapPin,
      },
      {
        name: 'Pio Duran Municipal Hall',
        description: 'Local government services',
        address: 'Poblacion, Pio Duran, Albay',
        icon: MapPin,
      },
    ],
  },
  {
    category: 'Information & Guides',
    items: [
      {
        name: 'Disaster Preparedness Guide',
        description: 'How to prepare for typhoons and disasters',
        type: 'guide',
        icon: FileText,
      },
      {
        name: 'Family Emergency Planning',
        description: 'Create your family emergency plan',
        type: 'guide',
        icon: Users,
      },
      {
        name: 'First Aid Basics',
        description: 'Essential first aid knowledge',
        type: 'guide',
        icon: Info,
      },
    ],
  },
];

export default function SupportResources() {
  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePhoneClick = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
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

      <div className="relative z-10 pb-20">
        <Header title="SUPPORT RESOURCES" showBack icon={BookOpen} />
        
        <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
          {/* Intro */}
          <div className="bg-blue-950 rounded-xl p-4 relative overflow-hidden" data-testid="intro-card">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
            
            <h2 className="text-yellow-500 font-bold text-lg mb-2 relative z-10">Help & Information</h2>
            <p className="text-white/80 text-sm relative z-10">
              Access important resources, emergency contacts, and guides to help you prepare for and respond to disasters.
            </p>
          </div>

          {/* Resources by Category */}
          {resources.map((section) => (
            <div key={section.category} className="bg-white rounded-xl overflow-hidden relative" data-testid={`section-${section.category.toLowerCase().replace(/\s/g, '-')}`}>
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
              
              <div className="p-4 bg-blue-950/10 border-b border-blue-950/20 relative z-10">
                <h3 className="text-blue-950 font-bold">{section.category}</h3>
              </div>
              <div className="divide-y divide-blue-950/10 relative z-10">
                {section.items.map((item) => (
                  <ResourceItem key={item.name} item={item} onLinkClick={handleLinkClick} onPhoneClick={handlePhoneClick} />
                ))}
              </div>
            </div>
          ))}

          {/* Emergency Tips */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 relative overflow-hidden" data-testid="emergency-tips">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
            
            <h3 className="text-yellow-700 font-bold mb-3 relative z-10">Quick Emergency Tips</h3>
            <ul className="space-y-2 relative z-10">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span className="text-slate-700 text-sm">Always keep your Go Bag ready and accessible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span className="text-slate-700 text-sm">Know your evacuation routes and meeting points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span className="text-slate-700 text-sm">Keep emergency numbers saved on your phone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span className="text-slate-700 text-sm">Stay updated with official weather advisories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span className="text-slate-700 text-sm">Have a family emergency communication plan</span>
              </li>
            </ul>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}

function ResourceItem({ item, onLinkClick, onPhoneClick }) {
  const Icon = item.icon;

  const handleClick = () => {
    if (item.link) {
      onLinkClick(item.link);
    } else if (item.phone) {
      onPhoneClick(item.phone);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
        item.link || item.phone ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'
      } relative overflow-hidden`}
      data-testid={`resource-${item.name.toLowerCase().replace(/\s/g, '-')}`}
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='10' cy='10' r='0.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
      
      <div className="w-10 h-10 rounded-full bg-blue-950/10 flex items-center justify-center flex-shrink-0 relative z-10">
        <Icon className="w-5 h-5 text-blue-950" />
      </div>
      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-2">
          <h4 className="text-blue-950 font-semibold text-sm">{item.name}</h4>
          {item.link && <ExternalLink className="w-3 h-3 text-slate-400" />}
        </div>
        <p className="text-slate-500 text-xs mt-0.5">{item.description}</p>
        {item.phone && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            {item.phone}
          </span>
        )}
        {item.address && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {item.address}
          </span>
        )}
      </div>
    </button>
  );
}
import { useState } from 'react';
import { Header } from '../components/Header';
import { BookOpen, ChevronDown, ChevronUp, Waves, Mountain, CloudLightning, Wind, Flame, Sun } from 'lucide-react';

const disasters = [
  {
    id: 'storm-surge',
    title: 'Storm Surge & Tsunami',
    icon: Waves,
    gradient: 'from-blue-500 to-cyan-500',
    before: [
      "Know your zone: Is your home, work, or school in a designated evacuation zone?",
      'Plan multiple evacuation routes inland and to higher ground.',
      "Learn the natural warning signs: for a tsunami, a strong, long earthquake, a sudden rise or fall in the ocean, a loud 'roaring' sound.",
      'Heed official warnings immediately. Do not wait.',
      'Prepare your Go-Bag and have it ready.',
    ],
    during: [
      'IMMEDIATELY move inland and to high ground. Do not stay to watch.',
      'Go as far inland and as high up as possible. Even a few stories in a sturdy concrete building can make a difference.',
      'If you are in a boat and time allows, move out to deep water (tsunami waves are less destructive in deep ocean).',
      'Do not return to the evacuation zone until authorities declare it safe.',
    ],
    after: [
      'Stay away from the coast. Dangerous waves can continue for hours.',
      'Stay away from damaged buildings, bridges, and infrastructure.',
      'Be cautious of floodwaters, which may be contaminated or hide debris.',
      'Listen to official sources for information about safe return and water safety.',
    ],
  },
  {
    id: 'landslide',
    title: 'Landslide',
    icon: Mountain,
    gradient: 'from-amber-500 to-orange-500',
    before: [
      'Learn if your area is prone to landslides.',
      'Watch for signs like new cracks in foundations, soil moving away from foundations, tilting trees or fences.',
      'Consult a professional for land-use guidance (e.g., building retaining walls).',
      'Plan an evacuation route to a safer area, not in the path of potential flow.',
    ],
    during: [
      'If you are in a building, get to the highest level.',
      'If you are outside and near the path of a landslide, run to the nearest high ground or shelter. Do not try to outrun it.',
      'If escape is not possible, curl into a tight ball and protect your head.',
    ],
    after: [
      'Stay away from the slide area. There may be a risk of additional slides.',
      'Check for injured or trapped people near the slide, but do not enter the direct area. Call for professional help.',
      'Be aware of potential flooding, as landslides can block waterways.',
      'Report broken utility lines to the authorities.',
    ],
  },
  {
    id: 'thunderstorm',
    title: 'Thunderstorm',
    icon: CloudLightning,
    gradient: 'from-gray-500 to-slate-600',
    before: [
      'Secure or bring inside outdoor objects that could be blown away.',
      'Unplug sensitive electronic appliances to protect from power surges.',
      'Listen to weather forecasts for Severe Thunderstorm Warnings.',
    ],
    during: [
      'When Thunder Roars, Go Indoors! There is no safe place outside.',
      'Avoid corded phones, plumbing, and electrical appliances as lightning can travel through wiring and pipes.',
      'Stay away from windows and doors.',
      'If you are in a vehicle, it is a safe alternative. Avoid touching the metal frame.',
      'If you are caught outside with no shelter, avoid isolated trees, hilltops, and open fields. Crouch low in a ravine or valley.',
    ],
    after: [
      'Stay indoors for at least 30 minutes after the last clap of thunder.',
      'Watch for downed power lines and report them immediately.',
      'Check for property damage.',
    ],
  },
  {
    id: 'typhoon',
    title: 'Typhoon / Hurricane',
    icon: Wind,
    gradient: 'from-blue-600 to-indigo-700',
    before: [
      "Know your home's vulnerability to wind and flooding.",
      'Install storm shutters or pre-cut plywood for windows.',
      'Secure or bring indoors all outdoor furniture, decorations, trash cans, etc.',
      'Trim trees and shrubs to make them more wind-resistant.',
      "Fill your vehicle's gas tank and withdraw some cash.",
    ],
    during: [
      'Stay indoors, away from windows and skylights.',
      'Take refuge in a small interior room, closet, or hallway on the lowest level that is not prone to flooding.',
      'Lie on the floor under a sturdy table or other object.',
      "Do not go outside during the 'eye' of the storm; the worst winds will resume shortly from the opposite direction.",
    ],
    after: [
      'Listen to official reports to ensure the storm has passed.',
      'Watch for fallen objects, downed power lines, and damaged structures.',
      'Do not walk or drive through floodwaters.',
      'Use flashlights, not candles, due to the risk of gas leaks.',
      'Check on your neighbors, especially the elderly or those with disabilities.',
    ],
  },
  {
    id: 'flood',
    title: 'Flood',
    icon: Waves,
    gradient: 'from-cyan-500 to-teal-500',
    before: [
      'Know if you are in a floodplain.',
      'Consider purchasing flood insurance.',
      'Elevate critical utilities (furnace, water heater, electrical panel).',
      'Have a plan to move to higher floors if needed.',
    ],
    during: [
      "Turn Around, Don't Drown! Do not walk, swim, or drive through floodwaters. Six inches of moving water can knock you down; one foot can sweep a vehicle away.",
      'Evacuate if told to do so.',
      'If trapped in a building, go to its highest level. Do not enter a closed attic.',
      'If trapped in a vehicle, stay inside. If water is rising inside the vehicle, seek refuge on the roof.',
    ],
    after: [
      'Return home only when authorities say it is safe.',
      'Avoid standing water, which may be electrically charged or contaminated.',
      'Wear heavy gloves and boots during cleanup.',
      'Photograph damage for insurance claims.',
      'Be aware that floodwater can weaken roads and structures.',
    ],
  },
  {
    id: 'earthquake',
    title: 'Earthquake',
    icon: Mountain,
    gradient: 'from-stone-500 to-gray-600',
    before: [
      "'Drop, Cover, and Hold On' is the single most important preparedness action.",
      'Secure heavy furniture, appliances, and water heaters to walls.',
      'Know how to turn off your gas (if you smell a leak) and water.',
      'Store heavy and breakable objects on low shelves.',
    ],
    during: [
      'DROP onto your hands and knees.',
      'COVER your head and neck under a sturdy table or desk. If no shelter is nearby, get down near an interior wall and cover your head and neck with your arms.',
      'HOLD ON to your shelter until the shaking stops.',
      'If in bed, stay there and cover your head with a pillow.',
      'Do not run outside. The danger is from falling debris and glass.',
    ],
    after: [
      'Expect aftershocks. Drop, Cover, and Hold On when they occur.',
      'Check yourself and others for injuries.',
      'If you are in a damaged building, get out and move to an open space.',
      'If you smell gas, evacuate immediately and report it.',
      'Avoid using phones except for life-threatening emergencies.',
    ],
  },
  {
    id: 'fire',
    title: 'Fire (Wildfire / Structure)',
    icon: Flame,
    gradient: 'from-red-500 to-orange-500',
    before: [
      "Create a 'defensible space' by clearing flammable vegetation around your home.",
      'Have an evacuation plan for your family and pets.',
      'Keep gutters clean and remove debris from your roof.',
      'Install and test smoke alarms.',
      'Have fire extinguishers and know how to use them.',
      'Plan and practice a family escape route with two ways out of every room.',
    ],
    during: [
      'Evacuate immediately if told to do so.',
      'If trapped, call 911. Stay in a building or vehicle with windows closed. It is safer than being outside.',
      'If outside, seek shelter in a low-lying area or body of water. Cover yourself with wet clothing or a blanket.',
      'GET OUT, STAY OUT. Do not stop for belongings.',
      "Feel closed doors with the back of your hand before opening. If it's warm, use your second way out.",
      'Stay low to the floor where the air is less toxic.',
      'Call the fire department from outside.',
    ],
    after: [
      'Do not re-enter until firefighters say it is safe.',
      'Be aware of hot embers, smoldering debris, and structural damage.',
      'Wear a mask to avoid breathing ash.',
      'Watch for flare-ups.',
    ],
  },
  {
    id: 'heat',
    title: 'Extreme Heat',
    icon: Sun,
    gradient: 'from-orange-400 to-amber-500',
    before: [
      'Ensure you have a way to stay cool (air conditioning, public cooling centers).',
      'Cover windows with drapes or shades to block direct sun.',
      'Have a plan for those at high risk (infants, elderly, people with chronic illnesses).',
    ],
    during: [
      'Stay indoors in air conditioning as much as possible.',
      "Drink plenty of water, even if you don't feel thirsty. Avoid alcohol and caffeine.",
      'Wear lightweight, light-colored, loose-fitting clothing.',
      'Take cool showers or baths.',
      'Never leave children or pets in a closed vehicle.',
      'Limit strenuous outdoor activity to the coolest parts of the day (early morning/evening).',
    ],
    after: [
      'Continue to hydrate.',
      'Check on neighbors, family, and friends who may be vulnerable.',
      'Be aware of signs of heat illness (dizziness, nausea, headache, confusion) and seek medical help if necessary.',
    ],
  },
];

export default function GoBagChecklist() {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-100" data-testid="disaster-guidelines-page">
      <Header title="DISASTER GUIDELINES" showBack icon={BookOpen} />

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-3">
        {disasters.map((d) => {
          const Icon = d.icon;
          const isOpen = !!expanded[d.id];
          return (
            <div key={d.id} className="bg-white rounded-xl shadow-md overflow-hidden" data-testid={`disaster-${d.id}`}>
              <button
                onClick={() => toggle(d.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                data-testid={`disaster-toggle-${d.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${d.gradient}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-slate-900 font-semibold text-left">{d.title}</h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4 animate-fadeIn" data-testid={`disaster-content-${d.id}`}>
                  {/* Before */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">BEFORE</span>
                    </h4>
                    <ul className="space-y-2">
                      {d.before.map((item, idx) => (
                        <li key={idx} className="text-slate-700 text-sm flex gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* During */}
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="text-red-900 font-bold mb-3 flex items-center gap-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">DURING</span>
                    </h4>
                    <ul className="space-y-2">
                      {d.during.map((item, idx) => (
                        <li key={idx} className="text-slate-700 text-sm flex gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* After */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-green-900 font-bold mb-3 flex items-center gap-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">AFTER</span>
                    </h4>
                    <ul className="space-y-2">
                      {d.after.map((item, idx) => (
                        <li key={idx} className="text-slate-700 text-sm flex gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { FileText, Plus, Save, Trash2, Users, MapPin, Phone, Home, AlertCircle, Briefcase, Check, RotateCcw } from 'lucide-react';

const defaultPlan = {
  familyMembers: [],
  meetingPoints: [
    { id: 1, name: 'Near Home', location: '' },
    { id: 2, name: 'Neighborhood', location: '' },
    { id: 3, name: 'Out of Town', location: '' },
  ],
  emergencyContacts: [
    { id: 1, name: '', phone: '', relationship: '' },
  ],
  evacuation: {
    primaryRoute: '',
    alternateRoute: '',
    nearestEvacCenter: '',
  },
  specialNeeds: '',
  pets: '',
  importantInfo: '',
};

// Go Bag Checklist data
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

export default function EmergencyPlan() {
    const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem('emergency-plan');
    return saved ? JSON.parse(saved) : defaultPlan;
  });
  const [saved, setSaved] = useState(false);
  const [checklist, setChecklist] = useState(() => {
    const savedChecklist = localStorage.getItem('gobag-checklist');
    return savedChecklist ? JSON.parse(savedChecklist) : defaultChecklist;
  });
  const [activeSection, setActiveSection] = useState('checklist');

  
  useEffect(() => {
    localStorage.setItem('emergency-plan', JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    localStorage.setItem('gobag-checklist', JSON.stringify(checklist));
  }, [checklist]);

  const handleSave = () => {
    localStorage.setItem('emergency-plan', JSON.stringify(plan));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addFamilyMember = () => {
    setPlan(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { id: Date.now(), name: '', age: '', medical: '' }]
    }));
  };

  const updateFamilyMember = (id, field, value) => {
    setPlan(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    }));
  };

  const removeFamilyMember = (id) => {
    setPlan(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(m => m.id !== id)
    }));
  };

  const addEmergencyContact = () => {
    setPlan(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { id: Date.now(), name: '', phone: '', relationship: '' }]
    }));
  };

  const updateEmergencyContact = (id, field, value) => {
    setPlan(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  const removeEmergencyContact = (id) => {
    if (plan.emergencyContacts.length <= 1) return;
    setPlan(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id)
    }));
  };

  const updateMeetingPoint = (id, value) => {
    setPlan(prev => ({
      ...prev,
      meetingPoints: prev.meetingPoints.map(p => 
        p.id === id ? { ...p, location: value } : p
      )
    }));
  };

  const toggleItem = (id) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
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

  const sections = [
    { id: 'checklist', label: 'Go Bag Checklist', icon: Briefcase },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'contacts', label: 'Contacts', icon: Phone },
    { id: 'meeting', label: 'Meeting Points', icon: MapPin },
    { id: 'evacuation', label: 'Evacuation', icon: Home },
    { id: 'special', label: 'Special Needs', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-100" data-testid="emergency-plan-page">
      <Header title="EMERGENCY PLAN" showBack icon={FileText} />
      
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Save Success Message */}
        {saved && (
          <div className="p-4 rounded-xl flex items-center gap-3 animate-fadeIn bg-green-500 text-white" data-testid="save-success">
            <Save className="w-5 h-5" />
            <span>Emergency plan saved!</span>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-950 rounded-xl p-4" data-testid="info-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-yellow-500 font-bold text-lg">Family Emergency Plan</h2>
          </div>
          <p className="text-white/80 text-sm">Create your family's emergency plan. Your plan is saved on this device.</p>
        </div>

        {/* Section Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2" data-testid="section-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-yellow-500 text-blue-950'
                  : 'bg-white text-slate-600 border-2 border-slate-200'
              }`}
              data-testid={`tab-${section.id}`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Go Bag Checklist Section */}
        {activeSection === 'checklist' && (
          <div className="space-y-6" data-testid="checklist-section">
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
          </div>
        )}

        
        {/* Family Members Section */}
        {activeSection === 'family' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="family-section">
            <div className="flex items-center justify-between">
              <h3 className="text-blue-950 font-bold">Family Members</h3>
              <button
                onClick={addFamilyMember}
                className="flex items-center gap-1 text-yellow-600 text-sm font-medium"
                data-testid="add-family-btn"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            {plan.familyMembers.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No family members added yet</p>
            ) : (
              <div className="space-y-3">
                {plan.familyMembers.map((member) => (
                  <div key={member.id} className="bg-slate-50 rounded-xl p-3 space-y-2" data-testid={`family-member-${member.id}`}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Age"
                        value={member.age}
                        onChange={(e) => updateFamilyMember(member.id, 'age', e.target.value)}
                        className="w-16 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                      />
                      <button
                        onClick={() => removeFamilyMember(member.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Medical conditions/medications"
                      value={member.medical}
                      onChange={(e) => updateFamilyMember(member.id, 'medical', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Emergency Contacts Section */}
        {activeSection === 'contacts' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="contacts-section">
            <div className="flex items-center justify-between">
              <h3 className="text-blue-950 font-bold">Emergency Contacts</h3>
              <button
                onClick={addEmergencyContact}
                className="flex items-center gap-1 text-yellow-600 text-sm font-medium"
                data-testid="add-contact-btn"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            <div className="space-y-3">
              {plan.emergencyContacts.map((contact) => (
                <div key={contact.id} className="bg-slate-50 rounded-xl p-3 space-y-2" data-testid={`contact-${contact.id}`}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(contact.id, 'name', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                    />
                    {plan.emergencyContacts.length > 1 && (
                      <button
                        onClick={() => removeEmergencyContact(contact.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={contact.phone}
                      onChange={(e) => updateEmergencyContact(contact.id, 'phone', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={contact.relationship}
                      onChange={(e) => updateEmergencyContact(contact.id, 'relationship', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Points Section */}
        {activeSection === 'meeting' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="meeting-section">
            <h3 className="text-blue-950 font-bold">Meeting Points</h3>
            <p className="text-slate-500 text-sm">Designate meeting locations for different scenarios</p>
            
            <div className="space-y-3">
              {plan.meetingPoints.map((point) => (
                <div key={point.id} className="bg-slate-50 rounded-xl p-3" data-testid={`meeting-point-${point.id}`}>
                  <label className="text-blue-950 font-medium text-sm block mb-2">
                    {point.name}
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${point.name.toLowerCase()} meeting point...`}
                    value={point.location}
                    onChange={(e) => updateMeetingPoint(point.id, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evacuation Section */}
        {activeSection === 'evacuation' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="evacuation-section">
            <h3 className="text-blue-950 font-bold">Evacuation Routes</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-slate-600 text-sm block mb-1">Primary Route</label>
                <input
                  type="text"
                  placeholder="Describe your primary evacuation route..."
                  value={plan.evacuation.primaryRoute}
                  onChange={(e) => setPlan(prev => ({
                    ...prev,
                    evacuation: { ...prev.evacuation, primaryRoute: e.target.value }
                  }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm block mb-1">Alternate Route</label>
                <input
                  type="text"
                  placeholder="Describe your alternate evacuation route..."
                  value={plan.evacuation.alternateRoute}
                  onChange={(e) => setPlan(prev => ({
                    ...prev,
                    evacuation: { ...prev.evacuation, alternateRoute: e.target.value }
                  }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm block mb-1">Nearest Evacuation Center</label>
                <input
                  type="text"
                  placeholder="Name and address of nearest evacuation center..."
                  value={plan.evacuation.nearestEvacCenter}
                  onChange={(e) => setPlan(prev => ({
                    ...prev,
                    evacuation: { ...prev.evacuation, nearestEvacCenter: e.target.value }
                  }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Special Needs Section */}
        {activeSection === 'special' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="special-section">
            <h3 className="text-blue-950 font-bold">Special Considerations</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-slate-600 text-sm block mb-1">Special Needs</label>
                <textarea
                  placeholder="List any special medical needs, disabilities, or requirements..."
                  value={plan.specialNeeds}
                  onChange={(e) => setPlan(prev => ({ ...prev, specialNeeds: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] resize-none"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm block mb-1">Pets</label>
                <textarea
                  placeholder="List pets and any special care requirements..."
                  value={plan.pets}
                  onChange={(e) => setPlan(prev => ({ ...prev, pets: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] resize-none"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm block mb-1">Important Information</label>
                <textarea
                  placeholder="Any other important information for emergencies..."
                  value={plan.importantInfo}
                  onChange={(e) => setPlan(prev => ({ ...prev, importantInfo: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {true && (
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-blue-950 font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="save-plan-btn"
          >
            <Save className="w-5 h-5" />
            {'Save Emergency Plan'}
          </button>
        )}
      </main>
    </div>
  );
}

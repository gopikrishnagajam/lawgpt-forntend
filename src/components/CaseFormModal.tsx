import { useState, useEffect } from 'react';
import { X, FileText, Building2, Users, Scale, Calendar, Info, Plus, Trash2 } from 'lucide-react';
import { caseService } from '@/services/case.service';
import { clientService } from '@/services/client.service';
import { useAuthStore } from '@/store/auth.store';
import type { 
  Case, 
  CaseType, 
  CaseStatus, 
  CasePriority, 
  CreateCaseRequest,
  PartyInfo,
  ClientType
} from '@/types/case.types';
import type { Client } from '@/types/client.types';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  caseToEdit?: Case;
}

type TabType = 'basic' | 'court' | 'parties' | 'details' | 'dates' | 'additional';

export const CaseFormModal = ({ isOpen, onClose, onSuccess, caseToEdit }: CaseFormModalProps) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  
  // Basic Information
  const [caseType, setCaseType] = useState<CaseType>('CIVIL');
  const [subType, setSubType] = useState('');
  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [caseNumberType, setCaseNumberType] = useState('');
  const [caseRegistrationDate, setCaseRegistrationDate] = useState('');
  const [filingDate, setFilingDate] = useState('');
  const [caseYear, setCaseYear] = useState('');
  
  // Court Information
  const [courtLevel, setCourtLevel] = useState('');
  const [courtName, setCourtName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [courtComplex, setCourtComplex] = useState('');
  const [courtHallNumber, setCourtHallNumber] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [caseStage, setCaseStage] = useState('');
  
  // Party Information
  const [plaintiffs, setPlaintiffs] = useState<PartyInfo[]>([{
    name: '',
    address: { street: '', city: '', state: '', postal_code: '', country: '' },
    phone: '',
    email: '',
    advocate_name: '',
    advocate_bar_registration: ''
  }]);
  const [defendants, setDefendants] = useState<PartyInfo[]>([{
    name: '',
    address: { street: '', city: '', state: '', postal_code: '', country: '' },
    phone: '',
    email: '',
    advocate_name: '',
    advocate_bar_registration: ''
  }]);
  
  // Case Details
  const [natureOfSuit, setNatureOfSuit] = useState('');
  const [reliefSought, setReliefSought] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [subjectMatter, setSubjectMatter] = useState('');
  const [briefFacts, setBriefFacts] = useState('');
  const [actsApplicable, setActsApplicable] = useState('');
  
  // Criminal case specific
  const [firNumber, setFirNumber] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [firDate, setFirDate] = useState('');
  const [offenseDetails, setOffenseDetails] = useState('');
  const [custodyStatus, setCustodyStatus] = useState('');
  const [investigationOfficer, setInvestigationOfficer] = useState('');
  
  // Assigned Client
  const [assignedClientId, setAssignedClientId] = useState<number | ''>('');
  const [clientType, setClientType] = useState<ClientType>('PLAINTIFF');
  
  // Important Dates
  const [dateOfFiling, setDateOfFiling] = useState('');
  const [firstHearingDate, setFirstHearingDate] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [lastHearingDate, setLastHearingDate] = useState('');
  
  // Additional Information
  const [priority, setPriority] = useState<CasePriority>('MEDIUM');
  const [status, setStatus] = useState<CaseStatus>('ACTIVE');
  const [internalNotes, setInternalNotes] = useState('');
  const [tags, setTags] = useState('');
  
  // Disposition Info
  const [currentStatus, setCurrentStatus] = useState('');
  const [disposedOnDate, setDisposedOnDate] = useState('');
  const [finalOrderSummary, setFinalOrderSummary] = useState('');

  // Fetch clients on mount
  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  // Auto-fill filing year
  useEffect(() => {
    if (filingDate) {
      setCaseYear(new Date(filingDate).getFullYear().toString());
      setDateOfFiling(filingDate);
    }
  }, [filingDate]);

  // Populate form when editing a case
  useEffect(() => {
    if (caseToEdit && isOpen) {
      setCaseType(caseToEdit.caseType);
      setSubType(caseToEdit.caseSubType || '');
      setTitle(caseToEdit.caseTitle);
      setCaseNumber(caseToEdit.caseNumber || '');
      setCaseNumberType(caseToEdit.caseNumberType || '');
      setCaseRegistrationDate(caseToEdit.caseRegistrationDate || '');
      setFilingDate(caseToEdit.filingDate || '');
      setCaseYear(caseToEdit.caseYear?.toString() || '');

      // Court Information
      setCourtLevel(caseToEdit.courtLevel || '');
      setCourtName(caseToEdit.courtName || '');
      setState(caseToEdit.state || '');
      setDistrict(caseToEdit.district || '');
      setCourtComplex(caseToEdit.courtComplex || '');
      setCourtHallNumber(caseToEdit.courtHallNumber || '');
      setJudgeName(caseToEdit.judgeName || '');
      setCaseStage(caseToEdit.caseStage || '');

      // Party Information
      if (caseToEdit.caseType === 'CIVIL' && caseToEdit.civilCaseDetails) {
        setPlaintiffs(caseToEdit.civilCaseDetails.plaintiffs || [{
          name: '',
          address: { street: '', city: '', state: '', postal_code: '', country: '' },
          phone: '',
          email: '',
          advocate_name: '',
          advocate_bar_registration: ''
        }]);
        setDefendants(caseToEdit.civilCaseDetails.defendants || [{
          name: '',
          address: { street: '', city: '', state: '', postal_code: '', country: '' },
          phone: '',
          email: '',
          advocate_name: '',
          advocate_bar_registration: ''
        }]);

        // Case Details - Civil
        setNatureOfSuit(caseToEdit.civilCaseDetails.nature_of_suit || '');
        setReliefSought(caseToEdit.civilCaseDetails.relief_sought || '');
        setClaimAmount(caseToEdit.civilCaseDetails.claim_amount?.toString() || '');
        setSubjectMatter(caseToEdit.civilCaseDetails.subject_matter || '');
        setBriefFacts(caseToEdit.civilCaseDetails.brief_facts || '');
        setActsApplicable(caseToEdit.civilCaseDetails.acts_applicable?.join(', ') || '');
      } else if (caseToEdit.caseType === 'CRIMINAL' && caseToEdit.criminalCaseDetails) {
        // Case Details - Criminal
        setFirNumber(caseToEdit.criminalCaseDetails.fir_number || '');
        setPoliceStation(caseToEdit.criminalCaseDetails.police_station || '');
        setFirDate(caseToEdit.criminalCaseDetails.fir_date || '');
        setOffenseDetails(caseToEdit.criminalCaseDetails.offense_details || '');
        setCustodyStatus(caseToEdit.criminalCaseDetails.custody_status || '');
        setInvestigationOfficer(caseToEdit.criminalCaseDetails.investigation_officer || '');
      }

      // Important Dates
      setDateOfFiling(caseToEdit.filingDate || '');
      setFirstHearingDate(caseToEdit.firstHearingDate || '');
      setNextHearingDate(caseToEdit.nextHearingDate || '');
      setLastHearingDate(caseToEdit.lastHearingDate || '');

      // Additional Information
      setPriority(caseToEdit.casePriority);
      setStatus(caseToEdit.caseStatus);
      setInternalNotes(caseToEdit.internalNotes || '');
      setTags(caseToEdit.tags?.join(', ') || '');

      // Disposition Info
      setCurrentStatus(caseToEdit.currentStatus || '');
      setDisposedOnDate(caseToEdit.disposedOnDate || '');
      setFinalOrderSummary(caseToEdit.finalOrderSummary || '');
    }
  }, [caseToEdit, isOpen]);

  const fetchClients = async () => {
    try {
      const response = await clientService.getClients();
      setClients(response.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const addPlaintiff = () => {
    setPlaintiffs([...plaintiffs, {
      name: '',
      address: { street: '', city: '', state: '', postal_code: '', country: '' },
      phone: '',
      email: '',
      advocate_name: '',
      advocate_bar_registration: ''
    }]);
  };

  const removePlaintiff = (index: number) => {
    if (plaintiffs.length > 1) {
      setPlaintiffs(plaintiffs.filter((_, i) => i !== index));
    }
  };

  const updatePlaintiff = (index: number, field: keyof PartyInfo, value: string) => {
    const updated = [...plaintiffs];
    if (field === 'address') {
      return; // Handle address separately
    }
    updated[index] = { ...updated[index], [field]: value };
    setPlaintiffs(updated);
  };

  const updatePlaintiffAddress = (index: number, field: string, value: string) => {
    const updated = [...plaintiffs];
    if (!updated[index].address) {
      updated[index].address = {};
    }
    updated[index].address = { ...updated[index].address, [field]: value };
    setPlaintiffs(updated);
  };

  const addDefendant = () => {
    setDefendants([...defendants, {
      name: '',
      address: { street: '', city: '', state: '', postal_code: '', country: '' },
      phone: '',
      email: '',
      advocate_name: '',
      advocate_bar_registration: ''
    }]);
  };

  const removeDefendant = (index: number) => {
    if (defendants.length > 1) {
      setDefendants(defendants.filter((_, i) => i !== index));
    }
  };

  const updateDefendant = (index: number, field: keyof PartyInfo, value: string) => {
    const updated = [...defendants];
    if (field === 'address') {
      return; // Handle address separately
    }
    updated[index] = { ...updated[index], [field]: value };
    setDefendants(updated);
  };

  const updateDefendantAddress = (index: number, field: string, value: string) => {
    const updated = [...defendants];
    if (!updated[index].address) {
      updated[index].address = {};
    }
    updated[index].address = { ...updated[index].address, [field]: value };
    setDefendants(updated);
  };

  const resetForm = () => {
    setCaseType('CIVIL');
    setSubType('');
    setTitle('');
    setCaseNumber('');
    setCaseNumberType('');
    setCaseRegistrationDate('');
    setFilingDate('');
    setCaseYear('');
    setCourtLevel('');
    setCourtName('');
    setState('');
    setDistrict('');
    setCourtComplex('');
    setCourtHallNumber('');
    setJudgeName('');
    setCaseStage('');
    setPlaintiffs([{
      name: '',
      address: { street: '', city: '', state: '', postal_code: '', country: '' },
      phone: '',
      email: '',
      advocate_name: '',
      advocate_bar_registration: ''
    }]);
    setDefendants([{
      name: '',
      address: { street: '', city: '', state: '', postal_code: '', country: '' },
      phone: '',
      email: '',
      advocate_name: '',
      advocate_bar_registration: ''
    }]);
    setNatureOfSuit('');
    setReliefSought('');
    setClaimAmount('');
    setSubjectMatter('');
    setBriefFacts('');
    setActsApplicable('');
    setFirNumber('');
    setPoliceStation('');
    setFirDate('');
    setOffenseDetails('');
    setCustodyStatus('');
    setInvestigationOfficer('');
    setAssignedClientId('');
    setClientType('PLAINTIFF');
    setDateOfFiling('');
    setFirstHearingDate('');
    setNextHearingDate('');
    setLastHearingDate('');
    setPriority('MEDIUM');
    setStatus('ACTIVE');
    setInternalNotes('');
    setTags('');
    setCurrentStatus('');
    setDisposedOnDate('');
    setFinalOrderSummary('');
    setError(null);
    setActiveTab('basic');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const caseData: CreateCaseRequest = {
        case_type: caseType,
        title,
        case_number: caseNumber,
        case_number_type: caseNumberType || undefined,
        case_registration_date: caseRegistrationDate || null,
        case_year: parseInt(caseYear),
        sub_type: subType || undefined,
        filing_date: filingDate || null,
        court_info: {
          court_level: courtLevel,
          court_name: courtName,
          state: state || undefined,
          district: district || undefined,
          court_complex: courtComplex || undefined,
          court_hall_number: courtHallNumber || undefined,
          judge_name: judgeName || undefined,
          case_stage: caseStage || undefined,
        },
        party_info: {
          plaintiffs: plaintiffs.filter(p => p.name.trim() !== ''),
          defendants: defendants.filter(d => d.name.trim() !== ''),
        },
        case_details: caseType === 'CIVIL' ? {
          nature_of_suit: natureOfSuit || undefined,
          relief_sought: reliefSought || undefined,
          claim_amount: claimAmount ? parseFloat(claimAmount) : undefined,
          subject_matter: subjectMatter || undefined,
          brief_facts: briefFacts || undefined,
          acts_applicable: actsApplicable 
            ? actsApplicable.split(',').map(a => a.trim()).filter(Boolean)
            : undefined,
        } : {
          fir_number: firNumber || undefined,
          police_station: policeStation || undefined,
          fir_date: firDate || undefined,
          offense_details: offenseDetails || undefined,
          custody_status: custodyStatus || undefined,
          investigation_officer: investigationOfficer || undefined,
        },
        important_dates: {
          date_of_filing: dateOfFiling || filingDate || new Date().toISOString().split('T')[0],
          first_hearing_date: firstHearingDate || undefined,
          next_hearing_date: nextHearingDate || undefined,
          last_hearing_date: lastHearingDate || undefined,
        },
        additional_info: {
          priority,
          status,
          internal_notes: internalNotes || undefined,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        },
        current_status: currentStatus || undefined,
        disposed_on_date: disposedOnDate || undefined,
        final_order_summary: finalOrderSummary || undefined,
      };

      if (caseToEdit) {
        await caseService.updateCase(caseToEdit.id, caseData);
      } else {
        // Create new case
        const response = await caseService.createCase(caseData);
        
        // Auto-assign the creator to the case
        if (response.data?.id && user) {
          try {
            const userId = parseInt(user.id);
            await caseService.addCaseTeamMember(response.data.id, { userId });
          } catch (assignErr) {
            // Log the error but don't fail the case creation
            console.error('Error auto-assigning creator to case:', assignErr);
          }
        }
      }

      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save case');
      console.error('Error saving case:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'basic', label: 'Basic Info', icon: <FileText className="w-4 h-4" /> },
    { id: 'court', label: 'Court Info', icon: <Building2 className="w-4 h-4" /> },
    { id: 'parties', label: 'Parties', icon: <Users className="w-4 h-4" /> },
    { id: 'details', label: 'Case Details', icon: <Scale className="w-4 h-4" /> },
    { id: 'dates', label: 'Important Dates', icon: <Calendar className="w-4 h-4" /> },
    { id: 'additional', label: 'Additional Info', icon: <Info className="w-4 h-4" /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {caseToEdit ? 'Edit Case' : 'Create New Case'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Fill in the structured case information</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close modal"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            )}

            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={caseType}
                      onChange={(e) => setCaseType(e.target.value as CaseType)}
                      aria-label="Case Type"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CIVIL">Civil</option>
                      <option value="CRIMINAL">Criminal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Type
                    </label>
                    <input
                      type="text"
                      value={subType}
                      onChange={(e) => setSubType(e.target.value)}
                      placeholder={caseType === 'CIVIL' ? 'e.g., Suit for Recovery' : 'e.g., Sessions Trial'}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., ABC Pvt. Ltd. vs XYZ Enterprises"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      placeholder="e.g., T.R.C. Nos. 123 and 150 of 2009"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Number Type
                    </label>
                    <input
                      type="text"
                      value={caseNumberType}
                      onChange={(e) => setCaseNumberType(e.target.value)}
                      placeholder="e.g., TRC, WP, CS"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Registration Date
                    </label>
                    <input
                      type="date"
                      value={caseRegistrationDate}
                      onChange={(e) => setCaseRegistrationDate(e.target.value)}
                      aria-label="Case Registration Date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filing Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={filingDate}
                      onChange={(e) => setFilingDate(e.target.value)}
                      aria-label="Filing Date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={caseYear}
                      onChange={(e) => setCaseYear(e.target.value)}
                      placeholder="2025"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Court Information Tab */}
            {activeTab === 'court' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Court Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Court Level <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={courtLevel}
                      onChange={(e) => setCourtLevel(e.target.value)}
                      placeholder="e.g., District Court, High Court"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Court Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={courtName}
                      onChange={(e) => setCourtName(e.target.value)}
                      placeholder="e.g., Court of Civil Judge (Sr. Div.)"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g., Karnataka"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g., Bengaluru Urban"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Court Complex
                    </label>
                    <input
                      type="text"
                      value={courtComplex}
                      onChange={(e) => setCourtComplex(e.target.value)}
                      placeholder="e.g., City Civil Court Complex"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Court Hall Number
                    </label>
                    <input
                      type="text"
                      value={courtHallNumber}
                      onChange={(e) => setCourtHallNumber(e.target.value)}
                      placeholder="e.g., 12"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judge Name
                    </label>
                    <input
                      type="text"
                      value={judgeName}
                      onChange={(e) => setJudgeName(e.target.value)}
                      placeholder="e.g., Sri. Ramesh Kumar"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Stage
                    </label>
                    <input
                      type="text"
                      value={caseStage}
                      onChange={(e) => setCaseStage(e.target.value)}
                      placeholder="e.g., Filed, Under Trial"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Parties Tab */}
            {activeTab === 'parties' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Party Information
                </h3>

                {/* Plaintiffs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-800">
                      {caseType === 'CIVIL' ? 'Plaintiffs' : 'Complainants'}
                    </h4>
                    <button
                      type="button"
                      onClick={addPlaintiff}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add {caseType === 'CIVIL' ? 'Plaintiff' : 'Complainant'}
                    </button>
                  </div>

                  {plaintiffs.map((plaintiff, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-700">
                          {caseType === 'CIVIL' ? 'Plaintiff' : 'Complainant'} #{index + 1}
                        </h5>
                        {plaintiffs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePlaintiff(index)}
                            aria-label="Remove plaintiff"
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={plaintiff.name}
                            onChange={(e) => updatePlaintiff(index, 'name', e.target.value)}
                            placeholder="Full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={plaintiff.email || ''}
                            onChange={(e) => updatePlaintiff(index, 'email', e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={plaintiff.phone || ''}
                            onChange={(e) => updatePlaintiff(index, 'phone', e.target.value)}
                            placeholder="+91-9876543210"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                          <input
                            type="text"
                            value={plaintiff.address?.street || ''}
                            onChange={(e) => updatePlaintiffAddress(index, 'street', e.target.value)}
                            placeholder="No. 12, MG Road"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={plaintiff.address?.city || ''}
                            onChange={(e) => updatePlaintiffAddress(index, 'city', e.target.value)}
                            placeholder="Bengaluru"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            value={plaintiff.address?.state || ''}
                            onChange={(e) => updatePlaintiffAddress(index, 'state', e.target.value)}
                            placeholder="Karnataka"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                          <input
                            type="text"
                            value={plaintiff.address?.postal_code || ''}
                            onChange={(e) => updatePlaintiffAddress(index, 'postal_code', e.target.value)}
                            placeholder="560001"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            value={plaintiff.address?.country || ''}
                            onChange={(e) => updatePlaintiffAddress(index, 'country', e.target.value)}
                            placeholder="India"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Advocate Name</label>
                          <input
                            type="text"
                            value={plaintiff.advocate_name || ''}
                            onChange={(e) => updatePlaintiff(index, 'advocate_name', e.target.value)}
                            placeholder="Adv. S. Narayan"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bar Registration</label>
                          <input
                            type="text"
                            value={plaintiff.advocate_bar_registration || ''}
                            onChange={(e) => updatePlaintiff(index, 'advocate_bar_registration', e.target.value)}
                            placeholder="KAR/1234/2010"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Defendants */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-800">
                      {caseType === 'CIVIL' ? 'Defendants' : 'Accused'}
                    </h4>
                    <button
                      type="button"
                      onClick={addDefendant}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add {caseType === 'CIVIL' ? 'Defendant' : 'Accused'}
                    </button>
                  </div>

                  {defendants.map((defendant, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-700">
                          {caseType === 'CIVIL' ? 'Defendant' : 'Accused'} #{index + 1}
                        </h5>
                        {defendants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDefendant(index)}
                            aria-label="Remove defendant"
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={defendant.name}
                            onChange={(e) => updateDefendant(index, 'name', e.target.value)}
                            placeholder="Full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={defendant.email || ''}
                            onChange={(e) => updateDefendant(index, 'email', e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={defendant.phone || ''}
                            onChange={(e) => updateDefendant(index, 'phone', e.target.value)}
                            placeholder="+91-9876543210"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                          <input
                            type="text"
                            value={defendant.address?.street || ''}
                            onChange={(e) => updateDefendantAddress(index, 'street', e.target.value)}
                            placeholder="No. 45, Residency Road"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={defendant.address?.city || ''}
                            onChange={(e) => updateDefendantAddress(index, 'city', e.target.value)}
                            placeholder="Bengaluru"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            value={defendant.address?.state || ''}
                            onChange={(e) => updateDefendantAddress(index, 'state', e.target.value)}
                            placeholder="Karnataka"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                          <input
                            type="text"
                            value={defendant.address?.postal_code || ''}
                            onChange={(e) => updateDefendantAddress(index, 'postal_code', e.target.value)}
                            placeholder="560025"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            value={defendant.address?.country || ''}
                            onChange={(e) => updateDefendantAddress(index, 'country', e.target.value)}
                            placeholder="India"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Advocate Name</label>
                          <input
                            type="text"
                            value={defendant.advocate_name || ''}
                            onChange={(e) => updateDefendant(index, 'advocate_name', e.target.value)}
                            placeholder="Adv. P. Mehta"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bar Registration</label>
                          <input
                            type="text"
                            value={defendant.advocate_bar_registration || ''}
                            onChange={(e) => updateDefendant(index, 'advocate_bar_registration', e.target.value)}
                            placeholder="KAR/5678/2015"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Case Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  {caseType === 'CIVIL' ? 'Civil Case Details' : 'Criminal Case Details'}
                </h3>

                {caseType === 'CIVIL' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nature of Suit
                      </label>
                      <input
                        type="text"
                        value={natureOfSuit}
                        onChange={(e) => setNatureOfSuit(e.target.value)}
                        placeholder="e.g., Suit for recovery of money"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Claim Amount
                      </label>
                      <input
                        type="number"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        placeholder="2500000"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Matter
                      </label>
                      <input
                        type="text"
                        value={subjectMatter}
                        onChange={(e) => setSubjectMatter(e.target.value)}
                        placeholder="e.g., Outstanding dues under supply contract"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relief Sought
                      </label>
                      <textarea
                        value={reliefSought}
                        onChange={(e) => setReliefSought(e.target.value)}
                        placeholder="e.g., Decree for recovery of INR 25,00,000 with 12% p.a. interest"
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brief Facts
                      </label>
                      <textarea
                        value={briefFacts}
                        onChange={(e) => setBriefFacts(e.target.value)}
                        placeholder="Enter brief facts of the case..."
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Acts Applicable (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={actsApplicable}
                        onChange={(e) => setActsApplicable(e.target.value)}
                        placeholder="CPC 1908, Indian Contract Act 1872, Interest Act 1978"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FIR Number
                      </label>
                      <input
                        type="text"
                        value={firNumber}
                        onChange={(e) => setFirNumber(e.target.value)}
                        placeholder="e.g., FIR/123/2024"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Police Station
                      </label>
                      <input
                        type="text"
                        value={policeStation}
                        onChange={(e) => setPoliceStation(e.target.value)}
                        placeholder="e.g., Koramangala Police Station"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FIR Date
                      </label>
                      <input
                        type="date"
                        value={firDate}
                        onChange={(e) => setFirDate(e.target.value)}
                        aria-label="FIR Date"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custody Status
                      </label>
                      <input
                        type="text"
                        value={custodyStatus}
                        onChange={(e) => setCustodyStatus(e.target.value)}
                        placeholder="e.g., In custody, On bail"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Offense Details
                      </label>
                      <textarea
                        value={offenseDetails}
                        onChange={(e) => setOffenseDetails(e.target.value)}
                        placeholder="e.g., IPC Section 420, 406"
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Investigation Officer
                      </label>
                      <input
                        type="text"
                        value={investigationOfficer}
                        onChange={(e) => setInvestigationOfficer(e.target.value)}
                        placeholder="e.g., Inspector Rajesh Kumar"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Important Dates Tab */}
            {activeTab === 'dates' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Important Dates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Filing <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dateOfFiling || filingDate}
                      onChange={(e) => setDateOfFiling(e.target.value)}
                      aria-label="Date of Filing"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Auto-filled from Basic Info</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Hearing Date
                    </label>
                    <input
                      type="date"
                      value={firstHearingDate}
                      onChange={(e) => setFirstHearingDate(e.target.value)}
                      aria-label="First Hearing Date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Hearing Date
                    </label>
                    <input
                      type="date"
                      value={nextHearingDate}
                      onChange={(e) => setNextHearingDate(e.target.value)}
                      aria-label="Next Hearing Date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Hearing Date
                    </label>
                    <input
                      type="date"
                      value={lastHearingDate}
                      onChange={(e) => setLastHearingDate(e.target.value)}
                      aria-label="Last Hearing Date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Assigned Client Section */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 mb-4">Assign to Client (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Client
                      </label>
                      <select
                        value={assignedClientId}
                        onChange={(e) => setAssignedClientId(e.target.value ? Number(e.target.value) : '')}
                        aria-label="Select Client"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">No client assigned</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Type
                      </label>
                      <select
                        value={clientType}
                        onChange={(e) => setClientType(e.target.value as ClientType)}
                        aria-label="Client Type"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="PLAINTIFF">Plaintiff</option>
                        <option value="DEFENDANT">Defendant</option>
                        <option value="ACCUSED">Accused</option>
                        <option value="VICTIM">Victim</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info Tab */}
            {activeTab === 'additional' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as CasePriority)}
                      aria-label="Priority"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={status}
                      onChange={(e) => setStatus(e.target.value as CaseStatus)}
                      aria-label="Status"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="CLOSED">Closed</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="money_recovery, corporate, bengaluru"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate tags with commas for better organization
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Notes
                    </label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="e.g., Existing corporate client. Keep partner informed."
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Status
                    </label>
                    <input
                      type="text"
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value)}
                      placeholder="e.g., Disposed, Pending, Transferred"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disposed On Date
                    </label>
                    <input
                      type="date"
                      value={disposedOnDate}
                      onChange={(e) => setDisposedOnDate(e.target.value)}
                      aria-label="Disposed On Date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Final Order Summary
                    </label>
                    <textarea
                      value={finalOrderSummary}
                      onChange={(e) => setFinalOrderSummary(e.target.value)}
                      placeholder="e.g., High Court held that generator sets were removed from Entry 38..."
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
            <button
              type="button"
              onClick={() => {
                const tabOrder: TabType[] = ['basic', 'court', 'parties', 'details', 'dates', 'additional'];
                const currentIndex = tabOrder.indexOf(activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabOrder[currentIndex - 1]);
                }
              }}
              disabled={activeTab === 'basic'}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {activeTab !== 'additional' ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabOrder: TabType[] = ['basic', 'court', 'parties', 'details', 'dates', 'additional'];
                    const currentIndex = tabOrder.indexOf(activeTab);
                    if (currentIndex < tabOrder.length - 1) {
                      setActiveTab(tabOrder[currentIndex + 1]);
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Saving...
                    </>
                  ) : (
                    <>{caseToEdit ? 'Update Case' : 'Create Case'}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
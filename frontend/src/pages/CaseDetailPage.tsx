import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caseService } from '@/services/case.service';
import { CaseFormModal } from '@/components/CaseFormModal';
import { DocumentUpload } from '@/components/DocumentUpload';
import type { Case, CaseDocument } from '@/types/case.types';

export const CaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  console.log('🔍 CaseDetailPage loaded with ID:', id);
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCase = async () => {
    if (!id) return;

    console.log('📡 Fetching case data for ID:', id);
    try {
      setLoading(true);
      setError(null);
      const response = await caseService.getCaseById(parseInt(id), true);
      setCaseData(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch case details');
      console.error('Error fetching case:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await caseService.deleteCase(parseInt(id));
      navigate('/cases');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete case');
      console.error('Error deleting case:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownloadDocument = async (doc: CaseDocument) => {
    try {
      await caseService.triggerDownload(doc.id, doc.originalFilename);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to download document');
      console.error('Error downloading document:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Case not found'}</p>
          <button
            onClick={() => navigate('/cases')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Cases
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/cases')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{caseData.caseNumber}</h2>
            <p className="text-gray-600">{caseData.caseTitle}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit Case
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Case Type</p>
                <p className="font-medium">{caseData.caseType}</p>
              </div>
              {caseData.caseSubType && (
                <div>
                  <p className="text-sm text-gray-600">Sub Type</p>
                  <p className="font-medium">{caseData.caseSubType}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    caseData.caseStatus
                  )}`}
                >
                  {caseData.caseStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                    caseData.casePriority
                  )}`}
                >
                  {caseData.casePriority}
                </span>
              </div>
              {caseData.caseStage && (
                <div>
                  <p className="text-sm text-gray-600">Case Stage</p>
                  <p className="font-medium">{caseData.caseStage}</p>
                </div>
              )}
              {caseData.filingDate && (
                <div>
                  <p className="text-sm text-gray-600">Filing Date</p>
                  <p className="font-medium">{formatDate(caseData.filingDate)}</p>
                </div>
              )}
              {caseData.client && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">
                    {caseData.client.name}
                    {caseData.clientType && ` (${caseData.clientType})`}
                  </p>
                  {caseData.client.email && (
                    <p className="text-sm text-gray-600">{caseData.client.email}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Court Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {caseData.courtName && (
                <div>
                  <p className="text-sm text-gray-600">Court Name</p>
                  <p className="font-medium">{caseData.courtName}</p>
                </div>
              )}
              {caseData.courtLevel && (
                <div>
                  <p className="text-sm text-gray-600">Court Level</p>
                  <p className="font-medium">{caseData.courtLevel}</p>
                </div>
              )}
              {(caseData.state || caseData.district) && (
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">
                    {[caseData.district, caseData.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {caseData.courtComplex && (
                <div>
                  <p className="text-sm text-gray-600">Court Complex</p>
                  <p className="font-medium">{caseData.courtComplex}</p>
                </div>
              )}
              {caseData.courtHallNumber && (
                <div>
                  <p className="text-sm text-gray-600">Hall Number</p>
                  <p className="font-medium">{caseData.courtHallNumber}</p>
                </div>
              )}
              {caseData.judgeName && (
                <div>
                  <p className="text-sm text-gray-600">Judge</p>
                  <p className="font-medium">{caseData.judgeName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Hearing Dates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hearing Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              {caseData.firstHearingDate && (
                <div>
                  <p className="text-sm text-gray-600">First Hearing</p>
                  <p className="font-medium">{formatDate(caseData.firstHearingDate)}</p>
                </div>
              )}
              {caseData.lastHearingDate && (
                <div>
                  <p className="text-sm text-gray-600">Last Hearing</p>
                  <p className="font-medium">{formatDate(caseData.lastHearingDate)}</p>
                </div>
              )}
              {caseData.nextHearingDate && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Next Hearing</p>
                  <p className="font-medium text-lg text-blue-600">
                    {formatDate(caseData.nextHearingDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Civil Case Details */}
          {caseData.caseType === 'CIVIL' && caseData.civilCaseDetails && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Civil Case Details</h3>
              <div className="space-y-3">
                {caseData.civilCaseDetails.plaintiffs && caseData.civilCaseDetails.plaintiffs.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Plaintiff(s)</p>
                    {caseData.civilCaseDetails.plaintiffs.map((plaintiff, idx) => (
                      <div key={idx} className="mt-1">
                        <p className="font-medium">{plaintiff.name}</p>
                        {plaintiff.email && <p className="text-sm text-gray-600">{plaintiff.email}</p>}
                        {plaintiff.phone && <p className="text-sm text-gray-600">{plaintiff.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {caseData.civilCaseDetails.defendants && caseData.civilCaseDetails.defendants.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Defendant(s)</p>
                    {caseData.civilCaseDetails.defendants.map((defendant, idx) => (
                      <div key={idx} className="mt-1">
                        <p className="font-medium">{defendant.name}</p>
                        {defendant.email && <p className="text-sm text-gray-600">{defendant.email}</p>}
                        {defendant.phone && <p className="text-sm text-gray-600">{defendant.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {caseData.civilCaseDetails.nature_of_suit && (
                  <div>
                    <p className="text-sm text-gray-600">Nature of Suit</p>
                    <p className="font-medium">{caseData.civilCaseDetails.nature_of_suit}</p>
                  </div>
                )}
                {caseData.civilCaseDetails.relief_sought && (
                  <div>
                    <p className="text-sm text-gray-600">Relief Sought</p>
                    <p className="font-medium">{caseData.civilCaseDetails.relief_sought}</p>
                  </div>
                )}
                {caseData.civilCaseDetails.claim_amount && (
                  <div>
                    <p className="text-sm text-gray-600">Claim Amount</p>
                    <p className="font-medium">
                      ₹{caseData.civilCaseDetails.claim_amount.toLocaleString()}
                    </p>
                  </div>
                )}
                {caseData.civilCaseDetails.acts_applicable && caseData.civilCaseDetails.acts_applicable.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Acts Applicable</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {caseData.civilCaseDetails.acts_applicable.map((act, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {caseData.civilCaseDetails.brief_facts && (
                  <div>
                    <p className="text-sm text-gray-600">Brief Facts</p>
                    <p className="font-medium text-sm">{caseData.civilCaseDetails.brief_facts}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Criminal Case Details */}
          {caseData.caseType === 'CRIMINAL' && caseData.criminalCaseDetails && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Criminal Case Details</h3>
              <div className="space-y-3">
                {caseData.criminalCaseDetails.fir_number && (
                  <div>
                    <p className="text-sm text-gray-600">FIR Number</p>
                    <p className="font-medium">{caseData.criminalCaseDetails.fir_number}</p>
                  </div>
                )}
                {caseData.criminalCaseDetails.police_station && (
                  <div>
                    <p className="text-sm text-gray-600">Police Station</p>
                    <p className="font-medium">{caseData.criminalCaseDetails.police_station}</p>
                  </div>
                )}
                {caseData.criminalCaseDetails.fir_date && (
                  <div>
                    <p className="text-sm text-gray-600">FIR Date</p>
                    <p className="font-medium">{formatDate(caseData.criminalCaseDetails.fir_date)}</p>
                  </div>
                )}
                {caseData.criminalCaseDetails.complainant && caseData.criminalCaseDetails.complainant.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Complainant(s)</p>
                    {caseData.criminalCaseDetails.complainant.map((complainant, idx) => (
                      <div key={idx} className="mt-1">
                        <p className="font-medium">{complainant.name}</p>
                        {complainant.email && <p className="text-sm text-gray-600">{complainant.email}</p>}
                        {complainant.phone && <p className="text-sm text-gray-600">{complainant.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {caseData.criminalCaseDetails.accused && caseData.criminalCaseDetails.accused.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Accused</p>
                    {caseData.criminalCaseDetails.accused.map((accused, idx) => (
                      <div key={idx} className="mt-1">
                        <p className="font-medium">{accused.name}</p>
                        {accused.email && <p className="text-sm text-gray-600">{accused.email}</p>}
                        {accused.phone && <p className="text-sm text-gray-600">{accused.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {caseData.criminalCaseDetails.offense_details && (
                  <div>
                    <p className="text-sm text-gray-600">Offense Details</p>
                    <p className="font-medium">{caseData.criminalCaseDetails.offense_details}</p>
                  </div>
                )}
                {caseData.criminalCaseDetails.custody_status && (
                  <div>
                    <p className="text-sm text-gray-600">Custody Status</p>
                    <p className="font-medium">{caseData.criminalCaseDetails.custody_status}</p>
                  </div>
                )}
                {caseData.criminalCaseDetails.investigation_officer && (
                  <div>
                    <p className="text-sm text-gray-600">Investigation Officer</p>
                    <p className="font-medium">{caseData.criminalCaseDetails.investigation_officer}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          {caseData.internalNotes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{caseData.internalNotes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {caseData.tags && caseData.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {caseData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Upload
              </button>
            </div>
            {caseData.documents && caseData.documents.length > 0 ? (
              <div className="space-y-3">
                {caseData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleDownloadDocument(doc)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {doc.originalFilename}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{doc.documentType}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No documents uploaded yet</p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">{formatDate(caseData.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-medium">{formatDate(caseData.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <CaseFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchCase}
        caseToEdit={caseData}
      />

      {/* Document Upload Modal */}
      {showUploadModal && (
        <DocumentUpload
          caseId={caseData.id}
          onSuccess={fetchCase}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Case</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this case? This action cannot be undone and will also delete all associated documents.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

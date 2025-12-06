import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/client.service';
import { ClientFormModal } from '../components/ClientFormModal';
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Loader2, AlertCircle } from 'lucide-react';
import type { Client, CreateClientRequest, UpdateClientRequest } from '../types/client.types';

export const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Helper to format address
  const formatAddress = (address: string | { street?: string; city?: string; state?: string; zip?: string; country?: string } | null): string => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    const parts = [address.street, address.city, address.state, address.zip, address.country].filter(Boolean);
    return parts.join(', ');
  };

  // Fetch clients
  const { data: clientsData, isLoading, error } = useQuery({
    queryKey: ['clients', debouncedSearchTerm],
    queryFn: async () => {
      try {
        return await clientService.getClients({ search: debouncedSearchTerm || undefined, limit: 100 });
      } catch (err) {
        console.error('Error fetching clients:', err);
        throw err;
      }
    },
    retry: false,
  });

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateClientRequest) => {
      console.log('🚀 Creating client with data:', data);
      console.log('📡 API endpoint: POST http://localhost:3000/api/clients');
      try {
        const result = await clientService.createClient(data);
        console.log('✅ Client created successfully:', result);
        return result;
      } catch (err) {
        console.error('❌ Error creating client:', err);
        if (err instanceof Error) {
          console.error('Error message:', err.message);
        }
        // Log axios error details
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosErr = err as { response?: { status?: number; data?: unknown; statusText?: string } };
          console.error('Response status:', axiosErr.response?.status);
          console.error('Response data:', axiosErr.response?.data);
          console.error('Status text:', axiosErr.response?.statusText);
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Mutation onSuccess called with:', data);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
      setSelectedClient(null);
    },
    onError: (error) => {
      console.error('❌ Mutation onError called with:', error);
    },
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClientRequest }) =>
      clientService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
      setSelectedClient(null);
    },
  });

  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: clientService.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setDeleteConfirm(null);
    },
  });

  const handleSubmit = async (data: CreateClientRequest) => {
    console.log('📝 handleSubmit called with:', data);
    console.log('📝 selectedClient:', selectedClient);
    try {
      if (selectedClient) {
        console.log('🔄 Updating existing client:', selectedClient.id);
        await updateMutation.mutateAsync({ id: selectedClient.id, data });
      } else {
        console.log('➕ Creating new client');
        await createMutation.mutateAsync(data);
      }
      console.log('✅ Submit completed successfully');
    } catch (err) {
      console.error('❌ Submit failed:', err);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const clients = clientsData?.data || [];

  // Debug logging
  console.log('ClientsPage render:', { isLoading, error, clientsData, clients });

  // Early return if still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Early return if error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <div>
          <h3 className="font-semibold text-red-900">Error loading clients</h3>
          <p className="text-sm text-red-700">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <p className="text-gray-600 mt-1">Manage your client relationships</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first client</p>
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md font-medium"
          >
            Add Your First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200"
            >
              {/* Client Info */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {client.name}
                </h3>
                {client.company && (
                  <p className="text-sm text-gray-600">{client.company}</p>
                )}
              </div>

              <div className="space-y-2 mb-6">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="truncate">{formatAddress(client.address)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {deleteConfirm === client.id ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Delete this client?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(client.id)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(client.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Client Form Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        onSubmit={handleSubmit}
        client={selectedClient}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};


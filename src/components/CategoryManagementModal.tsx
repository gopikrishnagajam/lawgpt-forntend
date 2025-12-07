import { useState } from 'react';
import { X, Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { forumService } from '@/services/forum.service';
import type { ForumCategory } from '@/types/forum.types';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  forumId: number;
  categories: ForumCategory[];
}

export const CategoryManagementModal = ({
  isOpen,
  onClose,
  onSuccess,
  forumId,
  categories: initialCategories,
}: CategoryManagementModalProps) => {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await forumService.createCategory(forumId, {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });

      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setNewCategoryDescription('');
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create category:', err);
      setError(err.response?.data?.error || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async (categoryId: number) => {
    if (!editName.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await forumService.updateCategory(forumId, categoryId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });

      setCategories(
        categories.map((cat) => (cat.id === categoryId ? response.data : cat))
      );
      setEditingId(null);
      setEditName('');
      setEditDescription('');
      onSuccess();
    } catch (err: any) {
      console.error('Failed to update category:', err);
      setError(err.response?.data?.error || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? Threads in this category will not be deleted.')) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await forumService.deleteCategory(forumId, categoryId);
      setCategories(categories.filter((cat) => cat.id !== categoryId));
      onSuccess();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      setError(err.response?.data?.error || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (category: ForumCategory) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add New Category */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Add New Category</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <input
                type="text"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <button
                onClick={handleAddCategory}
                disabled={isSubmitting || !newCategoryName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Existing Categories */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Existing Categories</h3>
            {categories.length === 0 ? (
              <p className="text-gray-500 text-sm">No categories yet</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    {editingId === category.id ? (
                      // Edit Mode
                      <>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Category name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isSubmitting}
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isSubmitting}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCategory(category.id)}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      // View Mode
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <GripVertical className="w-5 h-5 text-gray-400 mt-0.5 cursor-move" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{category.name}</h4>
                            {category.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditing(category)}
                            disabled={isSubmitting}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={isSubmitting}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

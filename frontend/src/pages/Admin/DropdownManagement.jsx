import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Tag, Loader, AlertTriangle } from 'lucide-react';

const DropdownCard = ({ fieldName, dropdown, fetchDropdowns }) => {
    const [newValue, setNewValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddValue = async (e) => {
        e.preventDefault();
        if (!newValue.trim()) return;

        setIsAdding(true);
        const toastId = toast.loading(`Adding "${newValue}" to ${fieldName}...`);
        try {
            await apiRequest(`/api/dropdowns/${fieldName}`, {
                method: 'PUT',
                body: JSON.stringify({ value: newValue.trim() }),
            });
            toast.success(`Value added to ${fieldName}`, { id: toastId });
            setNewValue('');
            fetchDropdowns();
        } catch (error) {
            console.error('Failed to add value:', error);
            toast.error(error.message || 'Failed to add value.', { id: toastId });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteValue = async (valueToDelete) => {
        if (!window.confirm(`Are you sure you want to delete "${valueToDelete}" from ${fieldName}?`)) return;

        const toastId = toast.loading(`Deleting "${valueToDelete}"...`);
        try {
            await apiRequest(`/api/dropdowns/${fieldName}/value`, {
                method: 'DELETE',
                body: JSON.stringify({ value: valueToDelete }),
            });
            toast.success(`Value deleted from ${fieldName}`, { id: toastId });
            fetchDropdowns();
        } catch (error) {
            console.error('Failed to delete value:', error);
            toast.error(error.message || 'Failed to delete value.', { id: toastId });
        }
    };
    
    const handleDeleteDropdown = async () => {
        if (!window.confirm(`Are you sure you want to delete the entire "${fieldName}" dropdown? This action cannot be undone.`)) return;

        const toastId = toast.loading(`Deleting dropdown "${fieldName}"...`);
        try {
            await apiRequest(`/api/dropdowns/${fieldName}`, { method: 'DELETE' });
            toast.success(`Dropdown "${fieldName}" deleted.`, { id: toastId });
            fetchDropdowns();
        } catch (error) {
            console.error('Failed to delete dropdown:', error);
            toast.error(error.message || 'Failed to delete dropdown.', { id: toastId });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary-500" />
                    {fieldName.replace(/([A-Z])/g, ' $1')}
                </h3>
                <button onClick={handleDeleteDropdown} className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <div className="p-5 space-y-3">
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {dropdown.values?.map((value, index) => (
                        <li key={index} className="flex justify-between items-center bg-slate-50 rounded-md p-2 text-sm">
                            <span className="text-slate-700">{value}</span>
                            <button onClick={() => handleDeleteValue(value)} className="text-slate-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
                <form onSubmit={handleAddValue} className="flex gap-2">
                    <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="input input-sm flex-grow"
                        placeholder="Add new value"
                        disabled={isAdding}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={isAdding}>
                        {isAdding ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

const CreateDropdownForm = ({ fetchDropdowns }) => {
    const [fieldName, setFieldName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fieldName.trim()) {
            toast.error('Field name cannot be empty.');
            return;
        }
        
        // camelCase the field name
        const camelCaseFieldName = fieldName.trim().replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()
        ).replace(/\s+/g, '');


        setIsCreating(true);
        const toastId = toast.loading(`Creating dropdown "${camelCaseFieldName}"...`);
        try {
            await apiRequest('/api/dropdowns', {
                method: 'POST',
                body: JSON.stringify({ fieldName: camelCaseFieldName, values: [] }),
            });
            toast.success(`Dropdown "${camelCaseFieldName}" created.`, { id: toastId });
            setFieldName('');
            fetchDropdowns();
        } catch (error) {
            console.error('Failed to create dropdown:', error);
            toast.error(error.message || 'Failed to create dropdown.', { id: toastId });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Create New Dropdown</h2>
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="input flex-grow"
                    placeholder="e.g., Product Material"
                    disabled={isCreating}
                />
                <button type="submit" className="btn btn-primary" disabled={isCreating}>
                    {isCreating ? <Loader className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Create</>}
                </button>
            </form>
             <p className="text-xs text-slate-500 mt-2">The name will be converted to camelCase (e.g., 'Product Material' becomes 'productMaterial').</p>
        </div>
    );
};

export default function DropdownManagement() {
    const [dropdowns, setDropdowns] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchDropdowns = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiRequest('/api/dropdowns');
            // API returns { success: true, data: { category: [...], subCategory: [...] } }
            const data = response.data || response || {};
            // Transform to the format DropdownCard expects: { fieldName: { values: [...] } }
            const transformed = {};
            Object.entries(data).forEach(([key, values]) => {
                transformed[key] = { values: Array.isArray(values) ? values : [] };
            });
            setDropdowns(transformed);
        } catch (error) {
            console.error('Failed to fetch dropdowns:', error);
            toast.error('Failed to load dropdown options.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDropdowns();
    }, [fetchDropdowns]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Dropdown Management</h1>
            
            <CreateDropdownForm fetchDropdowns={fetchDropdowns} />

            {loading ? (
                <div className="text-center py-12">
                    <Loader className="w-8 h-8 mx-auto animate-spin text-primary-500" />
                    <p className="mt-2 text-slate-600">Loading dropdowns...</p>
                </div>
            ) : Object.keys(dropdowns).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(dropdowns).map(([fieldName, dropdown]) => (
                        <DropdownCard key={fieldName} fieldName={fieldName} dropdown={dropdown} fetchDropdowns={fetchDropdowns} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <Tag className="w-12 h-12 mx-auto text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-800">No Dropdowns Found</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by creating a new dropdown field above.</p>
                </div>
            )}
        </div>
    );
}

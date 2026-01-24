import React, { useState, useEffect } from 'react';
import { Settings, CreditCard, Truck, DollarSign, Save, AlertTriangle, Check, Plus, Trash2, X } from 'lucide-react';
import { fetchAdminSettings, updateSettingEnabled, updateSettingNumber, createChargeSetting, deleteChargeSetting } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const SettingsPage = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState({});
    const [success, setSuccess] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCharge, setNewCharge] = useState({ name: '', description: '', number_value: 0 });
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState({});

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await fetchAdminSettings();
            setSettings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key, currentValue) => {
        const newValue = !currentValue;
        setSaving(prev => ({ ...prev, [key]: true }));
        setSuccess(prev => ({ ...prev, [key]: false }));
        
        try {
            await updateSettingEnabled(key, newValue);
            setSettings(prev => prev.map(s => 
                s.key === key ? { ...s, enabled: newValue } : s
            ));
            setSuccess(prev => ({ ...prev, [key]: true }));
            setTimeout(() => {
                setSuccess(prev => ({ ...prev, [key]: false }));
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleNumberChange = async (key, value) => {
        setSaving(prev => ({ ...prev, [`${key}_number`]: true }));
        setSuccess(prev => ({ ...prev, [`${key}_number`]: false }));
        
        try {
            await updateSettingNumber(key, value);
            setSettings(prev => prev.map(s => 
                s.key === key ? { ...s, number_value: parseFloat(value) } : s
            ));
            setSuccess(prev => ({ ...prev, [`${key}_number`]: true }));
            setTimeout(() => {
                setSuccess(prev => ({ ...prev, [`${key}_number`]: false }));
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(prev => ({ ...prev, [`${key}_number`]: false }));
        }
    };

    const getSettingIcon = (key) => {
        switch (key) {
            case 'payment_cod_enabled':
                return <Truck className="w-5 h-5" />;
            case 'payment_razorpay_enabled':
                return <CreditCard className="w-5 h-5" />;
            case 'min_order_amount':
            case 'cod_extra_charge':
                return <DollarSign className="w-5 h-5" />;
            default:
                return <Settings className="w-5 h-5" />;
        }
    };

    const getSettingLabel = (key) => {
        switch (key) {
            case 'payment_cod_enabled':
                return 'Cash on Delivery';
            case 'payment_razorpay_enabled':
                return 'Razorpay Online Payment';
            case 'min_order_amount':
                return 'Minimum Order Amount';
            case 'cod_extra_charge':
                return 'COD Extra Charge';
            default:
                return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    const hasNumberValue = (setting) => {
        return setting.number_value !== null && setting.number_value !== undefined;
    };

    const handleCreateCharge = async () => {
        if (!newCharge.name.trim()) {
            setError('Please enter a charge name');
            return;
        }
        
        setCreating(true);
        setError('');
        
        try {
            const created = await createChargeSetting(
                newCharge.name,
                newCharge.description,
                newCharge.number_value,
                true
            );
            setSettings(prev => [...prev, created]);
            setNewCharge({ name: '', description: '', number_value: 0 });
            setShowAddForm(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteCharge = async (key) => {
        if (!confirm('Are you sure you want to delete this charge?')) return;
        
        setDeleting(prev => ({ ...prev, [key]: true }));
        
        try {
            await deleteChargeSetting(key);
            setSettings(prev => prev.filter(s => s.key !== key));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(prev => ({ ...prev, [key]: false }));
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Configure your store settings</p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Payment Settings */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Settings
                        </h2>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        {settings.filter(s => !s.is_custom).map((setting) => (
                            <div key={setting.key} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                            {getSettingIcon(setting.key)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {getSettingLabel(setting.key)}
                                            </h3>
                                            <p className="text-sm text-gray-500">{setting.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {saving[setting.key] && (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                        )}
                                        {success[setting.key] && (
                                            <Check className="w-5 h-5 text-green-500" />
                                        )}
                                        
                                        {/* Enable/Disable Toggle */}
                                        <button
                                            onClick={() => handleToggle(setting.key, setting.enabled)}
                                            disabled={saving[setting.key]}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                setting.enabled ? 'bg-black' : 'bg-gray-300'
                                            } ${saving[setting.key] ? 'opacity-50' : ''}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    setting.enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Number input for numeric settings */}
                                {hasNumberValue(setting) && (
                                    <div className={`mt-3 ml-14 flex items-center gap-3 ${!setting.enabled ? 'opacity-50' : ''}`}>
                                        <span className="text-sm text-gray-600">Value:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                value={setting.number_value ?? 0}
                                                onChange={(e) => {
                                                    setSettings(prev => prev.map(s =>
                                                        s.key === setting.key ? { ...s, number_value: e.target.value } : s
                                                    ));
                                                }}
                                                onBlur={(e) => handleNumberChange(setting.key, e.target.value)}
                                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black"
                                                disabled={saving[`${setting.key}_number`] || !setting.enabled}
                                            />
                                        </div>
                                        {saving[`${setting.key}_number`] && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                        )}
                                        {success[`${setting.key}_number`] && (
                                            <Check className="w-4 h-4 text-green-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Extra Charges Section */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Extra Charges
                        </h2>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Charge
                        </button>
                    </div>
                    
                    {/* Add New Charge Form */}
                    {showAddForm && (
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Charge Name</label>
                                    <input
                                        type="text"
                                        value={newCharge.name}
                                        onChange={(e) => setNewCharge(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Delivery Charge"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={newCharge.description}
                                        onChange={(e) => setNewCharge(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Optional description"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={newCharge.number_value}
                                        onChange={(e) => setNewCharge(prev => ({ ...prev, number_value: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateCharge}
                                    disabled={creating}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {creating ? 'Adding...' : 'Add'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setNewCharge({ name: '', description: '', number_value: 0 });
                                    }}
                                    className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="divide-y divide-gray-100">
                        {settings.filter(s => s.is_custom).length === 0 && !showAddForm ? (
                            <div className="px-6 py-8 text-center text-gray-500">
                                <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No extra charges added yet.</p>
                                <p className="text-sm">Click "Add Charge" to create one.</p>
                            </div>
                        ) : (
                            settings.filter(s => s.is_custom).map((setting) => (
                                <div key={setting.key} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {getSettingLabel(setting.key)}
                                                </h3>
                                                <p className="text-sm text-gray-500">{setting.description}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {saving[setting.key] && (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                            )}
                                            {success[setting.key] && (
                                                <Check className="w-5 h-5 text-green-500" />
                                            )}
                                            
                                            {/* Enable/Disable Toggle */}
                                            <button
                                                onClick={() => handleToggle(setting.key, setting.enabled)}
                                                disabled={saving[setting.key]}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    setting.enabled ? 'bg-black' : 'bg-gray-300'
                                                } ${saving[setting.key] ? 'opacity-50' : ''}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        setting.enabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                            
                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDeleteCharge(setting.key)}
                                                disabled={deleting[setting.key]}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {deleting[setting.key] ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Number input */}
                                    <div className={`mt-3 ml-14 flex items-center gap-3 ${!setting.enabled ? 'opacity-50' : ''}`}>
                                        <span className="text-sm text-gray-600">Amount:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                value={setting.number_value ?? 0}
                                                onChange={(e) => {
                                                    setSettings(prev => prev.map(s =>
                                                        s.key === setting.key ? { ...s, number_value: e.target.value } : s
                                                    ));
                                                }}
                                                onBlur={(e) => handleNumberChange(setting.key, e.target.value)}
                                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black"
                                                disabled={saving[`${setting.key}_number`] || !setting.enabled}
                                            />
                                        </div>
                                        {saving[`${setting.key}_number`] && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                        )}
                                        {success[`${setting.key}_number`] && (
                                            <Check className="w-4 h-4 text-green-500" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                
            </div>
        </AdminLayout>
    );
};

export default SettingsPage;

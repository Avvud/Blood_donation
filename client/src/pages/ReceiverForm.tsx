import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, AlertCircle, Droplet } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ReceiverForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const requestData = {
            receiver_name: formData.get('receiver_name') as string,
            receiver_phone: formData.get('receiver_phone') as string,
            blood_group_required: formData.get('blood_group') as string,
            location: formData.get('location') as string,
            status: 'open',
        };

        try {
            // 1. Insert Request
            const { data: request, error: insertError } = await supabase
                .from('requests')
                .insert([requestData])
                .select()
                .single();

            if (insertError) throw insertError;

            // 2. Trigger Edge Function for Matching
            // We don't await this as we want the user to see the success page immediately,
            // but the requirement says "On submit: ... Trigger backend logic".
            // We'll call it and log result.
            const { error: funcError } = await supabase.functions.invoke('notify-donors', {
                body: { record: request },
            });

            if (funcError) console.error('Notification trigger failed:', funcError);

            // 3. Navigate to public link
            navigate(`/request/${request.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to submit request.');
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <Droplet className="w-8 h-8 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">Request Blood</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receiver/Patient Name</label>
                    <input
                        required
                        name="receiver_name"
                        type="text"
                        placeholder="Jane Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                        required
                        name="receiver_phone"
                        type="tel"
                        placeholder="+1234567890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Blood Group</label>
                    <select
                        required
                        name="blood_group"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    >
                        <option value="">Select Group</option>
                        {BLOOD_GROUPS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Location</label>
                    <input
                        required
                        name="location"
                        type="text"
                        placeholder="e.g. St. Jude Hospital"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400 mt-4 shadow-lg shadow-red-200"
                >
                    {loading ? 'Submitting Request...' : 'Send Emergency Alert'}
                </button>
            </form>
        </div>
    );
}

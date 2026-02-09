import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            phone_number: formData.get('phone_number') as string,
            blood_group: formData.get('blood_group') as string,
            city: formData.get('city') as string,
            is_active: true,
        };

        try {
            const { error: insertError } = await supabase.from('donors').insert([data]);
            if (insertError) throw insertError;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl mt-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You, Hero!</h2>
                <p className="text-gray-600 mb-6">Your donor registration is complete. We will notify you when someone nearby needs your blood group.</p>
                <Link to="/" className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    Go Home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">Become a Donor</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        required
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input
                        required
                        name="phone_number"
                        type="tel"
                        placeholder="+1234567890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                        required
                        name="city"
                        type="text"
                        placeholder="e.g. New York"
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
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400 mt-4"
                >
                    {loading ? 'Submitting...' : 'Register as Donor'}
                </button>
            </form>
        </div>
    );
}

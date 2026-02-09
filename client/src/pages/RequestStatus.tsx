import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Share2, Lock, Unlock, Clock, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';

export default function RequestStatus() {
    const { id } = useParams<{ id: string }>();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRequest();
    }, [id]);

    async function fetchRequest() {
        try {
            const { data, error: fetchError } = await supabase
                .from('requests')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            setRequest(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleClose() {
        if (!window.confirm('Are you sure the blood has been received? This will notify donors that the request is fulfilled.')) return;

        setClosing(true);
        try {
            const { error: closeError } = await supabase.functions.invoke('close-request', {
                body: { request_id: id },
            });

            if (closeError) throw closeError;

            // Refresh local state
            await fetchRequest();
        } catch (err: any) {
            alert('Failed to close request: ' + err.message);
        } finally {
            setClosing(false);
        }
    }

    const shareLink = window.location.href;

    if (loading) return <div className="text-center py-20 text-gray-500">Loading request details...</div>;
    if (error || !request) return <div className="text-center py-20 text-red-500">Request not found or error occurred.</div>;

    const isOpen = request.status === 'open';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className={`p-6 rounded-2xl shadow-lg border ${isOpen ? 'bg-white border-red-100' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                            style={{ backgroundColor: isOpen ? '#fee2e2' : '#f3f4f6', color: isOpen ? '#dc2626' : '#4b5563' }}>
                            {isOpen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {request.status}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">{request.blood_group_required} Blood Required</h2>
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(shareLink);
                            alert('Link copied to clipboard!');
                        }}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Copy Public Link"
                    >
                        <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3 text-gray-600">
                        <User className="w-5 h-5 text-gray-400" />
                        <span>{request.receiver_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span>{request.receiver_phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span>{request.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                {isOpen ? (
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500 italic text-center">
                            Matched donors are being notified via WhatsApp.
                        </p>
                        <button
                            onClick={handleClose}
                            disabled={closing}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                        >
                            {closing ? 'Processing...' : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Mark as Blood Received (Close Request)
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-green-900">Request Closed</h3>
                        <p className="text-green-700">The blood has been received. Thank you to everyone who helped!</p>
                        {request.closed_at && (
                            <p className="text-xs text-green-600 mt-2">Closed on: {new Date(request.closed_at).toLocaleString()}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="text-center">
                <Link to="/" className="text-red-600 font-medium hover:underline flex items-center justify-center gap-1">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

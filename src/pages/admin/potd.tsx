import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { toast, Toaster } from 'sonner';

export default function AdminPOTD() {
    const [date, setDate] = useState('');
    const [problemId, setProblemId] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser && currentUser.email) {
                try {
                    // Check if their document in the 'users' collection has isAdmin set to true
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists() && userDocSnap.data().isAdmin === true) {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (error) {
                    console.error("Error checking admin status:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !problemId) {
            toast.error('Please fill in both fields');
            return;
        }
        setLoading(true);
        try {
            const docRef = doc(db, 'potd_schedule', date);
            await setDoc(docRef, {
                problemId: problemId,
                scheduledAt: new Date().toISOString()
            }, { merge: true });
            toast.success('POTD scheduled successfully!');
            setDate('');
            setProblemId('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to schedule POTD');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Checking permissions...</div>;

    // Check if user is logged in and is an admin in Firestore
    if (!user || !isAdmin) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#b91c1c' }}>
                <Toaster position="top-center" richColors />
                <h2>Unauthorized Access</h2>
                <p>You do not have permission to view the Admin POTD schedule.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '4rem auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Toaster position="top-center" richColors />

            <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>⚙️ Admin: Schedule POTD</h2>

            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Manually override the Problem of the Day for a specific date.
                If no problem is scheduled, the system will fall back to a random problem.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Select Date (YYYY-MM-DD)</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ padding: '0.75rem', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Problem ID</label>
                    <input
                        type="text"
                        value={problemId}
                        onChange={(e) => setProblemId(e.target.value)}
                        placeholder="e.g. 1A, 256C"
                        style={{ padding: '0.75rem', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0.75rem',
                        background: loading ? '#94a3b8' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        marginTop: '0.5rem',
                        transition: 'background 0.2s'
                    }}
                >
                    {loading ? 'Saving...' : 'Set Scheduled POTD'}
                </button>
            </form>


        </div>
    );
}

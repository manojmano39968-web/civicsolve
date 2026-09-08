import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ROLES = [
    {
        role: 'citizen',
        name: 'Kavitha Rajan',
        userId: 1,
        title: 'Citizen / Community Volunteer',
        desc: 'Report civic issues, monitor solution progress, and track neighborhood impact.',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
        role: 'student',
        name: 'Arjun Kumar',
        userId: 2,
        title: 'Civil Engineering Student',
        desc: 'Offer technical skills (GIS, Drainage Design), join civic teams, and gain hands-on experience.',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
        role: 'expert',
        name: 'Dr. Meena Raman',
        userId: 3,
        title: 'Hydrology Expert (Anna University)',
        desc: 'Provide domain guidance, validate engineering designs, and review pilot solutions.',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
        role: 'industry',
        name: 'Ravi Infrastructure',
        userId: 4,
        title: 'Industry / Implementation Partner',
        desc: 'Offer machinery, civil contracting capabilities, and pilot implementation support.',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
        role: 'admin',
        name: 'CivicSolve Admin',
        userId: 7,
        title: 'Platform Administrator',
        desc: 'Oversee challenge pipelines, monitor team progress, inspect AI matching, and reset demo.',
        badgeColor: 'bg-slate-800 text-white border-slate-700'
    }
];

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('civicsolve_user');
        if (saved) {
            try { return JSON.parse(saved); } catch (_) {}
        }
        // Default to Citizen
        return {
            id: 1,
            name: 'Kavitha Rajan',
            role: 'citizen',
            email: 'citizen@civicsolve.local',
            location: 'Chennai',
            institution: 'Velachery Residents Welfare Association'
        };
    });

    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('civicsolve_user', JSON.stringify(currentUser));
        }
    }, [currentUser]);

    const switchRole = async (roleName, userId) => {
        try {
            const data = await api.demoLogin(roleName, userId);
            setCurrentUser(data.user);
            return data.user;
        } catch (err) {
            console.error('Role switch error:', err);
            // Fallback to local profile config
            const found = DEMO_ROLES.find(r => r.role === roleName || r.userId === userId) || DEMO_ROLES[0];
            const fallbackUser = {
                id: found.userId,
                name: found.name,
                role: found.role,
                location: 'Chennai',
                institution: found.title
            };
            setCurrentUser(fallbackUser);
            return fallbackUser;
        }
    };

    const resetDemo = async () => {
        setIsResetting(true);
        try {
            await api.resetDemo();
            // Switch back to citizen default
            await switchRole('citizen', 1);
            return true;
        } catch (err) {
            console.error('Failed to reset demo:', err);
            throw err;
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, switchRole, resetDemo, isResetting, DEMO_ROLES }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

function getApiBase() {
    let raw = import.meta.env.VITE_API_BASE_URL;
    if (!raw || raw.trim() === '') return '/api';
    
    raw = raw.trim();
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
        raw = `https://${raw}`;
    }
    raw = raw.replace(/\/+$/, '');
    if (!raw.endsWith('/api')) {
        raw = `${raw}/api`;
    }
    return raw;
}

const API_BASE = getApiBase();

async function request(url, options = {}) {
    // Ensure url starts with a slash
    const path = url.startsWith('/') ? url : `/${url}`;
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    if (!res.ok) {
        let errMessage = 'An API error occurred.';
        try {
            const errData = await res.json();
            errMessage = errData.error || errData.message || errMessage;
        } catch (_) {}
        throw new Error(errMessage);
    }

    return res.json();
}

export const api = {
    // Auth & Demo Mode
    demoLogin: (role, userId) => request('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role, userId })
    }),
    getCurrentUser: (userId) => request(`/auth/me?userId=${userId || 1}`),

    // Challenges
    getChallenges: (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return request(`/challenges${q ? '?' + q : ''}`);
    },
    getChallengeById: (id) => request(`/challenges/${id}`),
    createChallenge: (data) => request('/challenges', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    analyzeChallenge: (id) => request(`/challenges/${id}/analyze`, {
        method: 'POST'
    }),
    getChallengeMatches: (id) => request(`/challenges/${id}/matches`),

    // Teams
    createTeam: (data) => request('/teams', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getTeamById: (id) => request(`/teams/${id}`),
    addTeamMember: (teamId, data) => request(`/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    addComment: (teamId, data) => request(`/teams/${teamId}/comments`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Tasks
    getTasks: (teamId) => request(`/teams/${teamId}/tasks`),
    createTask: (teamId, data) => request(`/teams/${teamId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    patchTask: (taskId, data) => request(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    }),

    // Progress
    getProgress: (challengeId) => request(`/challenges/${challengeId}/progress`),
    createProgressUpdate: (challengeId, data) => request(`/challenges/${challengeId}/progress`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Impact
    getImpact: (challengeId) => request(`/challenges/${challengeId}/impact`),
    saveImpactMetric: (challengeId, data) => request(`/challenges/${challengeId}/impact`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Users & Reverse Matching
    getUsers: (role) => request(`/users${role ? '?role=' + role : ''}`),
    getUserProfile: (id) => request(`/users/${id}`),
    getUserRecommendations: (id) => request(`/users/${id}/recommendations`),

    // Dashboard Summary
    getDashboardSummary: () => request('/dashboard/summary'),

    // Demo State Reset
    resetDemo: () => request('/demo/reset', { method: 'POST' })
};

const responseModifier = (data) => {
    return {
        _id: data._id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        plan: data.plan || 'member',
        isActive: data.isActive,
        role: data.role || (data.orgId ? 'user' : 'admin'), // Better heuristic: if it has orgId, it's a sub-user
        onboardingStatus: data.onboardingStatus,
        isServicePaused: data.isServicePaused,
        notificationPreferences: data.notificationPreferences,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    }
}

module.exports = responseModifier;
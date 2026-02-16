'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type AppConfig = {
    appName: string;
    appLogo: string;
    companyName: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
};

// Default value
const defaultConfig: AppConfig = {
    appName: 'Bimbel Pro',
    appLogo: '/images/logo.png',
    companyName: 'PT Bimbel Pro',
    address: '',
    contactEmail: '',
    contactPhone: ''
};

const AppConfigContext = createContext<AppConfig>(defaultConfig);

export default function AppConfigProvider({
    children,
    initialConfig
}: {
    children: React.ReactNode;
    initialConfig?: AppConfig
}) {
    // We can use state to allow updating config without reload if needed,
    // but typically config changes are rare.
    // However, if Admin Settings page updates it, we might want to refresh?
    // For now, static initialConfig is fine.

    return (
        <AppConfigContext.Provider value={initialConfig || defaultConfig}>
            {children}
        </AppConfigContext.Provider>
    );
}

export function useAppConfig() {
    return useContext(AppConfigContext);
}

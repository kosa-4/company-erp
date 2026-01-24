import { api } from './client';

export interface DashboardStats {
    prCount: number;
    activeRfqCount: number;
    poCompletedCount: number;
    grWaitingCount: number;
    pendingProcessCount: number;
    pendingApprovalCount: number;
    prChange?: string;
    rfqChange?: string;
    poChange?: string;
    grChange?: string;
}

export interface VendorDashboardStats {
    waitingRfqCount: number;
    submittedRfqCount: number;
    receivedPoCount: number;
    selectedRfqCount: number;
    pendingActionCount: number;
    infoNoticeCount: number;
    rfqChange?: string;
    poChange?: string;
}

export interface RecentActivity {
    type: 'request' | 'rfq' | 'order' | 'receiving';
    title: string;
    description: string;
    time: string;
    regDate: string;
}

export interface DashboardData {
    stats: DashboardStats;
    activities: RecentActivity[];
}

export interface VendorDashboardData {
    stats: VendorDashboardStats;
    activities: RecentActivity[];
}

export const dashboardApi = {
    getBuyerData: (): Promise<DashboardData> =>
        api.get<DashboardData>('/v1/dashboard/buyer/total-data'),

    getVendorData: (): Promise<VendorDashboardData> =>
        api.get<VendorDashboardData>('/v1/dashboard/vendor/total-data'),
};

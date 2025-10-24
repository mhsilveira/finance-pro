'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { fetchDashboardStats } from '@/store/dashboard/dashboardSlice';
import { 
  selectCurrentMonthStats, 
  selectChanges, 
  selectTotalTransactions,
  selectDashboardLoading,
  selectDashboardError 
} from '@/store/dashboard/selectors';

export function useDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  
  const currentMonth = useSelector(selectCurrentMonthStats);
  const changes = useSelector(selectChanges);
  const totalTransactions = useSelector(selectTotalTransactions);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  return {
    currentMonth,
    changes,
    totalTransactions,
    loading,
    error,
    refetch: () => dispatch(fetchDashboardStats()),
  };
}

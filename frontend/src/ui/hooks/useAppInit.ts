'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { fetchTransactions } from '@/store/transactions/transactions';

export function useAppInit() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);
}
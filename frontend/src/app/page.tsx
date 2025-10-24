'use client';
import React from 'react';
import { useAppInit } from '@/ui/hooks/useAppInit';
import Dashboard from '@/ui/Dashboard';

export default function Page() {
  useAppInit(); // carrega dados ao montar
  return <Dashboard />;
}
"use client";
import React from "react";
import Dashboard from "@/ui/Dashboard";
import { useAppInit } from "@/ui/hooks/useAppInit";

export default function Page() {
    useAppInit(); // carrega dados ao montar
    return <Dashboard />;
}

"use client";
import React from "react";
import { useSelector } from "react-redux";
import { selectFiltered } from "@/store/transactions/selectors";
import { Card, H1, Stack, Text } from "@/ui/design/atoms";
import AddTransactionForm from "@/ui/forms/AddTransactionForm";
import { useAppInit } from "@/ui/hooks/useAppInit";
import TransactionList from "@/ui/TransactionList";

export default function TransactionsPage() {
    useAppInit();
    const items = useSelector(selectFiltered);
    return (
        <div className="container">
            <Stack direction="row" justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <H1>Transações</H1>
                <Text muted>Lista e CRUD</Text>
            </Stack>
            <Card>
                <AddTransactionForm />
            </Card>
            <Card style={{ marginTop: 16 }}>
                <TransactionList items={items} />
            </Card>
        </div>
    );
}

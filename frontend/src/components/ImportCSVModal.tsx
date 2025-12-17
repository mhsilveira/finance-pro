"use client";

import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, FileText } from "lucide-react";
import { Button } from "./ui/button";

export type CSVSource =
	| "NUBANK_CHECKING"
	| "NUBANK_CREDIT"
	| "ITAU_CHECKING"
	| "ITAU_CREDIT";

interface ImportCSVModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (file: File, source: CSVSource) => void;
	isImporting: boolean;
}

export function ImportCSVModal({ isOpen, onClose, onImport, isImporting }: ImportCSVModalProps) {
	const [selectedBank, setSelectedBank] = useState<"Nubank" | "Itaú">("Nubank");
	const [accountType, setAccountType] = useState<"CHECKING" | "CREDIT">("CREDIT");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const handleImport = () => {
		if (!selectedFile) {
			alert("Por favor, selecione um arquivo CSV");
			return;
		}

		// Build source identifier from bank and account type
		const source: CSVSource = `${selectedBank.toUpperCase().replace("Ú", "U")}_${accountType}` as CSVSource;
		onImport(selectedFile, source);
	};

	const handleClose = () => {
		if (!isImporting) {
			setSelectedFile(null);
			setSelectedBank("Nubank");
			setAccountType("CREDIT");
			onClose();
		}
	};

	return (
		<Dialog.Root open={isOpen} onOpenChange={handleClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md z-50 shadow-2xl">
					<Dialog.Title className="text-2xl font-bold text-gray-100 mb-4">Importar Extrato</Dialog.Title>

					<Dialog.Close
						className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
						disabled={isImporting}
					>
						<X size={24} />
					</Dialog.Close>

					<div className="space-y-5">
						{/* Bank Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">Banco</label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => setSelectedBank("Nubank")}
									disabled={isImporting}
									className={`p-3 rounded-lg border-2 transition-all ${
										selectedBank === "Nubank"
											? "border-purple-500 bg-purple-500/10 text-purple-400"
											: "border-slate-700 bg-slate-800 text-gray-400 hover:border-slate-600"
									} ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
								>
									<div className="text-sm font-medium">Nubank</div>
								</button>
								<button
									type="button"
									onClick={() => setSelectedBank("Itaú")}
									disabled={isImporting}
									className={`p-3 rounded-lg border-2 transition-all ${
										selectedBank === "Itaú"
											? "border-purple-500 bg-purple-500/10 text-purple-400"
											: "border-slate-700 bg-slate-800 text-gray-400 hover:border-slate-600"
									} ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
								>
									<div className="text-sm font-medium">Itaú</div>
								</button>
							</div>
						</div>

						{/* Account Type Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Conta</label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => setAccountType("CHECKING")}
									disabled={isImporting}
									className={`p-3 rounded-lg border-2 transition-all ${
										accountType === "CHECKING"
											? "border-blue-500 bg-blue-500/10 text-blue-400"
											: "border-slate-700 bg-slate-800 text-gray-400 hover:border-slate-600"
									} ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
								>
									<div className="text-sm font-medium">Conta Corrente</div>
									<div className="text-xs text-gray-500 mt-1">(Extrato)</div>
								</button>
								<button
									type="button"
									onClick={() => setAccountType("CREDIT")}
									disabled={isImporting}
									className={`p-3 rounded-lg border-2 transition-all ${
										accountType === "CREDIT"
											? "border-blue-500 bg-blue-500/10 text-blue-400"
											: "border-slate-700 bg-slate-800 text-gray-400 hover:border-slate-600"
									} ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
								>
									<div className="text-sm font-medium">Cartão de Crédito</div>
									<div className="text-xs text-gray-500 mt-1">(Fatura)</div>
								</button>
							</div>
						</div>

						{/* File Upload */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">Arquivo CSV</label>
							<div className="space-y-3">
								<input
									ref={fileInputRef}
									type="file"
									accept=".csv"
									onChange={handleFileSelect}
									disabled={isImporting}
									className="hidden"
								/>
								<Button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									disabled={isImporting}
									variant="outline"
									className="w-full"
								>
									<Upload size={18} />
									<span>Selecionar Arquivo</span>
								</Button>
								{selectedFile && (
									<div className="flex items-center gap-2 p-3 bg-slate-800 border border-slate-700 rounded-lg">
										<FileText size={18} className="text-blue-400" />
										<span className="text-sm text-gray-300 truncate">{selectedFile.name}</span>
									</div>
								)}
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-2">
							<Button type="button" onClick={handleClose} disabled={isImporting} variant="outline" className="flex-1">
								<span>Cancelar</span>
							</Button>
							<Button type="button" onClick={handleImport} disabled={isImporting || !selectedFile} className="flex-1">
								{isImporting ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
										<span>Importando...</span>
									</>
								) : (
									<>
										<Upload size={18} />
										<span>Importar</span>
									</>
								)}
							</Button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

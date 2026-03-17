"use client";

import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, FileText } from "lucide-react";
import { Button } from "./ui/button";

export type CSVSource = "NUBANK_CREDIT" | "ITAU_CREDIT";

interface ImportCSVModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (file: File, source: CSVSource) => void;
	isImporting: boolean;
}

export function ImportCSVModal({ isOpen, onClose, onImport, isImporting }: ImportCSVModalProps) {
	const [selectedBank, setSelectedBank] = useState<"Nubank" | "Itaú">("Nubank");
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

		const source: CSVSource = `${selectedBank.toUpperCase().replace("Ú", "U")}_CREDIT` as CSVSource;
		onImport(selectedFile, source);
	};

	const handleClose = () => {
		if (!isImporting) {
			setSelectedFile(null);
			setSelectedBank("Nubank");
			onClose();
		}
	};

	return (
		<Dialog.Root open={isOpen} onOpenChange={handleClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 glass-elevated rounded-[20px] shadow-[0_24px_48px_rgba(0,0,0,0.5)] p-6 w-full max-w-md z-50">
					<Dialog.Title className="text-xl font-semibold text-[var(--text-primary)] mb-4">Importar Fatura</Dialog.Title>

					<Dialog.Close
						className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
						disabled={isImporting}
					>
						<X size={24} />
					</Dialog.Close>

					<div className="space-y-5">
						<div>
							<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Banco</label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => setSelectedBank("Nubank")}
									disabled={isImporting}
									className={`p-3 rounded-lg border-2 transition-all ${
										selectedBank === "Nubank"
											? "border-purple-500 bg-purple-500/10 text-purple-400"
											: "border-[var(--border-glass)] bg-white/5 text-[var(--text-secondary)] hover:border-[var(--border-glass-hover)]"
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
											: "border-[var(--border-glass)] bg-white/5 text-[var(--text-secondary)] hover:border-[var(--border-glass-hover)]"
									} ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
								>
									<div className="text-sm font-medium">Itaú</div>
								</button>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Arquivo CSV</label>
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
									<div className="flex items-center gap-2 p-3 bg-white/5 border border-[var(--border-glass)] rounded-xl">
										<FileText size={18} className="text-purple-400" />
										<span className="text-sm text-[var(--text-secondary)] truncate">{selectedFile.name}</span>
									</div>
								)}
							</div>
						</div>

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

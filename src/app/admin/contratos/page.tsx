"use client";

import { useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { FileText, Download, Printer, Building2, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { sileo } from "sileo";
import jsPDF from "jspdf";

export default function ContractGeneratorPage() {
    const templates = useQuery(api.contracts.getContractTemplateTypes);
    const clients = useQuery(api.clients.getClients);
    const allOpportunities = useQuery(api.opportunities.getOpportunities, {});

    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedClientId, setSelectedClientId] = useState("");
    const [selectedOppId, setSelectedOppId] = useState("");

    // Custom fields
    const [duration, setDuration] = useState("30");
    const [city, setCity] = useState("Lima");
    const [warrantyMonths, setWarrantyMonths] = useState("12");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [billingCycle, setBillingCycle] = useState("mensual");
    const [paymentSchedule, setPaymentSchedule] = useState("50% de adelanto a la firma del contrato y 50% contra entrega final.");
    const [monthlyAmount, setMonthlyAmount] = useState("");

    const contractRef = useRef<HTMLDivElement>(null);

    // Filter opportunities by selected client
    const clientOpportunities = allOpportunities?.filter(
        o => o.clientId === selectedClientId && o.status === "won"
    ) || [];

    const contract = useQuery(
        api.contracts.generateContract,
        selectedTemplate && selectedClientId
            ? {
                templateKey: selectedTemplate,
                clientId: selectedClientId as Id<"clients">,
                opportunityId: selectedOppId ? (selectedOppId as Id<"opportunities">) : undefined,
                customFields: {
                    duration,
                    city,
                    warrantyMonths,
                    deliveryAddress,
                    billingCycle,
                    paymentSchedule,
                    monthlyAmount,
                },
            }
            : "skip"
    );

    const handleExportPDF = async () => {
        if (!contract) return;
        try {
            sileo.info({ title: "Generando PDF..." });
            const pdf = new jsPDF("p", "mm", "a4");
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const marginX = 20;
            const contentW = pageW - marginX * 2;
            let y = 0;

            const ensureSpace = (needed: number) => {
                if (y + needed > pageH - 20) {
                    pdf.addPage();
                    y = 20;
                }
            };

            // ===== HEADER =====
            pdf.setFillColor(24, 24, 27); // zinc-900
            pdf.rect(0, 0, pageW, 28, "F");
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(161, 161, 170); // zinc-400
            pdf.text("BYTEK S.A.C.S.", marginX, 12);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text(contract.title, marginX, 21);
            // Badge — dorado con borde y sombra
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(6.5);
            const badgeText = selectedTemplate.replace("-", " · ").toUpperCase();
            const badgeTxtW = pdf.getTextWidth(badgeText);
            const badgePadX = 5;
            const badgeRectW = badgeTxtW + badgePadX * 2;
            const badgeRectH = 7;
            const badgeRectX = pageW - marginX - badgeRectW;
            const badgeRectY = 16;
            // Sombra sutil (rect offset)
            pdf.setFillColor(0, 0, 0);
            pdf.roundedRect(badgeRectX + 0.5, badgeRectY + 0.5, badgeRectW, badgeRectH, 2, 2, "F");
            // Borde dorado sin relleno
            pdf.setDrawColor(212, 175, 55); // gold
            pdf.setLineWidth(0.5);
            pdf.roundedRect(badgeRectX, badgeRectY, badgeRectW, badgeRectH, 2, 2, "S");
            // Texto dorado centrado
            pdf.setTextColor(212, 175, 55);
            pdf.text(badgeText, badgeRectX + badgePadX, badgeRectY + badgeRectH / 2 + 1.2);
            y = 38;

            // ===== PREÁMBULO =====
            pdf.setFont("times", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(55, 65, 81); // zinc-700
            const preamble = `Conste por el presente documento, el contrato que celebran de una parte BYTEK S.A.C.S., con RUC N° 20XXXXXXXXX, con domicilio en Lima, Perú, debidamente representada por su Gerente General, en adelante "EL PROVEEDOR"; y de la otra parte ${contract.client.name}, con RUC N° ${contract.client.taxId}, representada por ${contract.client.contact}, en adelante "EL CLIENTE"; en los términos y condiciones siguientes:`;
            const preambleLines = pdf.splitTextToSize(preamble, contentW);
            const preambleH = preambleLines.length * 5 + 10;
            ensureSpace(preambleH);
            pdf.text(preambleLines, marginX, y);
            y += preambleH;

            // ===== Línea separadora =====
            pdf.setDrawColor(228, 228, 231);
            pdf.line(marginX, y, pageW - marginX, y);
            y += 8;

            // ===== SECCIONES (COMO BLOQUES) =====
            for (const section of contract.sections) {
                // Medir cuánto ocupa esta sección completa
                pdf.setFont("times", "bold");
                pdf.setFontSize(10);
                const headingLines = pdf.splitTextToSize(section.heading, contentW);
                const headingH = headingLines.length * 5;

                pdf.setFont("times", "normal");
                pdf.setFontSize(10);
                const bodyLines = pdf.splitTextToSize(section.body, contentW);
                const bodyH = bodyLines.length * 4.5;

                const totalBlockH = headingH + bodyH + 12; // +12 para espaciado

                // SI NO CABE → nueva página
                ensureSpace(totalBlockH);

                // Renderizar heading
                pdf.setFont("times", "bold");
                pdf.setFontSize(10);
                pdf.setTextColor(24, 24, 27); // zinc-900
                pdf.text(headingLines, marginX, y);
                y += headingH + 3;

                // Renderizar body
                pdf.setFont("times", "normal");
                pdf.setFontSize(10);
                pdf.setTextColor(55, 65, 81);
                pdf.text(bodyLines, marginX, y);
                y += bodyH + 9;
            }

            // ===== FIRMAS =====
            const sigBlockH = 55;
            ensureSpace(sigBlockH);

            // Línea separadora antes de firmas
            pdf.setDrawColor(228, 228, 231);
            pdf.line(marginX, y, pageW - marginX, y);
            y += 8;

            pdf.setFont("times", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(75, 85, 99);
            const sigText = `En señal de conformidad, las partes suscriben el presente contrato en dos (2) ejemplares de igual tenor y valor, en la ciudad de ${city}, a los ${new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}.`;
            const sigLines = pdf.splitTextToSize(sigText, contentW);
            pdf.text(sigLines, marginX, y);
            y += sigLines.length * 4.5 + 20;

            // Líneas de firma
            const col1X = marginX + 10;
            const col2X = pageW / 2 + 10;
            const lineW = 55;

            pdf.setDrawColor(100, 100, 100);
            pdf.line(col1X, y, col1X + lineW, y);
            pdf.line(col2X, y, col2X + lineW, y);
            y += 4;

            pdf.setFont("times", "bold");
            pdf.setFontSize(9);
            pdf.setTextColor(24, 24, 27);
            pdf.text("BYTEK S.A.C.S.", col1X + lineW / 2, y, { align: "center" });
            pdf.text(contract.client.name, col2X + lineW / 2, y, { align: "center" });
            y += 4;

            pdf.setFont("times", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text("EL PROVEEDOR", col1X + lineW / 2, y, { align: "center" });
            pdf.text("EL CLIENTE", col2X + lineW / 2, y, { align: "center" });
            y += 4;
            pdf.text("RUC: 20XXXXXXXXX", col1X + lineW / 2, y, { align: "center" });
            pdf.text(`RUC: ${contract.client.taxId}`, col2X + lineW / 2, y, { align: "center" });

            pdf.save(`contrato-${contract.client.name.replace(/\s/g, '_')}-${Date.now()}.pdf`);
            sileo.success({ title: "PDF descargado correctamente." });
        } catch (e) {
            console.error(e);
            sileo.error({ title: "Error al generar PDF." });
        }
    };

    const templateLabels: Record<string, string> = {
        "digital-service": "🌐 Digital — Servicio Puntual",
        "digital-subscription": "🔄 Digital — Suscripción/SaaS",
        "solutions-service": "💻 Soluciones — Desarrollo Software",
        "infra-service": "🏗️ Infraestructura — Instalación",
        "infra-hardware": "📦 Infraestructura — Compraventa Hardware",
    };

    const isSubscription = selectedTemplate.includes("subscription");

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
                        <FileSignature className="w-8 h-8 text-indigo-600" /> Generador de Contratos
                    </h1>
                    <p className="text-zinc-500 mt-1">Genera contratos legales adaptados al tipo de servicio, cliente y oportunidad.</p>
                </div>
                {contract && (
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => window.print()} className="gap-2">
                            <Printer className="w-4 h-4" /> Imprimir
                        </Button>
                        <Button onClick={handleExportPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <Download className="w-4 h-4" /> Descargar PDF
                        </Button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* CONFIGURADOR */}
                <div className="col-span-4 space-y-5">
                    <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
                        <h3 className="font-bold text-sm text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-4 h-4 text-zinc-400" /> Configuración del Contrato
                        </h3>

                        <div className="space-y-2">
                            <Label className="text-xs">Tipo de Contrato</Label>
                            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar plantilla..." /></SelectTrigger>
                                <SelectContent>
                                    {templates?.map(t => (
                                        <SelectItem key={t.key} value={t.key}>
                                            {templateLabels[t.key] || t.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Cliente</Label>
                            <Select value={selectedClientId} onValueChange={v => { setSelectedClientId(v); setSelectedOppId(""); }}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
                                <SelectContent>
                                    {clients?.map(c => (
                                        <SelectItem key={c._id} value={c._id}>
                                            <span className="flex items-center gap-2"><Building2 className="w-3 h-3 text-zinc-400" /> {c.companyName}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {clientOpportunities.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs">Oportunidad Ganada (opcional)</Label>
                                <Select value={selectedOppId} onValueChange={setSelectedOppId}>
                                    <SelectTrigger><SelectValue placeholder="Vincular oportunidad..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin vincular</SelectItem>
                                        {clientOpportunities.map(o => (
                                            <SelectItem key={o._id} value={o._id}>
                                                {o.packageId} — S/ {o.estimatedValue.toLocaleString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {selectedTemplate && (
                        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
                            <h3 className="font-bold text-sm text-zinc-700 uppercase tracking-wider">Campos Personalizables</h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><Label className="text-[10px] uppercase">Plazo (días)</Label><Input value={duration} onChange={e => setDuration(e.target.value)} className="h-8 text-sm" /></div>
                                <div className="space-y-1"><Label className="text-[10px] uppercase">Ciudad</Label><Input value={city} onChange={e => setCity(e.target.value)} className="h-8 text-sm" /></div>
                            </div>

                            {!isSubscription && (
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase">Esquema de Pagos</Label>
                                    <Input value={paymentSchedule} onChange={e => setPaymentSchedule(e.target.value)} className="h-8 text-sm" />
                                </div>
                            )}

                            {isSubscription && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1"><Label className="text-[10px] uppercase">Ciclo Facturación</Label><Input value={billingCycle} onChange={e => setBillingCycle(e.target.value)} className="h-8 text-sm" /></div>
                                    <div className="space-y-1"><Label className="text-[10px] uppercase">Monto Mensual</Label><Input value={monthlyAmount} onChange={e => setMonthlyAmount(e.target.value)} className="h-8 text-sm" /></div>
                                </div>
                            )}

                            {selectedTemplate.includes("infra") && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1"><Label className="text-[10px] uppercase">Garantía (meses)</Label><Input value={warrantyMonths} onChange={e => setWarrantyMonths(e.target.value)} className="h-8 text-sm" /></div>
                                    <div className="space-y-1"><Label className="text-[10px] uppercase">Dir. Entrega</Label><Input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="h-8 text-sm" /></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* PREVIEW A4 */}
                <div className="col-span-8">
                    {!contract ? (
                        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-16 text-center h-full flex flex-col items-center justify-center">
                            <FileSignature className="w-16 h-16 text-zinc-300 mb-6" />
                            <h3 className="text-lg font-bold text-zinc-800">Selecciona el tipo y el cliente</h3>
                            <p className="text-zinc-500 mt-1 max-w-md">El contrato se generará automáticamente con los datos del cliente, la oportunidad ganada y la plantilla legal correspondiente al tipo de servicio.</p>
                        </div>
                    ) : (
                        <div
                            ref={contractRef}
                            className="bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden"
                            style={{ fontFamily: "'Times New Roman', Times, serif" }}
                        >
                            {/* Header */}
                            <div className="bg-zinc-900 text-white px-10 py-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">BYTEK S.A.C.S.</p>
                                    <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: "Inter, sans-serif" }}>{contract.title}</h2>
                                </div>
                                <Badge className="bg-white/10 text-white border-white/20 text-[10px] uppercase">{selectedTemplate.replace("-", " · ")}</Badge>
                            </div>

                            {/* Preamble */}
                            <div className="px-10 py-8 border-b border-zinc-100">
                                <p className="text-sm text-zinc-700 leading-relaxed">
                                    Conste por el presente documento, el contrato que celebran de una parte <strong>BYTEK S.A.C.S.</strong>,
                                    con RUC N° 20XXXXXXXXX, con domicilio en Lima, Perú, debidamente representada por su Gerente General,
                                    en adelante <strong>"EL PROVEEDOR"</strong>; y de la otra parte <strong>{contract.client.name}</strong>,
                                    con RUC N° {contract.client.taxId}, representada por {contract.client.contact},
                                    en adelante <strong>"EL CLIENTE"</strong>; en los términos y condiciones siguientes:
                                </p>
                            </div>

                            {/* Sections */}
                            <div className="px-10 py-6 space-y-6">
                                {contract.sections.map((section, idx) => (
                                    <div key={idx}>
                                        <h3 className="font-bold text-sm text-zinc-900 mb-2 uppercase tracking-wide">
                                            {section.heading}
                                        </h3>
                                        <p className="text-sm text-zinc-700 leading-relaxed text-justify">
                                            {section.body}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Signatures */}
                            <div className="px-10 py-10 border-t border-zinc-200 bg-zinc-50/50">
                                <p className="text-sm text-zinc-600 mb-8">
                                    En señal de conformidad, las partes suscriben el presente contrato en dos (2) ejemplares de igual tenor y valor,
                                    en la ciudad de {city}, a los {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}.
                                </p>
                                <div className="grid grid-cols-2 gap-16 mt-8">
                                    <div className="text-center">
                                        <div className="border-t-2 border-zinc-400 pt-3 mt-16">
                                            <p className="text-sm font-bold text-zinc-900">BYTEK S.A.C.S.</p>
                                            <p className="text-xs text-zinc-500">EL PROVEEDOR</p>
                                            <p className="text-xs text-zinc-500">RUC: 20XXXXXXXXX</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="border-t-2 border-zinc-400 pt-3 mt-16">
                                            <p className="text-sm font-bold text-zinc-900">{contract.client.name}</p>
                                            <p className="text-xs text-zinc-500">EL CLIENTE</p>
                                            <p className="text-xs text-zinc-500">RUC: {contract.client.taxId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

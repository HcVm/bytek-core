"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Plus, FileText, Download, Eye, AlertCircle, Calendar } from "lucide-react";
import { sileo } from "sileo";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import jsPDF from "jspdf";
import * as htmlToImage from 'html-to-image';
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function CotizadorPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
    const pdfRef = useRef<HTMLDivElement>(null);

    const quotes = useQuery(api.quotes.getAllQuotes);
    const updateStatus = useMutation(api.quotes.updateQuoteStatus);

    const selectedQuote = quotes?.find(q => q._id === selectedQuoteId);

    const handleDownloadPDF = async () => {
        const input = pdfRef.current;
        if (!input) return;

        setIsGenerating(true);
        sileo.info({ title: "Generando PDF..." });

        try {
            const imgData = await htmlToImage.toPng(input, {
                pixelRatio: 2, // Mejor calidad
                backgroundColor: '#ffffff'
            });

            // A4 portrait
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (input.offsetHeight * pdfWidth) / input.offsetWidth;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Cotizacion_${selectedQuote?.quoteNumber || 'BYTEK'}.pdf`);

            sileo.success({ title: "PDF descargado correctamente" });

            // Auto marcamos como enviado si estaba en borrador
            if (selectedQuote && selectedQuote.status === "borrador") {
                await updateStatus({ quoteId: selectedQuote._id as any, status: "enviado" });
                sileo.success({ title: "El Estado cambió automáticamente a Enviado." });
            }
        } catch (error) {
            console.error("Error al exportar a PDF:", error);
            sileo.error({ title: "Hubo un error al generar el documento" });
        } finally {
            setIsGenerating(false);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'enviado': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
            case 'aceptado': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
            case 'rechazado': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
            default: return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400';
        }
    };

    return (
        <div className="p-8 h-full flex flex-col overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Histórico de Proformas</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Todas las cotizaciones B2B generadas desde la pantalla Kanban del Pipeline.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Panel Izquierdo: Lista de Cotizaciones */}
                <div className="xl:col-span-1 border-r border-zinc-200 dark:border-zinc-800 pr-4 space-y-4">
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        Archivo General
                    </h3>

                    {!quotes ? (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">Cargando cotizaciones...</p>
                    ) : quotes.length === 0 ? (
                        <div className="p-4 border border-dashed rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-center">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay proformas emitidas aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {quotes.map(q => (
                                <div
                                    key={q._id}
                                    className={`p-4 rounded-lg border flex flex-col gap-2 cursor-pointer transition-colors ${selectedQuoteId === q._id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                                    onClick={() => setSelectedQuoteId(q._id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{q.quoteNumber}</span>
                                        <Badge variant="secondary" className={`${getStatusBadgeColor(q.status)} capitalize text-[10px]`}>
                                            {q.status}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">{q.clientName}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(q.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm">{formatCurrency(q.total)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Panel Derecho: Visor de PDF Dinámico */}
                <div className="xl:col-span-2 space-y-6">
                    {!selectedQuote ? (
                        <Card className="flex flex-col items-center justify-center p-12 text-zinc-500 dark:text-zinc-400 h-full border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                            <Eye className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-700" />
                            <p>Selecciona una cotización del panel lateral para previsualizar el documento final.</p>
                        </Card>
                    ) : (
                        <>
                            <Card className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 sticky top-4 z-10 shadow-lg">
                                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2 text-zinc-900 dark:text-white">
                                            {selectedQuote.quoteNumber}
                                            <Badge className={`${getStatusBadgeColor(selectedQuote.status)} bg-opacity-20`}>{selectedQuote.status.toUpperCase()}</Badge>
                                        </h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cliente: {selectedQuote.clientName}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right mr-4 hidden md:block">
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Valor Neto</p>
                                            <p className="font-bold text-xl text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedQuote.total)}</p>
                                        </div>
                                        <Button
                                            onClick={handleDownloadPDF}
                                            disabled={isGenerating}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            {isGenerating ? "Renderizando..." : "Exportar y Enviar PDF"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="overflow-x-auto bg-zinc-200 dark:bg-zinc-800 p-8 flex justify-center">
                                {/* ESTE CONTENEDOR SERÁ CAPTURADO POR HTML2CANVAS */}
                                <div
                                    className="p-12 w-[800px] min-h-[1131px] shadow-sm bg-white dark:bg-zinc-900"
                                    style={{ position: 'relative' }}
                                    ref={pdfRef}
                                >
                                    {/* Cabecera Membrete */}
                                    <div className="flex justify-between items-start mb-12 border-b-2 border-zinc-900 dark:border-white pb-6">
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white">BYTEK S.A.C.S.</h2>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Soluciones Tecnológicas Integrales</p>
                                            <p className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">RUC: 20600123456 | Av. Los Negocios 123, Lima - Perú</p>
                                        </div>
                                        <div className="text-right">
                                            <h1 className="text-4xl font-bold uppercase tracking-widest text-zinc-200 dark:text-zinc-800">PROFORMA</h1>
                                            <p className="text-sm font-semibold mt-2 text-zinc-900 dark:text-zinc-200"># {selectedQuote.quoteNumber}</p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Fecha Emisión: {new Date(selectedQuote.createdAt).toLocaleDateString('es-PE')}</p>
                                        </div>
                                    </div>

                                    {/* Info Cliente */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-zinc-400 dark:text-zinc-500">Preparado Exclusivamente Para:</h3>
                                        <p className="font-bold text-xl text-zinc-800 dark:text-zinc-200">{selectedQuote.clientName}</p>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Elaborado por: Ejecutivo BYTEK</p>
                                    </div>

                                    {/* Tabla de Detail */}
                                    <table className="w-full text-left mb-8 border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                                                <th className="py-3 px-2 text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Item / Descripción</th>
                                                <th className="py-3 px-2 text-xs font-bold uppercase text-center text-zinc-500 dark:text-zinc-400">Cant.</th>
                                                <th className="py-3 px-2 text-xs font-bold uppercase text-right text-zinc-500 dark:text-zinc-400">P. Unitario</th>
                                                <th className="py-3 px-2 text-xs font-bold uppercase text-right text-zinc-500 dark:text-zinc-400">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedQuote.items.map((item: any, idx: number) => (
                                                <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50">
                                                    <td className="py-4 px-2 w-1/2">
                                                        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{item.description}</p>
                                                    </td>
                                                    <td className="py-4 px-2 text-center text-sm text-zinc-700 dark:text-zinc-400">{item.quantity}</td>
                                                    <td className="py-4 px-2 text-right text-sm text-zinc-700 dark:text-zinc-400">{formatCurrency(item.unitPrice)}</td>
                                                    <td className="py-4 px-2 text-right font-semibold text-zinc-900 dark:text-white">{formatCurrency(item.totalPrice)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Bloque Totales */}
                                    <div className="flex justify-end mt-12 mb-20">
                                        <div className="w-72 space-y-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
                                                <span>Subtotal</span>
                                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(selectedQuote.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
                                                <span>IGV (18%)</span>
                                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(selectedQuote.tax)}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-3">
                                                <span className="font-bold text-lg text-zinc-900 dark:text-white">Total a Pagar</span>
                                                <span className="font-bold text-lg text-indigo-700 dark:text-indigo-400">{formatCurrency(selectedQuote.total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Términos Extremos Abajo */}
                                    <div className="absolute bottom-12 left-12 right-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                                        <p className="font-bold mb-2 text-zinc-700 dark:text-zinc-300 uppercase tracking-widest text-[10px]">Condiciones Comerciales</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>La presente tarifa está expresada en Nuevos Soles (PEN) / Dólares Americanos según detalle y tienen una validez de 15 días calendario o hasta el <strong>{new Date(selectedQuote.validUntil).toLocaleDateString()}</strong>.</li>
                                            <li>El inicio del servicio/entrega está sujeto a la aprobación de esta proforma y confirmación del adelanto correspondiente.</li>
                                            {selectedQuote.notes && <li><strong>Nota adicional:</strong> {selectedQuote.notes}</li>}
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

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
import { Plus, FileText, Download, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CotizadorPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);

    // Solamente listamos unos datos de prueba para que la plantilla no se vea vacía
    const packages = useQuery(api.packages.getPackages) || [];
    const samplePackage = packages[0] || { name: 'Servicio Ejemplo', basePrice: 1500 };

    const handleDownloadPDF = async () => {
        const input = pdfRef.current;
        if (!input) return;

        setIsGenerating(true);
        toast.info("Generando PDF...");

        try {
            const canvas = await html2canvas(input, {
                scale: 2, // Mejor calidad
                useCORS: true,
            });

            const imgData = canvas.toDataURL("image/png");

            // A4 en landscape si fuera necesario, o portrait
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("Cotizacion_BYTEK.pdf");

            toast.success("PDF descargado correctamente");
        } catch (error) {
            console.error("Error al exportar a PDF:", error);
            toast.error("Hubo un error al generar el documento");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Motor de Cotizaciones</h1>
                    <p className="text-zinc-500 mt-2">Construye proformas rápidas y expórtalas a PDF al instante.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Panel Izquierdo: Plantilla Oculta pero renderizada para PDF */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vista Previa del Documento</CardTitle>
                            <CardDescription>Lo que ves aquí es lo que se exportará al PDF.</CardDescription>
                        </CardHeader>
                        <CardContent className="bg-zinc-100 p-8 rounded-b-xl overflow-x-auto">

                            {/* ESTE CONTENEDOR SERÁ CAPTURADO POR HTML2CANVAS */}
                            <div
                                className="p-12 min-w-[700px] min-h-[900px] shadow-sm ml-auto mr-auto border"
                                style={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', color: '#18181b' }}
                                ref={pdfRef}
                            >
                                {/* Header Minimalista */}
                                <div className="flex justify-between items-start mb-12 border-b-2 pb-6" style={{ borderColor: '#18181b' }}>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: '#18181b' }}>BYTEK S.A.C.S.</h2>
                                        <p className="text-sm" style={{ color: '#71717a' }}>Soluciones Tecnológicas Integrales</p>
                                        <p className="text-xs mt-1" style={{ color: '#a1a1aa' }}>Av. Ejemplo 123, Lima - Perú</p>
                                    </div>
                                    <div className="text-right">
                                        <h1 className="text-4xl font-bold uppercase tracking-widest" style={{ color: '#e4e4e7' }}>PROFORMA</h1>
                                        <p className="text-sm font-semibold mt-2" style={{ color: '#18181b' }}># COT-2024-001</p>
                                        <p className="text-xs" style={{ color: '#71717a' }}>Fecha: {new Date().toLocaleDateString('es-PE')}</p>
                                    </div>
                                </div>

                                {/* Info Cliente */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: '#a1a1aa' }}>Para:</h3>
                                    <p className="font-semibold text-lg" style={{ color: '#27272a' }}>Cliente de Prueba S.A.</p>
                                    <p className="text-sm" style={{ color: '#52525b' }}>RUC: 20123456789</p>
                                    <p className="text-sm" style={{ color: '#52525b' }}>Contacto: Juan Pérez</p>
                                </div>

                                {/* Tabla de Servicios */}
                                <table className="w-full text-left mb-8 border-collapse">
                                    <thead>
                                        <tr className="border-b-2" style={{ borderColor: '#e4e4e7' }}>
                                            <th className="py-3 px-2 text-sm font-bold uppercase" style={{ color: '#52525b' }}>Descripción del Servicio</th>
                                            <th className="py-3 px-2 text-sm font-bold uppercase text-right" style={{ color: '#52525b' }}>Precio Unitario</th>
                                            <th className="py-3 px-2 text-sm font-bold uppercase text-right" style={{ color: '#52525b' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b" style={{ borderColor: '#f4f4f5' }}>
                                            <td className="py-4 px-2">
                                                <p className="font-medium" style={{ color: '#18181b' }}>{samplePackage.name}</p>
                                                <p className="text-xs mt-1" style={{ color: '#71717a' }}>Implementación completa según catálogo base.</p>
                                            </td>
                                            <td className="py-4 px-2 text-right" style={{ color: '#3f3f46' }}>S/ {samplePackage.basePrice.toFixed(2)}</td>
                                            <td className="py-4 px-2 text-right font-medium" style={{ color: '#18181b' }}>S/ {samplePackage.basePrice.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Totales */}
                                <div className="flex justify-end mt-12">
                                    <div className="w-64 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span style={{ color: '#71717a' }}>Subtotal</span>
                                            <span className="font-medium">S/ {samplePackage.basePrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span style={{ color: '#71717a' }}>IGV (18%)</span>
                                            <span className="font-medium">S/ {(samplePackage.basePrice * 0.18).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t-2 pt-3" style={{ borderColor: '#18181b' }}>
                                            <span className="font-bold text-lg">Total</span>
                                            <span className="font-bold text-lg">S/ {(samplePackage.basePrice * 1.18).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Terms */}
                                <div className="mt-32 pt-8 border-t text-xs" style={{ borderColor: '#e4e4e7', color: '#71717a' }}>
                                    <p className="font-semibold mb-1">Términos y Condiciones:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Esta cotización tiene una validez de 15 días calendario.</li>
                                        <li>El pago se realizará 50% al inicio y 50% al finalizar el desarrollo.</li>
                                        <li>Los precios incluyen IGV.</li>
                                    </ul>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* Panel Derecho: Acciones */}
                <div className="space-y-6">
                    <Card className="bg-zinc-950 text-white border-zinc-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                Resumen Básico
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                                <span className="text-zinc-400">Subtotal</span>
                                <span>S/ {samplePackage.basePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                                <span className="text-zinc-400">IGV (18%)</span>
                                <span>S/ {(samplePackage.basePrice * 0.18).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg pt-2">
                                <span>Total Neto</span>
                                <span className="text-emerald-400">S/ {(samplePackage.basePrice * 1.18).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Exportar Documento</CardTitle>
                            <CardDescription>Genera el PDF oficial a partir de la previsualización.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md text-xs font-medium border border-amber-200 mb-4">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p>Asegúrate de revisar todos los detalles en la previsualización antes de generar el PDF definitivo.</p>
                            </div>
                            <Button
                                onClick={handleDownloadPDF}
                                disabled={isGenerating}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex justify-between items-center"
                            >
                                <span>{isGenerating ? "Generando..." : "Descargar PDF"}</span>
                                <Download className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

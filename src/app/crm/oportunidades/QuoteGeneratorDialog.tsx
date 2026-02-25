import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FileText } from "lucide-react";
import { sileo } from "sileo";
import { formatCurrency } from "@/lib/utils";

interface QuoteItem {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export function QuoteGeneratorDialog({ opportunityId, clientName }: { opportunityId: Id<"opportunities">, clientName: string }) {
    const [open, setOpen] = useState(false);
    const [quoteNumber, setQuoteNumber] = useState(`COT-${new Date().getTime().toString().slice(-6)}`);
    const [validUntil, setValidUntil] = useState(
        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 15 días default
    );
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<QuoteItem[]>([{ description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]);

    const generateQuote = useMutation(api.quotes.generateQuote);
    // Asumimos un usuario logeado genérico, requerimos auth ctx real en prod
    const users = useQuery(api.users.getAllUsers) || [];
    const loggedInUser = users[0]?._id; // Fallback mock

    const subtotal = items.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const handleAddItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
        }
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!loggedInUser) {
            sileo.error({ title: "Error de sesión" });
            return;
        }

        if (items.some(i => !i.description || i.totalPrice <= 0)) {
            sileo.error({ title: "Revise los items de la cotización" });
            return;
        }

        try {
            await generateQuote({
                opportunityId,
                quoteNumber,
                items,
                validUntil: new Date(validUntil).getTime(),
                notes,
                createdBy: loggedInUser
            });
            sileo.success({ title: "Cotización B2B Generada" });
            setOpen(false);
        } catch (error) {
            console.error(error);
            sileo.error({ title: "Fallo al generar cotización" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 border-zinc-200">
                    <FileText className="h-3.5 w-3.5" />
                    Cotizar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Armar Proforma Comercial</DialogTitle>
                    <p className="text-sm text-zinc-500">Cliente: <span className="font-medium text-zinc-800">{clientName}</span></p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="space-y-2">
                            <Label>Correlativo</Label>
                            <Input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} required className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label>Válido Hasta</Label>
                            <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} required className="bg-white" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-zinc-800">Líneas de Detalle</h4>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-7 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Fila
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <div className="flex-1 space-y-1">
                                        <Input
                                            placeholder="Detalle del servicio/producto..."
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="Cant."
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                            required
                                        />
                                    </div>
                                    <div className="w-32 space-y-1">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Precio U."
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            required
                                        />
                                    </div>
                                    <div className="w-32 pt-2 text-right font-medium text-zinc-700">
                                        {formatCurrency(item.totalPrice)}
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 mt-0.5" onClick={() => handleRemoveItem(index)} disabled={items.length === 1}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-zinc-200 pt-4 flex justify-between items-start">
                        <div className="w-1/2 space-y-2">
                            <Label>Notas/Condiciones (Opcional)</Label>
                            <Input
                                placeholder="Ej: Pago 50% Adelanto, 50% vs Entrega"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="w-1/3 bg-slate-50 p-4 rounded-lg space-y-2 text-sm border border-slate-100">
                            <div className="flex justify-between text-zinc-500">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>IGV (18%)</span>
                                <span>{formatCurrency(tax)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-zinc-900 border-t border-slate-200 pt-2 mt-2">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Generar Cotización</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

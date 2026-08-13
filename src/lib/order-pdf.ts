import { jsPDF } from "jspdf";
import { orderReference, type OrderEntity } from "@/server/domain/order";

const BRAND = "Cesar Fashion LLC";
const MARGIN = 16;

function money(value: number, currency: string) {
  return new Intl.NumberFormat("es-US", { style: "currency", currency }).format(value);
}

function date(value: Date) {
  return new Intl.DateTimeFormat("es-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function addHeader(pdf: jsPDF, title: string) {
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(BRAND, MARGIN, 18);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(title, MARGIN, 27);
  pdf.setDrawColor(210, 210, 210);
  pdf.line(MARGIN, 32, 194, 32);
}

function addOrder(pdf: jsPDF, order: OrderEntity, y: number) {
  const reference = orderReference(order.id);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(reference, MARGIN, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Estado: ${order.status}`, 125, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.text(`Cliente: ${order.customerName}`, MARGIN, y);
  y += 5;
  if (order.customerEmail || order.customerPhone) {
    pdf.text([order.customerEmail, order.customerPhone].filter(Boolean).join(" | "), MARGIN, y);
    y += 5;
  }
  pdf.text(`Fecha: ${date(order.createdAt)}`, MARGIN, y);
  y += 8;
  pdf.setFont("helvetica", "bold");
  pdf.text("Articulo", MARGIN, y);
  pdf.text("Cant.", 130, y);
  pdf.text("Precio", 155, y);
  pdf.text("Total", 180, y);
  y += 4;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(MARGIN, y, 194, y);
  y += 6;
  pdf.setFont("helvetica", "normal");
  for (const item of order.items) {
    if (y > 275) {
      pdf.addPage();
      y = 18;
    }
    const name = pdf.splitTextToSize(item.name, 105)[0];
    pdf.text(name, MARGIN, y);
    pdf.text(String(item.quantity), 132, y);
    pdf.text(money(item.unitPrice, item.currency), 155, y);
    pdf.text(money(item.unitPrice * item.quantity, item.currency), 180, y);
    y += 6;
  }
  y += 3;
  if (order.note) {
    pdf.text(`Nota: ${pdf.splitTextToSize(order.note, 170)[0]}`, MARGIN, y);
    y += 6;
  }
  pdf.setFont("helvetica", "bold");
  pdf.text(`Subtotal: ${money(order.subtotal, order.currency)}`, 140, y);
  y += 6;
  pdf.text(`Total: ${money(order.total, order.currency)}`, 140, y);
  pdf.setFont("helvetica", "normal");
  return y + 12;
}

export function downloadOrderPdf(order: OrderEntity, title = "Detalle de pedido") {
  const pdf = new jsPDF();
  addHeader(pdf, title);
  addOrder(pdf, order, 44);
  pdf.save(`${orderReference(order.id)}.pdf`);
}

export function downloadOrdersReportPdf(orders: OrderEntity[], title: string) {
  const pdf = new jsPDF();
  orders.forEach((order, index) => {
    if (index > 0) pdf.addPage();
    addHeader(pdf, title);
    pdf.setFontSize(9);
    pdf.text(`Generado: ${date(new Date())} | Registro ${index + 1} de ${orders.length}`, MARGIN, 39);
    addOrder(pdf, order, 52);
  });
  if (orders.length === 0) {
    addHeader(pdf, title);
    pdf.setFontSize(10);
    pdf.text("No hay registros para este reporte.", MARGIN, 45);
  }
  pdf.save(`${title.toLowerCase().replaceAll(" ", "-")}.pdf`);
}

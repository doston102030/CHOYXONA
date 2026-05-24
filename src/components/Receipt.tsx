"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Order } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatSom, formatDate } from "@/lib/utils";
import { Printer, Check } from "lucide-react";

interface ReceiptProps {
  order: Order;
  onClose: () => void;
}

export function Receipt({ order, onClose }: ReceiptProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => ref.current,
    documentTitle: `chek-${order.id}`,
  });

  return (
    <Modal isOpen={true} onClose={onClose} title="Chek" size="sm">
      <div className="border-2 border-dashed border-[#273244] rounded-xl p-2 mb-4 bg-white">
        <div ref={ref} className="receipt-print">
          <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>
            SOHIL CHOYXONA
          </div>
          <div style={{ textAlign: "center", fontSize: "10px", marginBottom: "8px" }}>
            ════════════════
          </div>

          <div style={{ fontSize: "11px", marginBottom: "4px" }}>
            <div>Stol: <b>{order.tableName}</b></div>
            <div>Sana: {formatDate(order.closedAt || order.createdAt)}</div>
            <div>№: {order.id.slice(-6).toUpperCase()}</div>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #000" }}>
                <th style={{ textAlign: "left", padding: "2px 0" }}>Mahsulot</th>
                <th style={{ textAlign: "right", padding: "2px 0" }}>Soni</th>
                <th style={{ textAlign: "right", padding: "2px 0" }}>Summa</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "2px 0", paddingRight: "4px" }}>
                    {item.productName}
                  </td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item.weight !== undefined
                      ? `${item.weight} kg`
                      : `${item.quantity}`}
                  </td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item.subtotal.toLocaleString("uz-UZ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          <div style={{ fontSize: "11px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Mahsulotlar:</span>
              <span>{order.subtotal.toLocaleString("uz-UZ")} so'm</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Xizmat ({order.servicePercent}%):</span>
              <span>{order.serviceFee.toLocaleString("uz-UZ")} so'm</span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              fontWeight: "bold",
              borderTop: "1px solid #000",
              paddingTop: "4px",
              marginTop: "4px"
            }}>
              <span>JAMI:</span>
              <span>{order.total.toLocaleString("uz-UZ")} so'm</span>
            </div>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "8px 0 4px" }} />

          <div style={{ textAlign: "center", fontSize: "10px", marginTop: "8px" }}>
            Rahmat! Yana keling 😊
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          <Check size={16} className="mr-2" />
          Yopish
        </Button>
        <Button variant="success" onClick={handlePrint} className="flex-1">
          <Printer size={16} className="mr-2" />
          Chop etish
        </Button>
      </div>
    </Modal>
  );
}

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { currency, formatDate } from "@/lib/utils";
import type { InvoiceDetail, InvoiceItemRow } from "@/lib/types";

type InvoiceDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const supabase = createAdminClient();

  const [invoiceResult, itemsResult] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        "*, companies(id,name,billing_name,billing_address_line_1,billing_address_line_2,billing_city,billing_state,billing_zip)",
      )
      .eq("id", params.id)
      .single(),
    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", params.id)
      .order("created_at", { ascending: true }),
  ]);

  if (invoiceResult.error) {
    throw new Error(`Failed to load invoice: ${invoiceResult.error.message}`);
  }

  if (itemsResult.error) {
    throw new Error(`Failed to load invoice items: ${itemsResult.error.message}`);
  }

  const invoice = invoiceResult.data as InvoiceDetail;
  const items = (itemsResult.data ?? []) as InvoiceItemRow[];
  const company = invoice.companies?.[0] ?? null;
  const cityStateZip = [company?.billing_city, company?.billing_state, company?.billing_zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <Topbar
        title={invoice.invoice_number}
        subtitle="Professional invoice presentation for ERP support billing."
      />

      <div className="mb-5 flex justify-end">
        <Link
          href={`/dashboard/invoices/${params.id}/edit`}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Edit invoice
        </Link>
      </div>

      <Card className="p-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-cyan-200">Bill To</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {company?.billing_name ?? company?.name ?? "Unassigned"}
            </p>
            <p className="mt-2 text-sm text-slate-300">{company?.billing_address_line_1 ?? ""}</p>
            {company?.billing_address_line_2 ? (
              <p className="text-sm text-slate-300">{company.billing_address_line_2}</p>
            ) : null}
            <p className="text-sm text-slate-300">{cityStateZip}</p>
          </div>

          <div className="text-sm text-slate-300">
            <p>
              <span className="text-slate-500">Created:</span> {formatDate(invoice.created_at)}
            </p>
            <p className="mt-2">
              <span className="text-slate-500">Due:</span> {formatDate(invoice.due_date)}
            </p>
            <p className="mt-2">
              <span className="text-slate-500">Status:</span> {invoice.status}
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Hours</th>
                <th className="px-5 py-3">Rate</th>
                <th className="px-5 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-white/5 text-slate-200">
                  <td className="px-5 py-4">{formatDate(item.work_completed_on)}</td>
                  <td className="px-5 py-4">{item.description}</td>
                  <td className="px-5 py-4">{item.hours}</td>
                  <td className="px-5 py-4">{currency(Number(item.rate ?? 0))}</td>
                  <td className="px-5 py-4">{currency(Number(item.amount ?? 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end text-right">
          <div>
            <p className="text-sm text-slate-400">Total</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {currency(Number(invoice.total_amount ?? 0))}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

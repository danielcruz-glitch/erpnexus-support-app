import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { InvoiceRow } from "@/lib/types";

type EditInvoicePageProps = {
  params: {
    id: string;
  };
};

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    throw new Error(`Failed to load invoice for editing: ${error.message}`);
  }

  const invoice = data as InvoiceRow;

  return (
    <div>
      <Topbar
        title="Edit invoice"
        subtitle="Admin-only invoice refinement page for clean, final billing output."
      />

      <Card className="max-w-3xl p-6">
        <form className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Invoice number</label>
              <Input defaultValue={invoice.invoice_number} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Status</label>
              <Input defaultValue={invoice.status} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Payment terms label</label>
            <Input defaultValue={invoice.payment_terms_label ?? "Net 30"} />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Invoice notes</label>
            <Textarea defaultValue={invoice.notes ?? ""} />
          </div>

          <Button type="button">Save invoice changes</Button>
        </form>
      </Card>
    </div>
  );
}

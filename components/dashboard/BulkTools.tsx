"use client";

import * as React from "react";
import {
  Download,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Loader2,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  parseImportCsv,
  toCsv,
  CSV_TEMPLATE,
  type BulkImportRow,
  type ExportProduct,
} from "@/lib/bulk";
import { bulkImportProducts } from "@/app/vendor/dashboard/products/actions";

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkTools({
  products,
}: {
  products: ExportProduct[];
}) {
  const [rows, setRows] = React.useState<BulkImportRow[]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [fileName, setFileName] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<string>();
  const [failed, setFailed] = React.useState<string>();
  const inputRef = React.useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(undefined);
    setFailed(undefined);
    const reader = new FileReader();
    reader.onload = () => {
      const { rows, errors } = parseImportCsv(String(reader.result ?? ""));
      setRows(rows);
      setErrors(errors);
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    setFailed(undefined);
    startTransition(async () => {
      const res = await bulkImportProducts(rows);
      if (res.ok) {
        setResult(`Imported ${res.count} product${res.count === 1 ? "" : "s"}.`);
        setRows([]);
        setErrors([]);
        setFileName(undefined);
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setFailed(res.error ?? "Import failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Export + template */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
            <Download className="h-5 w-5" />
            Export catalogue
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download all {products.length} of your products as a CSV — edit in a
            spreadsheet, then re-import.
          </p>
          <Button
            className="mt-4"
            onClick={() => download("nutraatoz-products.csv", toCsv(products))}
            disabled={products.length === 0}
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
            <FileSpreadsheet className="h-5 w-5" />
            Template
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            New to bulk import? Grab the template with the exact columns and an
            example row.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => download("nutraatoz-template.csv", CSV_TEMPLATE)}
          >
            <Download className="h-4 w-4" />
            Download template
          </Button>
        </div>
      </div>

      {/* Import */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
          <Upload className="h-5 w-5" />
          Import products
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a CSV to add products in bulk. Columns: title, price, stock,
          weight_gms, discount_type (PCT/FLAT), discount_value, description,
          ingredients, coa_status, goals (pipe-separated slugs), attributes
          (<code className="rounded bg-secondary px-1">Key:Value | Key:Value</code>).
          Commission is set by the platform. Imported items go live immediately.
        </p>

        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-secondary/40 px-4 py-6 text-sm font-medium text-primary hover:bg-secondary/70">
          <Upload className="h-4 w-4" />
          {fileName ? `Selected: ${fileName}` : "Choose a CSV file"}
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            className="hidden"
          />
        </label>

        {errors.length > 0 && (
          <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <p className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-4 w-4" />
              {errors.length} row{errors.length === 1 ? "" : "s"} skipped
            </p>
            <ul className="mt-1 max-h-28 list-disc overflow-y-auto pl-5 text-xs">
              {errors.slice(0, 20).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Table2 className="h-4 w-4 text-primary" />
              Preview — {rows.length} valid row{rows.length === 1 ? "" : "s"}
            </p>
            <div className="mt-2 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-right">Stock</th>
                    <th className="px-3 py-2">Goals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.slice(0, 25).map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-foreground">{r.title}</td>
                      <td className="px-3 py-2 text-right">₹{r.price}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {r.stock ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {r.goals.join(", ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 25 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  …and {rows.length - 25} more
                </p>
              )}
            </div>

            <Button className="mt-4" onClick={confirmImport} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Import {rows.length} product{rows.length === 1 ? "" : "s"}
                </>
              )}
            </Button>
          </div>
        )}

        {result && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            <Check className="h-4 w-4" />
            {result}
          </p>
        )}
        {failed && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4" />
            {failed}
          </p>
        )}
      </div>
    </div>
  );
}

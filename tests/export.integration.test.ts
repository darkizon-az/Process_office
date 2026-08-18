import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { csvBuffer, exportRows, xlsxBuffer } from "../lib/export-data";

describe("exports with seeded database", () => {
  it("includes invalidated rows in full CSV and emits UTF-8 BOM", async () => {
    const rows = await exportRows({});
    expect(rows.some((row) => row.status === "INVALIDATED")).toBe(true);
    expect(csvBuffer(rows).subarray(0, 3).toString("hex")).toBe("efbbbf");
  });

  it("creates a real XLSX with all required worksheets", async () => {
    const rows = await exportRows({});
    const data = await xlsxBuffer(rows, {});
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data as never);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      "Ответы", "Ответы_детально", "Метрики", "Комментарии", "Справочники", "Метаданные",
    ]);
  });
});

"use client";

import React, { useEffect, useRef, useCallback } from "react";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

// jQuery ve DataTables client-side olarak yüklenir
let $: any = null;

interface DataTableColumn {
  data: string;
  title: string;
  searchable?: boolean;
  orderable?: boolean;
  render?: (data: any, type: string, row: any) => string;
  className?: string;
  width?: string;
}

interface DataTableProps {
  /** Tablo ID'si */
  id: string;
  /** Backend AJAX URL'si */
  ajaxUrl: string;
  /** Kolon tanımları */
  columns: DataTableColumn[];
  /** Bearer token (auth gerektiren endpoint'ler için) */
  token?: string | null;
  /** Varsayılan sıralama: [[kolonIndex, 'asc' | 'desc']] */
  order?: [number, string][];
  /** Ekstra query parametreleri (ör: { status: 'PENDING' }) */
  extraParams?: Record<string, string | null | undefined>;
  /** Tablo CSS sınıfı */
  className?: string;
  /** Satıra tıklama işlemi */
  onRowClick?: (rowData: any) => void;
  /** Satır oluşturulduktan sonra callback */
  onRowCreated?: (row: HTMLElement, data: any) => void;
  /** Tablo yüklendiğinde callback (DataTable instance döner) */
  onInit?: (dtInstance: any) => void;
  /** Sayfa uzunluğu seçenekleri */
  pageLengthOptions?: number[];
  /** Varsayılan sayfa uzunluğu */
  pageLength?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  id,
  ajaxUrl,
  columns,
  token,
  order = [[0, "asc"]],
  extraParams,
  className = "",
  onRowClick,
  onRowCreated,
  onInit,
  pageLengthOptions = [10, 25, 50, 100],
  pageLength = 10,
}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const dtInstanceRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const destroyTable = useCallback(() => {
    if (dtInstanceRef.current) {
      try {
        dtInstanceRef.current.destroy();
      } catch (e) {
        // ignore
      }
      dtInstanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Eğer server-side'daysa (SSR) çalıştırma
    if (typeof window === "undefined") return;

    let isMounted = true;

    const initDataTable = async () => {
      // jQuery ve DataTables'ı dinamik olarak yükle
      if (!$) {
        const jq = await import("jquery");
        $ = jq.default || jq;
        (window as any).jQuery = $;
        (window as any).$ = $;
        await import("datatables.net");
      }

      if (!isMounted || !tableRef.current) return;

      // Önceki instance'ı temizle
      destroyTable();

      const dtConfig: any = {
        processing: true,
        serverSide: true,
        ajax: {
          url: ajaxUrl,
          type: "GET",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
          data: (d: any) => {
            if (extraParams) {
              Object.entries(extraParams).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                  d[key] = value;
                }
              });
            }
          },
          error: (_xhr: any, _error: string, thrown: string) => {
            console.error("DataTable AJAX hatası:", thrown);
          },
        },
        columns: columns.map((col) => ({
          data: col.data,
          searchable: col.searchable !== false,
          orderable: col.orderable !== false,
          render: col.render || null,
          className: col.className || "",
          width: col.width || undefined,
        })),
        order: order,
        pageLength: pageLength,
        lengthMenu: pageLengthOptions,
        language: {
          processing: "İşleniyor...",
          search: "Ara:",
          lengthMenu: "_MENU_ kayıt göster",
          info: "_TOTAL_ kayıttan _START_ - _END_ arası gösteriliyor",
          infoEmpty: "Kayıt bulunamadı",
          infoFiltered: "(toplam _MAX_ kayıt içinden filtrelendi)",
          loadingRecords: "Yükleniyor...",
          zeroRecords: "Eşleşen kayıt bulunamadı",
          emptyTable: "Tabloda veri yok",
          paginate: {
            first: "İlk",
            previous: "Önceki",
            next: "Sonraki",
            last: "Son",
          },
        },
        responsive: true,
        autoWidth: false,
        destroy: true,
        createdRow: (row: HTMLElement, data: any) => {
          if (onRowCreated) {
            onRowCreated(row, data);
          }
          if (onRowClick) {
            row.style.cursor = "pointer";
            row.addEventListener("click", () => onRowClick(data));
          }
        },
      };

      try {
        const dt = $(tableRef.current).DataTable(dtConfig);
        dtInstanceRef.current = dt;
        initializedRef.current = true;
        if (onInit) onInit(dt);
      } catch (err) {
        console.error("DataTable init hatası:", err);
      }
    };

    initDataTable();

    return () => {
      isMounted = false;
      destroyTable();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ajaxUrl, token, JSON.stringify(extraParams)]);

  return (
    <div className={`datatable-wrapper ${className}`}>
      <table
        ref={tableRef}
        id={id}
        className="display w-full"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.title}</th>
            ))}
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default DataTable;

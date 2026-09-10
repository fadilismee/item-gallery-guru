export function SiteFooter() {
  return (
    <footer id="kontak" className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="text-base font-bold text-foreground">MicroComputer</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Toko laptop, PC rakitan, dan aksesoris komputer. Melayani pembelian satuan
            maupun korporat.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold text-foreground">Kontak</h4>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>WhatsApp: (isi nomor Anda)</li>
            <li>Email: (isi email Anda)</li>
            <li>Alamat: (isi alamat toko)</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold text-foreground">Jam Buka</h4>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>Senin - Sabtu: (isi jam buka)</li>
            <li>Minggu: (isi jam buka)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} MicroComputer. Semua hak dilindungi.
      </div>
    </footer>
  );
}


export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background/40 backdrop-blur-xl transition-all duration-500">
      <div className="flex items-center space-x-5 rounded-full bg-background/90 px-8 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border/60">
        <div className="relative flex h-6 w-6 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-widest text-foreground uppercase">
            Korp Rentals
          </span>
          <span className="text-xs font-medium tracking-wide text-muted-foreground mt-0.5">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
}

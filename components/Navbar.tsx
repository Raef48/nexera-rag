export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-2">
          <img
            src="https://res.cloudinary.com/dudwzh2xy/image/upload/v1774161751/nexera_logo_rk3yzf.png"
            alt="Nexera Labs"
            className="h-8 w-8 rounded-xl"
          />
          <div>
            <h1 className="text-sm font-semibold text-slate-900 md:text-base">
              Nexera Labs
            </h1>
            <p className="text-[11px] text-slate-500 md:text-xs">
            Nexera · RAG · Dental Clinic AI
            </p>
          </div>
        </div>
        <div className="hidden text-xs text-slate-500 md:block">
          100% local · no API keys
        </div>
      </div>
    </header>
  );
}


export default function Footer() {
  return (
    <footer className="border-t border-border/50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted/40">
          labs
        </span>
        <a
          href="https://github.com/outsung"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted/40 transition-colors hover:text-muted"
        >
          @outsung
        </a>
      </div>
    </footer>
  );
}

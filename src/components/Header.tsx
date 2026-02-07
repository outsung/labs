"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-medium tracking-tight text-foreground"
        >
          labs
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/outsung/labs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted transition-colors hover:text-foreground"
          >
            github
          </a>
        </div>
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lab } from "@/types/lab";
import { cn } from "@/lib/utils";

interface LabCardProps {
  lab: Lab;
  index: number;
}

export default function LabCard({ lab, index }: LabCardProps) {
  const isArchived = lab.status === "archived";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
    >
      <Link
        href={isArchived ? "#" : `/labs/${lab.id}`}
        className={cn(
          "group block border-t border-border py-6 transition-colors",
          isArchived
            ? "cursor-default opacity-40"
            : "hover:border-foreground/20"
        )}
        onClick={isArchived ? (e) => e.preventDefault() : undefined}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium tracking-tight text-foreground">
                {lab.title}
              </h3>
              {lab.status === "wip" && (
                <span className="text-[10px] uppercase tracking-widest text-muted">
                  wip
                </span>
              )}
              {isArchived && (
                <span className="text-[10px] uppercase tracking-widest text-muted">
                  archived
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{lab.description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden gap-2 sm:flex">
              {lab.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-wider text-muted/60"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="font-mono text-[10px] text-muted/40">
              {lab.date}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

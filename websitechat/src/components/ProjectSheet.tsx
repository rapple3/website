"use client";

import React from 'react';
import { Sheet, SheetViewProps, useClientMediaQuery } from '@silk-hq/components';

export interface Project {
  title: string;
  category: string;
  status: string;
  tone: "good" | "meh" | "bad";
  summary: string;
  details: string;
  image?: string; // e.g. "/pantry.jpg" once there's a photo in /public
  link?: { href: string; label: string };
}

const toneClass = {
  good: "bg-lane text-white",
  meh: "bg-gold text-ink",
  bad: "bg-signal text-white",
};

function Visual({ project }: { project: Project }) {
  if (project.image) {
    return <img src={project.image} alt={project.title} className="w-full aspect-[16/9] object-cover" />;
  }
  return (
    <div className="hatch w-full aspect-[16/6] grid place-items-center">
      <span className="label -rotate-6 border-2 border-ink/50 text-ink/60 px-3 py-1 bg-paper">Photo pending</span>
    </div>
  );
}

export default function ProjectSheet({ project, number }: { project: Project; number: number }) {
  const largeViewport = useClientMediaQuery("(min-width: 650px)");
  const contentPlacement = largeViewport ? "center" : "bottom";
  const tracks: SheetViewProps["tracks"] = largeViewport ? ["top", "bottom"] : "bottom";
  const no = String(number).padStart(3, "0");

  return (
    <Sheet.Root license="commercial">
      <Sheet.Trigger asChild>
        {/* Card styled like the title block on a workshop drawing */}
        <div className="h-full flex flex-col bg-white rounded-xl border-2 border-ink shadow-hard overflow-hidden cursor-pointer transition-transform hover:-translate-y-1">
          <div className="border-b-2 border-ink">
            <Visual project={project} />
          </div>
          <div className="p-5 flex-grow">
            <h2 className="font-display font-bold text-2xl leading-tight">{project.title}</h2>
            <p className="mt-2 text-ink/75">{project.summary}</p>
          </div>
          <div className="grid grid-cols-3 border-t-2 border-ink divide-x-2 divide-ink text-center">
            <div className="py-2 px-1">
              <p className="label text-ink/50 !text-[0.55rem]">Dwg no.</p>
              <p className="label">{no}</p>
            </div>
            <div className="py-2 px-1">
              <p className="label text-ink/50 !text-[0.55rem]">Type</p>
              <p className="label">{project.category}</p>
            </div>
            <div className={`py-2 px-1 ${toneClass[project.tone]}`}>
              <p className="label opacity-70 !text-[0.55rem]">Status</p>
              <p className="label">{project.status}</p>
            </div>
          </div>
        </div>
      </Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.View
          className={`DetachedSheet-view contentPlacement-${contentPlacement}`}
          contentPlacement={contentPlacement}
          tracks={tracks}
          nativeEdgeSwipePrevention={true}
        >
          <Sheet.Backdrop
            className="DetachedSheet-backdrop"
            travelAnimation={{
              opacity: ({ progress }) => Math.min(progress * 0.3, 0.3),
            }}
            themeColorDimming="auto"
          />
          <Sheet.Content className="DetachedSheet-content">
            <div className="DetachedSheet-innerContent flex flex-col overflow-y-auto">
              <Visual project={project} />
              <div className="p-6">
                <p className="label text-ink/60 mb-1">Dwg no. {no} · {project.category} · {project.status}</p>
                <h2 className="font-display font-bold text-2xl mb-3">{project.title}</h2>
                <p className="text-ink/85">{project.details}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  {project.link ? (
                    <a
                      href={project.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
                    >
                      {project.link.label} →
                    </a>
                  ) : <span />}
                  <Sheet.Trigger
                    action="dismiss"
                    className="rounded-lg border-2 border-ink bg-paper px-3 py-1.5 text-sm font-semibold shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Close
                  </Sheet.Trigger>
                </div>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
}

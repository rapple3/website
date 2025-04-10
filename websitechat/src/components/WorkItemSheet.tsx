"use client";

import React from 'react';
import { Sheet, SheetViewProps, useClientMediaQuery } from '@silk-hq/components';

// Define structure for work item data
export interface WorkItem {
  title: string;
  context: string; // e.g., company name
  description: string;
  // Add other fields like image URL if needed later
}

interface Props {
  item: WorkItem;
}

export default function WorkItemSheet({ item }: Props) {
  const largeViewport = useClientMediaQuery("(min-width: 650px)");
  const contentPlacement = largeViewport ? "center" : "bottom";
  const tracks: SheetViewProps["tracks"] = largeViewport ? ["top", "bottom"] : "bottom";

  return (
    <Sheet.Root license="commercial">
      <Sheet.Trigger asChild>
        {/* This is the preview card that triggers the sheet */}
        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
          <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
          <div className="text-sm text-gray-500 mb-3">{item.context}</div>
          <p className="text-gray-600 text-sm flex-grow">{item.description}</p>
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
            className="DetachedSheet-backdrop" // Added class for potential specific backdrop styles
            travelAnimation={{
              opacity: ({ progress }) => Math.min(progress * 0.2, 0.2),
            }}
            themeColorDimming="auto"
          />
          <Sheet.Content className="DetachedSheet-content">
            {/* Inner container for styling (rounded corners, background) */}
            <div className="DetachedSheet-innerContent p-6 flex flex-col overflow-y-auto">
              {/* Consider adding a close button here if needed, especially for 'center' placement */}
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <div className="text-sm text-gray-500 mb-3">{item.context}</div>
              <p className="text-gray-700">{item.description}</p>
              {/* Add more details like images, links etc. here */}
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
} 
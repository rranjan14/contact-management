"use client";

import type { Contact } from "@/types/contact";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ResponsiveModal from "@/components/responsive-modal";
import { memo } from "react";

interface ViewContactModalProps {
  contact: Contact;
  onClose: () => void;
  isOpen: boolean;
}

export const ViewContactModal = memo(
  ({ contact, onClose, isOpen }: ViewContactModalProps) => {
    return (
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        title={contact.name}
      >
        <div className="space-y-4 py-4">
          <div className="relative w-full aspect-square max-w-[200px] mx-auto">
            <Image
              src={contact.imageUrl || "/placeholder.svg"}
              alt={contact.name}
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Contact Details</h3>
            <p className="text-muted-foreground">
              Last contacted: {formatDate(contact.lastContactDate.getTime())}
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </ResponsiveModal>
    );
  }
);

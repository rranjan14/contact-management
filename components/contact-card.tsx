"use client";

import type { Contact } from "@/types/contact";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { IMAGE_BLUR_PLACEHOLDER } from "@/lib/constants";

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
}

export default function ContactCard({ contact, onClick }: ContactCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-all mb-2 w-full"
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 mr-4">
          <Image
            src={contact.imageUrl || "/placeholder.svg"}
            alt={contact.name}
            fill
            className="object-cover"
            sizes="80px"
            priority={false}
            loading="lazy"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_PLACEHOLDER}
          />
        </div>
        <div className="flex-grow">
          <h3 className="font-medium">{contact.name}</h3>
          <p className="text-muted-foreground text-sm">
            {formatDate(contact.lastContactDate.getTime())}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

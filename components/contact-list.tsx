'use client';

import { memo } from 'react';
import type { Contact } from '@/types/contact';
import ContactCard from './contact-card';

interface ContactListProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
}

export const ContactList = memo(
  ({ contacts, onContactClick }: ContactListProps) => {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
        {contacts.map(contact => {
          return (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => onContactClick(contact)}
            />
          );
        })}
      </div>
    );
  }
);

'use client';

import { useCallback, useState } from 'react';
import type { Contact } from '@/types/contact';
import { ContactList } from '@/components/contact-list';
import { CreateContactModal } from '@/components/create-contact-modal';
import { ViewContactModal } from '@/components/view-contact-modal';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import ContactSkeleton from '@/components/contact-skeleton';
import { Header } from '@/components/header';
import { useContacts } from '@/hooks/use-contacts';

export default function Home() {
  const { contacts, loading, addContact } = useContacts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleCloseViewModal = () => {
    setSelectedContact(null);
  };

  const handleCreateModalClose = useCallback(
    async (newContact?: Omit<Contact, 'id'>) => {
      setIsCreateModalOpen(false);
      if (newContact) {
        try {
          await addContact(newContact);
        } catch (error) {
          console.error('Failed to add contact:', error);
        }
      }
    },
    [addContact]
  );

  return (
    <main className="container mx-auto px-4">
      <Header onAddContact={() => setIsCreateModalOpen(true)} />
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <ContactSkeleton key={index} />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first contact to get started
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      ) : (
        <ContactList contacts={contacts} onContactClick={handleContactClick} />
      )}

      {isCreateModalOpen && (
        <CreateContactModal
          onClose={handleCreateModalClose}
          isOpen={isCreateModalOpen}
        />
      )}

      {selectedContact && (
        <ViewContactModal
          contact={selectedContact}
          onClose={handleCloseViewModal}
          isOpen={!!selectedContact}
        />
      )}
    </main>
  );
}

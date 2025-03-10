'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contact } from '@/types/contact';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  /**
   * Fetches contacts from the database.
   */
  const fetchContacts = useCallback(async () => {
    logger.info('Fetching contacts from database');
    setLoading(true);
    try {
      const contactsRef = collection(db, 'contacts');
      const contactsQuery = query(
        contactsRef,
        orderBy('lastContactDate', 'asc')
      );
      const querySnapshot = await getDocs(contactsQuery);

      const contactsList: Contact[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data && data.name && data.lastContactDate) {
          contactsList.push({
            id: doc.id,
            name: data.name,
            imageUrl: data.imageUrl || '/placeholder.svg', // Fallback for missing images
            lastContactDate: data.lastContactDate.toDate(),
          });
        }
      });

      logger.info(`Successfully fetched ${contactsList.length} contacts`);
      setContacts(contactsList);
    } catch (error) {
      logger.error('Error fetching contacts', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      toast({
        title: 'Error loading contacts',
        description: 'Failed to load your contacts. Please try again.',
        variant: 'destructive',
      });
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Adds a new contact to the database.
   */
  const addContact = useCallback(
    async (newContact: Omit<Contact, 'id'>) => {
      logger.info('Adding new contact', {
        name: newContact.name,
        lastContactDate: newContact.lastContactDate.toISOString(),
      });

      try {
        const contactData = {
          name: newContact.name,
          imageUrl: newContact.imageUrl,
          lastContactDate: Timestamp.fromDate(newContact.lastContactDate),
        };

        const docRef = await addDoc(collection(db, 'contacts'), contactData);
        logger.info('Contact added successfully', { contactId: docRef.id });

        const createdContact: Contact = {
          id: docRef.id,
          ...newContact,
        };

        setContacts(prevContacts => {
          const updatedContacts = [...prevContacts, createdContact];
          return updatedContacts.sort(
            (a, b) => a.lastContactDate.getTime() - b.lastContactDate.getTime()
          );
        });

        return createdContact;
      } catch (error) {
        logger.error('Error adding contact', {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          contactData: {
            name: newContact.name,
            lastContactDate: newContact.lastContactDate.toISOString(),
          },
        });

        toast({
          title: 'Error adding contact',
          description: 'Failed to add the contact. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    addContact,
    fetchContacts,
  };
}

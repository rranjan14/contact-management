'use client';

import type React from 'react';

import { memo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { uploadPhotoWithProgress } from '@/lib/storage-utils';
import type { Contact } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Loader2, CalendarIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import ResponsiveModal from './responsive-modal';
import Image from 'next/image';

interface CreateContactModalProps {
  onClose: (newContact?: Omit<Contact, 'id'>) => void;
  isOpen: boolean;
}

interface FormValues {
  name: string;
  lastContactDate: Date;
  image?: File;
}

export const CreateContactModal = memo(
  ({ isOpen, onClose }: CreateContactModalProps) => {
    const { toast } = useToast();
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors, isSubmitting },
    } = useForm<FormValues>({
      defaultValues: {
        name: '',
        image: undefined,
        lastContactDate: undefined,
      },
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedDate = watch('lastContactDate');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];

        // Set the file in the form data
        setValue('image', e.target.files[0]);

        // Create preview
        const reader = new FileReader();
        reader.onload = event => {
          setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Clear the image if no file is selected
        setValue('image', undefined);
        setImagePreview(null);
      }
    };

    const onSubmit = async (data: FormValues) => {
      try {
        let imageUrl = '/placeholder.svg'; // Default image URL

        if (data.image) {
          setIsUploading(true);
          const image = data.image;
          const path = `contacts/${Date.now()}_${image.name}`;

          imageUrl = await uploadPhotoWithProgress(image, path, progress => {
            setUploadProgress(progress);
          });
          setIsUploading(false);
        }

        const newContact: Omit<Contact, 'id'> = {
          name: data.name,
          imageUrl,
          lastContactDate: new Date(data.lastContactDate),
        };

        onClose(newContact);
        toast({
          title: 'Contact created successfully',
          description: 'The contact has been added to your contact list.',
          variant: 'success',
        });
      } catch (error: unknown) {
        console.error('Error creating contact:', error);
        setIsUploading(false);
        toast({
          title: 'Error creating contact',
          description:
            error instanceof Error
              ? error.message
              : 'An error occurred while creating the contact.',
          variant: 'destructive',
        });
      }
    };

    const handleDateSelect = (date: Date | undefined) => {
      setValue('lastContactDate', date as Date, {
        shouldValidate: true,
      });
    };

    return (
      <ResponsiveModal
        open={isOpen}
        onOpenChange={open => {
          if (!open && !isSubmitting && !isUploading) onClose();
        }}
        title="Add New Contact"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Enter contact name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastContactDate">Last Contact Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="lastContactDate"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={date => date > new Date()}
                  fromDate={undefined}
                  toDate={new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.lastContactDate && (
              <p className="text-sm text-destructive">
                {errors.lastContactDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Contact Image</Label>
            <div
              className="border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                  <Image
                    src={imagePreview || '/placeholder.svg'}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload an image
                  </p>
                </div>
              )}
              <input
                {...register('image')}
                ref={e => {
                  fileInputRef.current = e;
                }}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting || isUploading}
              />
            </div>
            {errors.image && (
              <p className="text-sm text-destructive">{errors.image.message}</p>
            )}

            {/* Add progress bar for upload with animation */}
            <div
              className={`space-y-2 mt-2 transition-all duration-300 ease-in-out ${
                isUploading
                  ? 'opacity-100 max-h-20'
                  : 'opacity-0 max-h-0 overflow-hidden'
              }`}
            >
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Uploading image...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress
                value={uploadProgress}
                className="h-2 transition-all duration-300"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                'Save Contact'
              )}
            </Button>
          </DialogFooter>
        </form>
      </ResponsiveModal>
    );
  }
);

'use client';

import type React from 'react';

import { memo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { uploadPhotoWithProgress } from '@/lib/storage-utils';
import { logger } from '@/lib/logger';
import type { Contact } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, CalendarIcon, Loader2 } from 'lucide-react';
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
import { Form, FormField } from './ui/form';

interface CreateContactModalProps {
  onClose: (newContact?: Omit<Contact, 'id'>) => void;
  isOpen: boolean;
}

// Define the form schema with Zod
const FormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  lastContactDate: z.date({
    required_error: 'Last contact date is required',
  }),
  image: z.instanceof(File).optional(),
});

export const CreateContactModal = memo(
  ({ isOpen, onClose }: CreateContactModalProps) => {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        name: '',
        image: undefined,
        lastContactDate: undefined,
      },
      mode: 'onSubmit',
    });

    const {
      handleSubmit,
      setValue,
      register,
      formState: { isSubmitting, errors },
    } = form;

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        logger.info('Processing image upload', {
          fileName: e.target?.files?.[0]?.name,
          fileSize: e.target?.files?.[0]?.size,
        });

        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];

          // Set the file in the form data
          setValue('image', e.target.files[0]);

          // Create preview
          const reader = new FileReader();
          reader.onload = event => {
            setImagePreview(event.target?.result as string);
            logger.info('Image preview created successfully');
          };
          reader.onerror = error => {
            logger.error('Error creating image preview', error);
            toast({
              title: 'Error processing image',
              description:
                'Could not create image preview. Please try another image.',
              variant: 'destructive',
            });
          };
          reader.readAsDataURL(file);
        } else {
          // Clear the image if no file is selected
          setValue('image', undefined);
          setImagePreview(null);
          logger.info('Image selection cleared');
        }
      } catch (err) {
        logger.error('Error in handleImageChange', err);
        toast({
          title: 'Error processing image',
          description: 'An error occurred while processing the image.',
          variant: 'destructive',
        });
      }
    };

    // Then modify the onSubmit function to set this state
    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
      logger.info('Form submission started', {
        name: data.name,
        hasImage: !!data.image,
        lastContactDate: data.lastContactDate?.toISOString(),
      });

      // Zod validation will handle the required fields now
      try {
        let imageUrl = '/placeholder.svg'; // Default image URL

        if (data.image) {
          setIsUploading(true);
          const image = data.image;
          const path = `contacts/${Date.now()}_${image.name}`;

          logger.info('Starting image upload', {
            fileName: image.name,
            fileSize: image.size,
            path,
          });

          imageUrl = await uploadPhotoWithProgress(image, path, progress => {
            setUploadProgress(progress);
            if (progress % 25 === 0) {
              // Log at 0%, 25%, 50%, 75%, 100%
              logger.info(`Upload progress: ${progress}%`);
            }
          });
          setIsUploading(false);
          logger.info('Image upload completed', { imageUrl });
        }

        const newContact: Omit<Contact, 'id'> = {
          name: data.name,
          imageUrl,
          lastContactDate: new Date(data.lastContactDate),
        };

        logger.info('Contact created successfully', {
          name: newContact.name,
          imageUrl: newContact.imageUrl,
        });

        onClose(newContact);
        toast({
          title: 'Contact created successfully',
          description: 'The contact has been added to your contact list.',
          variant: 'success',
        });
      } catch (error: unknown) {
        logger.error('Error creating contact', {
          error,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          formData: {
            name: data.name,
            hasImage: !!data.image,
            imageFileName: data.image?.name,
            lastContactDate: data.lastContactDate?.toISOString(),
          },
        });

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

    return (
      <ResponsiveModal
        open={isOpen}
        onOpenChange={open => {
          if (!open && !isSubmitting && !isUploading) onClose();
        }}
        title="Add New Contact"
      >
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...field}
                    placeholder="Enter contact name"
                    disabled={isSubmitting}
                    className={cn(
                      form.formState.errors.lastContactDate &&
                        'border-destructive'
                    )}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="lastContactDate"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="lastContactDate">
                    Last Contact Date{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="lastContactDate"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground',
                          form.formState.errors.lastContactDate &&
                            'border-destructive'
                        )}
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, 'PPP')
                          : 'Select a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={date => date > new Date()}
                        fromDate={undefined}
                        toDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.lastContactDate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.lastContactDate.message}
                    </p>
                  )}
                </div>
              )}
            />

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
                      width={200}
                      height={200}
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
                <p className="text-sm text-destructive">
                  {errors.image.message}
                </p>
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
        </Form>
      </ResponsiveModal>
    );
  }
);

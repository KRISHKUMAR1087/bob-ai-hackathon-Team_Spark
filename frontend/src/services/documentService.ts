import { supabase } from '../lib/supabase';
import { ShippingDocument, DocumentType } from '../types/operations';

export interface UploadDocumentParams {
  file: File;
  name: string;
  vesselId: string;
  vesselName: string;
  type: DocumentType;
  ownerId: string;
}

const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'tiff', 'tif', 'doc', 'docx'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export class DocumentService {
  /**
   * Formats raw bytes into human-readable MB / KB string
   */
  public static formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${bytes} B`;
  }

  /**
   * Validates file format and size constraints
   */
  public static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'Please select a document file to attach.' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `File size exceeds the 25 MB limit (${DocumentService.formatFileSize(file.size)}).`,
      };
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: `Invalid file format (.${extension}). Allowed formats: PDF, TIFF, PNG, JPG, Word.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Uploads a physical file to Supabase Storage and inserts metadata into public."ShippingDocument"
   */
  public static async uploadDocument(params: UploadDocumentParams): Promise<ShippingDocument> {
    const { file, name, vesselId, vesselName, type, ownerId } = params;

    const validation = DocumentService.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (!ownerId) {
      throw new Error('Authentication required: user identifier not found.');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const sanitizedTitle = (name || file.name.replace(/\.[^/.]+$/, ''))
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `${ownerId}/${vesselId}/${Date.now()}_${sanitizedTitle}.${fileExt}`;

    let fileUrl: string | undefined = undefined;

    // 1. Upload to Supabase Storage ('documents' bucket, with 'uploads' fallback)
    try {
      let bucket = 'documents';
      let uploadResult = await supabase.storage.from(bucket).upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadResult.error && uploadResult.error.message.includes('Bucket not found')) {
        bucket = 'uploads';
        uploadResult = await supabase.storage.from(bucket).upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      }

      if (uploadResult.error) {
        console.warn('[DocumentService] Supabase Storage upload warning:', uploadResult.error);
      } else {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
        fileUrl = urlData?.publicUrl || storagePath;
      }
    } catch (storageErr) {
      console.warn('[DocumentService] Storage upload exception, proceeding with document metadata', storageErr);
    }

    const docId = `DOC-${Date.now().toString().slice(-6)}`;
    const formattedDate = new Date().toISOString().split('T')[0];
    const formattedSize = DocumentService.formatFileSize(file.size);

    const newDoc: ShippingDocument = {
      id: docId,
      name: name.trim() || file.name,
      vesselId,
      vesselName,
      type,
      status: 'Under Review',
      uploadedDate: formattedDate,
      fileSize: formattedSize,
      fileUrl: fileUrl,
      ownerId,
    };

    // 2. Persist metadata to Supabase public."ShippingDocument"
    try {
      const { data, error } = await supabase
        .from('ShippingDocument')
        .insert({
          id: newDoc.id,
          name: newDoc.name,
          vesselId: newDoc.vesselId,
          vesselName: newDoc.vesselName,
          type: newDoc.type,
          status: newDoc.status,
          uploadedDate: newDoc.uploadedDate,
          fileSize: newDoc.fileSize,
          fileUrl: newDoc.fileUrl,
          ownerId: newDoc.ownerId,
        })
        .select()
        .single();

      if (error) {
        console.warn('[DocumentService] Supabase database insert error:', error);
      } else if (data) {
        return {
          id: data.id,
          name: data.name,
          vesselId: data.vesselId,
          vesselName: data.vesselName,
          type: data.type as DocumentType,
          status: data.status,
          uploadedDate: data.uploadedDate,
          fileSize: data.fileSize,
          fileUrl: data.fileUrl,
          ownerId: data.ownerId,
        };
      }
    } catch (dbErr) {
      console.warn('[DocumentService] Database insert exception:', dbErr);
    }

    return newDoc;
  }

  /**
   * Fetches persisted documents from Supabase public."ShippingDocument"
   */
  public static async fetchDocuments(userId?: string, role?: string): Promise<ShippingDocument[]> {
    try {
      let query = supabase.from('ShippingDocument').select('*');

      // Restrict ship-agents to their own documents
      if (userId && role !== 'admin') {
        query = query.or(`ownerId.eq.${userId},ownerId.is.null,ownerId.eq.demo-agent`);
      }

      const { data, error } = await query.order('uploadedDate', { ascending: false });

      if (error) {
        console.warn('[DocumentService] Failed to fetch documents from Supabase:', error);
        return [];
      }

      if (data && Array.isArray(data)) {
        return data.map(d => ({
          id: d.id,
          name: d.name,
          vesselId: d.vesselId,
          vesselName: d.vesselName,
          type: d.type as DocumentType,
          status: d.status,
          uploadedDate: d.uploadedDate,
          fileSize: d.fileSize,
          fileUrl: d.fileUrl,
          ownerId: d.ownerId,
        }));
      }
    } catch (err) {
      console.warn('[DocumentService] fetchDocuments exception:', err);
    }
    return [];
  }

  /**
   * Deletes a document from Supabase database and associated Storage file
   */
  public static async deleteDocument(docId: string, fileUrl?: string): Promise<void> {
    try {
      // 1. Delete from database
      const { error: dbErr } = await supabase
        .from('ShippingDocument')
        .delete()
        .eq('id', docId);

      if (dbErr) {
        console.warn('[DocumentService] Database delete error:', dbErr);
      }

      // 2. Delete from storage if URL exists
      if (fileUrl) {
        try {
          const parts = fileUrl.split('/documents/');
          const path = parts[1] || fileUrl.split('/uploads/')[1];
          if (path) {
            await supabase.storage.from('documents').remove([path]);
            await supabase.storage.from('uploads').remove([path]);
          }
        } catch (storageErr) {
          console.warn('[DocumentService] Storage file delete warning:', storageErr);
        }
      }
    } catch (e) {
      console.error('[DocumentService] deleteDocument exception:', e);
      throw e;
    }
  }
}

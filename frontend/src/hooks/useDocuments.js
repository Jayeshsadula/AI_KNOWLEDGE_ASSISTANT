import { useCallback, useEffect, useState } from "react";
import { documentService } from "@/services/documentService";
import { useToast } from "@/context/ToastContext";

export function useDocuments() {
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentService.list();
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const upload = useCallback(async (file) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await documentService.upload(file, setUploadProgress);
      setDocs((prev) => [result, ...prev]);
      toast.success(`"${file.name}" uploaded and indexed.`);
      return result;
    } catch (err) {
      toast.error(err.response?.data?.detail ?? "Upload failed.");
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await documentService.remove(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document deleted.");
    } catch {
      toast.error("Could not delete document.");
    }
  }, []);

  return { docs, loading, uploading, uploadProgress, upload, remove, refetch: fetchDocs };
}

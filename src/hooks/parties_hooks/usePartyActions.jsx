import { useState, useCallback } from "react";
import partyService from "../../services/partyService";


export default function usePartyActions() {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [createError, setCreateError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // إضافة شخص
  const createParty = useCallback(async (formData) => {
    setCreating(true);
    setCreateError(null);

    try {
      return await partyService.addPartyService(formData);
    } catch (error) {
      setCreateError(error);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  // تعديل شخص
  const updateParty = useCallback(async (id, formData) => {
    setUpdating(true);
    setUpdateError(null);

    try {
      return await partyService.updatePartyService(id, formData);
    } catch (error) {
      setUpdateError(error);
      return null;
    } finally {
      setUpdating(false);
    }
  }, []);

  // حذف شخص
  const deleteParty = useCallback(async (id) => {
    setDeleting(true);
    setDeleteError(null);

    try {
      return await partyService.deletePartyService(id);
    } catch (error) {
      setDeleteError(error);
      return null;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    createParty,
    updateParty,
    deleteParty,

    creating,
    updating,
    deleting,

    createError,
    updateError,
    deleteError,
  };
}

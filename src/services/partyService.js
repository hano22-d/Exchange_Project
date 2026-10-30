
import { runInTransaction } from "../database/transaction.js";

import {
  getAllParties,
  getPartyById,
  searchPartiesByName,
  addParty,
  updateParty,
  deleteParty,
} from "../repositories/partyRepository.js";

import { getAllDebts } from "../repositories/debtRepository.js";

const PARTIES_STORE = "parties";
const DEBTS_STORE = "debts";

// تحويل id القادم من React Router إلى نوعه الصحيح
function normalizeId(id) {
  if (
    typeof id === "string" &&
    id.trim() !== "" &&
    Number.isFinite(Number(id))
  ) {
    return Number(id);
  }

  return id;
}

// تجهيز بيانات الجهة
function normalizePartyData(data, currentParty = null) {
  return {
    fullName:
      typeof data.fullName === "string"
        ? data.fullName.trim()
        : currentParty?.fullName ?? "",
  };
}

// التحقق من بيانات الجهة
function validatePartyData(party) {
  if (!party.fullName) {
    throw new Error("اسم الجهة مطلوب");
  }
}

// جلب جميع الجهات
export function getAllPartiesService() {
  return runInTransaction(
    [PARTIES_STORE],
    "readonly",
    async (tx) => {
      return getAllParties(tx);
    }
  );
}

// جلب جهة حسب id
export function getPartyByIdService(id) {
  return runInTransaction(
    [PARTIES_STORE],
    "readonly",
    async (tx) => {
      return getPartyById(normalizeId(id), tx);
    }
  );
}

// البحث عن جهة حسب الاسم
export function searchPartiesByNameService(name) {
  return runInTransaction(
    [PARTIES_STORE],
    "readonly",
    async (tx) => {
      return searchPartiesByName(name, tx);
    }
  );
}

// إضافة جهة
export function addPartyService(formData) {
  return runInTransaction(
    [PARTIES_STORE],
    "readwrite",
    async (tx) => {
      const party = normalizePartyData(formData);

      validatePartyData(party);

      const id = await addParty(party, tx);

      return {
        id,
        ...party,
      };
    }
  );
}

// تعديل جهة
export function updatePartyService(id, formData) {
  return runInTransaction(
    [PARTIES_STORE],
    "readwrite",
    async (tx) => {
      const partyId = normalizeId(id);

      const currentParty = await getPartyById(
        partyId,
        tx
      );

      if (!currentParty) {
        throw new Error("الجهة غير موجودة");
      }

      const updatedParty = {
        id: currentParty.id,
        ...normalizePartyData(formData, currentParty),
      };

      validatePartyData(updatedParty);

      await updateParty(updatedParty, tx);

      return updatedParty;
    }
  );
}

// حذف جهة
export function deletePartyService(id) {
  return runInTransaction(
    [PARTIES_STORE, DEBTS_STORE],
    "readwrite",
    async (tx) => {
      const partyId = normalizeId(id);

      const party = await getPartyById(partyId, tx);

      if (!party) {
        throw new Error("الجهة غير موجودة");
      }

      const debts = await getAllDebts(partyId, tx);

      if (debts.length > 0) {
        throw new Error(
          "لا يمكن حذف الجهة لوجود حركات دين مرتبطة بها"
        );
      }

      await deleteParty(partyId, tx);

      return party;
    }
  );
}
const partyService = {
    getAllPartiesService,
    getPartyByIdService,
    searchPartiesByNameService,
    addPartyService,
    updatePartyService,
    deletePartyService,
}
export default partyService
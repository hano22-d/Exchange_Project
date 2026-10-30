import { requestToPromise } from "../shared/utilsDB";

const PARTIES_STORE = "parties";

// جلب جميع الجهات
export function getAllParties(tx) {
  const store = tx.objectStore(PARTIES_STORE);

  return requestToPromise(store.getAll());
}

// جلب جهة واحدة باستخدام id
export function getPartyById(id, tx) {
  const store = tx.objectStore(PARTIES_STORE);

  return requestToPromise(store.get(id));
}

// البحث عن الجهات حسب الاسم
export async function searchPartiesByName(name, tx) {
  const parties = await getAllParties(tx);

  const searchQuery =
    typeof name === "string" ? name.trim().toLocaleLowerCase() : "";

  if (!searchQuery) {
    return parties;
  }

  return parties.filter((party) => {
    return (
      typeof party.fullName === "string" &&
      party.fullName.toLocaleLowerCase().includes(searchQuery)
    );
  });
}

// إضافة جهة
export function addParty(party, tx) {
  const store = tx.objectStore(PARTIES_STORE);

  return requestToPromise(store.add(party));
}

// تعديل جهة
export function updateParty(party, tx) {
  const store = tx.objectStore(PARTIES_STORE);

  return requestToPromise(store.put(party));
}

// حذف جهة
export function deleteParty(id, tx) {
  const store = tx.objectStore(PARTIES_STORE);

  return requestToPromise(store.delete(id));
}

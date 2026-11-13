import { useBackup } from "../context/BackupContext";
import { getBusinessDate } from "../services/backupService";

export default function Inventory() {

  const {endOfDayBackup} = useBackup()


  return (
    <div>
      <h1>Inventory Page</h1>
      <p>This is the inventory page of our application.</p>

      <button onClick={() => endOfDayBackup(getBusinessDate())}>اجراء المطابقة</button>
    </div>
  );
}

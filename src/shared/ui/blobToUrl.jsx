import { useEffect, useState } from "react";

// الثنائي لرابط نصيblob دالة تحويل كائن
export function useBlobObjectUrl(blob) {
    const [url, setUrl] = useState(null);
  
    useEffect(() => {
      if (!(blob instanceof Blob)) {
        setUrl(null);
        return undefined;
      }
  
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
  
      return () => URL.revokeObjectURL(objectUrl);
    }, [blob]);
  
    return url;
  }
  
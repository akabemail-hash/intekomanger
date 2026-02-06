export const getBase64ImageFromURL = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
          resolve(null);
          return;
      }
      try {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
      } catch (error) {
          // Canvas is tainted or other error
          console.warn("Could not export image due to CORS:", error);
          resolve(null);
      }
    };

    img.onerror = () => {
      // Image failed to load (CORS or 404)
      console.warn("Failed to load image for export");
      resolve(null);
    };

    img.src = url;
  });
};
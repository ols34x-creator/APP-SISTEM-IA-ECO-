
export const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const validateFileFormat = (file: File, extraExtensions: string[] = []): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allAllowedExtensions = [...ALLOWED_EXTENSIONS, ...extraExtensions];
  
  if (!extension || !allAllowedExtensions.includes(extension)) {
    return false;
  }
  return true;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // result is "data:mime/type;base64,the_base64_string"
        // we need to remove the prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const getMimeType = (file: File): string => {
    return file.type;
}

export const base64ToSrc = (base64: string, mimeType: string): string => {
    return `data:${mimeType};base64,${base64}`;
}

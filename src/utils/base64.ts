export async function blobToBase64(blob: any) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

/*
let blob = null; // <= your blob object goes here
const base64String = await blobToBase64(blob);
*/
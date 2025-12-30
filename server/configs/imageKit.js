// import ImageKit from '@imagekit/nodejs';

// const imageKit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // This is the default and can be omitted
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
// });

import 'dotenv/config';
import ImageKit from '@imagekit/nodejs';

// const imageKit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
// });

let imageKit;

try {
  if (process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
    imageKit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
    console.log("✅ ImageKit initialized successfully");
  } else {
    console.warn("⚠️ ImageKit environment variables missing. Uploads will fail.");
    imageKit = {
      upload: () => Promise.reject(new Error("ImageKit not configured (missing env vars)")),
      url: () => "",
    };
  }
} catch (error) {
  console.error("⚠️ ImageKit initialization failed:", error.message);
  imageKit = {
    upload: () => Promise.reject(new Error("ImageKit initialization failed")),
    url: () => "",
  };
}

// URL with basic transformations
// export const transformedUrl = client.helper.buildSrc({
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
//   src: '/path/to/image.jpg',
//   transformation: [
//     {
//       width: 400,
//       height: 300,
//       crop: 'maintain_ratio',
//       quality: 80,
//       format: 'webp',
//     },
//   ],
// });
// Result: https://ik.imagekit.io/your_imagekit_id/path/to/image.jpg?tr=w-400,h-300,c-maintain_ratio,q-80,f-webp

export default imageKit;

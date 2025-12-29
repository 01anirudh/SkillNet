// import ImageKit from '@imagekit/nodejs';

// const imageKit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // This is the default and can be omitted
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
// });

import ImageKit from '@imagekit/nodejs';

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

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

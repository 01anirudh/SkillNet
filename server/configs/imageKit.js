import ImageKit from '@imagekit/nodejs';


if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  console.error('Error: IMAGEKIT_PRIVATE_KEY is missing in environment variables');
}

const imageKit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});





export default imageKit;

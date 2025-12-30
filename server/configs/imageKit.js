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


    imageKit = new ImageKit({
      privateKey: process.env[IMAGEKIT_PRIVATE_KE],
    });
 




export default imageKit;

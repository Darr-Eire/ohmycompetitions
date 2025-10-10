import axios from 'axios';
import FormData from 'form-data';

export async function uploadToIPFS(fileBuffer, fileName) {
  const formData = new FormData();
  formData.append('file', fileBuffer, fileName);

  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: {
      'pinata_api_key': process.env.PINATA_API_KEY,
      'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
      ...formData.getHeaders()
    }
  });

  return res.data.IpfsHash;
}

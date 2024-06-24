import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  try {
    const { image } = req.body;

    console.log(process.env.HUGGINGFACE_API_KEY);

    const response = await fetch(
      'https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: image,
        }),
      }
    );

    const data = await response.json();
    const caption = data[0]?.generated_text || 'No caption found';

    console.log('DATA:');
    console.log(data);

    res.status(200).json({ caption });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

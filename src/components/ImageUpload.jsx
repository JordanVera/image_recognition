import { useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const imageRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      setImage(event.target.result);
      setCaption(''); // Reset caption on new image upload
    };

    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!image) return;

    const img = imageRef.current;
    const tensor = tf.browser
      .fromPixels(img)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255.0)) // Normalize the tensor values to [0, 1]
      .expandDims();

    // Convert the tensor to a base64-encoded string
    const base64Image = await tensorToBase64(tensor);

    // Send the base64 image to the API for captioning
    const response = await fetch('/api/getCaption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    const data = await response.json();

    setCaption(data.caption);
  };

  const tensorToBase64 = async (tensor) => {
    const canvas = document.createElement('canvas');
    await tf.browser.toPixels(tensor.squeeze(), canvas);
    return canvas.toDataURL();
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {image && (
        <div>
          <img
            ref={imageRef}
            id="uploaded-image"
            src={image}
            alt="Uploaded"
            style={{ maxWidth: '300px' }}
          />
          <button onClick={handleImageUpload}>Analyze Image</button>
        </div>
      )}
      {caption && (
        <div>
          <h3>Caption:</h3>
          <p>{caption}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

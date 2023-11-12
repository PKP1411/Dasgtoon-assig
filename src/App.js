import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [inputTexts, setInputTexts] = useState(Array(10).fill(''));
  const [images, setImages] = useState(Array(10).fill(null));
  const [annotations, setAnnotations] = useState(Array(10).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [firstTimeUser, setFirstTimeUser] = useState(true);

  async function query(data) {
    try {
      setLoading(true);
      const response = await fetch(
        "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
        {
          headers: {
            "Accept": "image/png",
            "Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }

      const result = await response.blob();
      return result;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
      setGotData(true);
    }
  }

  const handleTextChange = (index, value) => {
    const newTexts = [...inputTexts];
    newTexts[index] = value;
    setInputTexts(newTexts);
    setError(null); // Clear previous errors when the user types
  };

  const handleAnnotationChange = (index, value) => {
    const newAnnotations = [...annotations];
    newAnnotations[index] = value;
    setAnnotations(newAnnotations);
  };

  const generateImages = () => {
    const imagePromises = inputTexts.map((text) => query({ inputs: text.trim() }));

    Promise.all(imagePromises).then((responses) => {
      const newImages = responses.map((response) => (response ? URL.createObjectURL(response) : null));
      setImages(newImages);
    });
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const caption = encodeURIComponent('Check out my comic strip!');
    const media = images.map((image) => encodeURIComponent(image)).join(',');

    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${caption}&media=${media}`, '_blank');
  };

  const shareOnInstagram = () => {
    const url = encodeURIComponent(images[0]); // Instagram supports only one image
    window.open(`https://www.instagram.com/?url=${url}`, '_blank');
  };

  const [gotData, setGotData] = useState(false);

  useEffect(() => {
    // Check if the user has visited the app before
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (hasVisitedBefore) {
      setFirstTimeUser(false);
    } else {
      // If it's the first time, set the flag in localStorage
      localStorage.setItem('hasVisitedBefore', 'true');
    }

    // Default image generation on initial render
    generateImages();
  }, []);

  return (
    <div className="App">
      <h1>Input for Your Comics</h1>
      <div>
        {firstTimeUser && <p>Please input text for your comics:</p>}
        {inputTexts.map((text, index) => (
          <div className='content_input' key={index} >
            <div className='txt_cont' >
            <label className = "text_h">Text for Image {index + 1}:</label>
            <input
              className = "text_input"
              type="text"
              value={text}
              onChange={(e) => handleTextChange(index, e.target.value)}
              />
            </div>
            <div className='ann_cont'>
            <label id = "anno">Annotation:</label>
            <input
              id = "anno_input"
              type="text"
              value={annotations[index]}
              onChange={(e) => handleAnnotationChange(index, e.target.value)}
              />
              </div>
          </div>
        ))}
        <button onClick={generateImages}>Generate Images</button>
        <button onClick={shareOnFacebook}>Share on Facebook</button>
        <button onClick={shareOnInstagram}>Share on Instagram</button>
      </div>
      {loading && <p>Data is being fetched!! Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading&&gotData&&<div>
        <h2>Your Comic</h2>
        {images.map((image, index) => (
          <div key={index} className="image-container">
            <img src={image} alt={`Generated Image ${index + 1}`} />
            {annotations[index] && <p className="annotation">{annotations[index]}</p>}
          </div>
        ))}
      </div>}
    </div>
  );
}

export default App;

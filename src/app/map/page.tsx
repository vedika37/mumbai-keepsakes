'use client';

import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Mumbai coordinates
const mumbaiCoords: [number, number] = [19.076, 72.8777];

// Import Leaflet dynamically
const MapPage = () => {
  const mapRef = useRef<any>(null); // Ref for storing Leaflet map instance
  const [pins, setPins] = useState<any[]>([]); // Store all pins
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [photo, setPhoto] = useState<File | null>(null); // Uploaded photo
  const [note, setNote] = useState(""); // User's note
  const [clickCoords, setClickCoords] = useState<[number, number] | null>(null); // Map click coords

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) {
      const L = require('leaflet');
      mapRef.current = L.map('map').setView(mumbaiCoords, 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>',
      }).addTo(mapRef.current);

      mapRef.current.on('click', (e: any) => {
        setClickCoords([e.latlng.lat, e.latlng.lng]);
        setShowModal(true);
      });
    }
  }, []);

  // Handle adding a pin
  const handleAddPin = async () => {
    if (!photo || !clickCoords) return;
  
    try {

      const token = process.env.NEXT_PUBLIC_IMGUR_ACCESS_TOKEN;
      if (!token) {
        console.error('Imgur access token is not set');
        return;
     }
      const imageInput = document.getElementById('imageInput') as HTMLInputElement | null;
      const imageFile = imageInput?.files?.[0];  // Access file input element
  
      if (!imageFile) {
        console.error('No image file selected');
        return;
      }
  
      // Read file as ArrayBuffer
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageBlob = new Blob([new Uint8Array(reader.result as ArrayBuffer)], {
          type: imageFile.type || 'image/jpeg', // Default to 'image/jpeg'
        });
  
        // Prepare FormData for Imgur API
        const formData = new FormData();
        formData.append('image', imageBlob);
        formData.append('type', 'file');
  
        // Imgur API Request
        const response = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ${token}',
          },
          body: formData,
        });
  
        const responseData = await response.json();
  
        if (response.ok && responseData.success) {
          const imgUrl = responseData.data.link;
  
          // Add the pin to the map
          const newPin = {
            lat: clickCoords[0],
            lng: clickCoords[1],
            note,
            photoUrl: imgUrl,
          };
  
          setPins((prev) => [...prev, newPin]);
  
          const L = require('leaflet');
          const marker = L.marker(clickCoords).addTo(mapRef.current);
          marker.bindPopup(`
            <b>Note:</b> ${note}<br>
            <img src="${imgUrl}" alt="Pin photo" style="width:100px;height:auto;"/>
          `);
  
          // Reset modal fields
          setPhoto(null);
          setNote('');
          setClickCoords(null);
          setShowModal(false);
        } else {
          console.error('Image upload failed:', responseData);
          alert('Failed to upload the image to Imgur.');
        }
      };
  
      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
      };
  
      reader.readAsArrayBuffer(imageFile); // Start reading the file as ArrayBuffer
    } catch (error) {
      console.error('Error during image upload:', error);
    }
  };
  

  return (
    <div className="map-container">
      <div id="map" style={{ height: '500px', width: '100%' }}></div>

      {showModal && (
        <div className="modal">
          <h2>Add Pin</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>Note:</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />

            <label>Upload Photo:</label>
            <input
              type="file"
              id="imageInput"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />

            <button type="button" onClick={handleAddPin}>Add Pin</button>
            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapPage), { ssr: false });

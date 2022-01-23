import React from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
const Gallery = () => {
  // ubaciti fotke lucice umjesto ovih
  const images = [
    {
      original: "https://robinzonlucica.hr/Slike/galerija/DSC_1545.jpg",
      thumbnail: "https://robinzonlucica.hr/Slike/thumb/DSC_1545.jpg",
    },
    {
      original: "https://robinzonlucica.hr/Slike/galerija/DSC_0986.jpg",
      thumbnail: "https://robinzonlucica.hr/Slike/galerija/DSC_0986.jpg",
    },
    {
      original: "https://robinzonlucica.hr/Slike/galerija/DSC_1659.jpg",
      thumbnail: "https://robinzonlucica.hr/Slike/galerija/DSC_1659.jpg",
    },
    {
      original: "https://robinzonlucica.hr/Slike/galerija/DSC_1900.jpg",
      thumbnail: "https://robinzonlucica.hr/Slike/galerija/DSC_1900.jpg",
    },
    {
      original: "https://robinzonlucica.hr/Slike/galerija/DSC_1673.jpg",
      thumbnail: "https://robinzonlucica.hr/Slike/galerija/DSC_1673.jpg",
    },
    {
      original: "https://robinzonlucica.hr/Slike/galerija/DSC_0309.jpg",
      thumbnail: "https://robinzonlucica.hr/Slike/galerija/DSC_0309.jpg",
    },
  ];
  return (
    <div>
      <ImageGallery items={images} />
    </div>
  );
};

export default Gallery;

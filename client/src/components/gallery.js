import { Box } from "@chakra-ui/react";
import React from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const Gallery = () => {
  // ubaciti fotke lucice umjesto ovih
  const images = [
    {
      original: "../assets/galerija/DSC_0648.jpg",
      thumbnail: "../assets/galerija/DSC_0648.jpg",
    },
    {
      original: "../assets/galerija/DSC_1545.jpg",
      thumbnail: "../assets/galerija/DSC_1545.jpg",
    },
    {
      original: "../assets/galerija/DSC_0583.jpg",
      thumbnail: "../assets/galerija/DSC_0583.jpg",
    },
    {
      original: "../assets/galerija/DSC_1016.jpg",
      thumbnail: "../assets/galerija/DSC_1016.jpg",
    },
    {
      original: "../assets/galerija/DSC_1024.jpg",
      thumbnail: "../assets/galerija/DSC_1024.jpg",
    },
    {
      original: "../assets/galerija/DSC_1529.jpg",
      thumbnail: "../assets/galerija/DSC_1529.jpg",
    },
    {
      original: "../assets/galerija/DSC_9869.jpg",
      thumbnail: "../assets/galerija/DSC_9869.jpg",
    },
    {
      original: "../assets/galerija/DSC_0309.jpg",
      thumbnail: "../assets/galerija/DSC_0309.jpg",
    },
  ];
  return (
    <>
      <Box py={{ lg: 20, base: 20 }} px={8} bg="#edf3f8">
        <ImageGallery items={images} />
      </Box>
    </>
  );
};

export default Gallery;

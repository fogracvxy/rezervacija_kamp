import React from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
const Gallery = () => {
  // ubaciti fotke lucice umjesto ovih
  const images = [
    {
      original: "https://i.gyazo.com/33080608da4345cf238cd4f4aa4c947f.jpg",
      thumbnail: "https://i.gyazo.com/33080608da4345cf238cd4f4aa4c947f.jpg",
    },
    {
      original: "https://i.gyazo.com/a8b9a2db92eaf278ea613173508b8409.jpg",
      thumbnail: "https://i.gyazo.com/a8b9a2db92eaf278ea613173508b8409.jpg",
      originalTitle: "test",
    },
    {
      original: "https://i.gyazo.com/f4f813f81e7466f4bf214769758707f2.jpg",
      thumbnail: "https://i.gyazo.com/f4f813f81e7466f4bf214769758707f2.jpg",
    },
    {
      original: "https://i.gyazo.com/81a09b5d6d2ef7052f4daf64abc57462.jpg",
      thumbnail: "https://i.gyazo.com/81a09b5d6d2ef7052f4daf64abc57462.jpg",
    },
  ];
  return (
    <div>
      <ImageGallery items={images} />
    </div>
  );
};

export default Gallery;

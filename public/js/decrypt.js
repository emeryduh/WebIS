function decryptImage(image) {
  if(image) {
    // Unset the onload function
    image.onload = "";

    // Create the canvas element to be used to perform the decrypt
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var width = canvas.width = image.naturalWidth;
    var height = canvas.height = image.naturalHeight;

    // Draw our image from the server
    ctx.drawImage(image, 0, 0);
  } else {
    var width = canvas.width;
    var height = canvas.height;
  }

  var imgData = ctx.getImageData(0, 0, width, height);
  var imgLength = imgData.data.length;

  console.log("Image size: " + imgLength);
  // Iterate over all RGBA values and "decrypt" it
  // Must jump in sets of 4 to affect each pixel
  var jumpLength = 4;
  for(var i = 0; i < imgLength; i += jumpLength * 2) {
    // Swap Red and Green hex values for every pixel pair
    var temp = imgData.data[i];
    imgData.data[i] = imgData.data[i + 5];
    imgData.data[i + 5] = temp;
  }

  // Update the image tag with the decrypted image
  ctx.putImageData(imgData, 0, 0);
  image.src = canvas.toDataURL();
}

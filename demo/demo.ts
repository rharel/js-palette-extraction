import { palette_from_image_element } from "../source/image_palette_extraction";

function on_selected_image_change(input: HTMLInputElement) {
  if (input.files.length !== 1) {
    return;
  }
  const file = input.files.item(0);
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.addEventListener("load", () => {
    const palette = palette_from_image_element(image, 32, 10);
    console.log(palette);
    const color_elements = document.querySelectorAll<HTMLElement>(".color");
    for (let i = 0; i < palette.length; i += 1) {
      const color = palette[i];
      color_elements.item(
        i
      ).style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
  });
}

function setup() {
  const input = document.getElementById("selected-image");
  if (!(input instanceof HTMLInputElement)) {
    return;
  }
  input.addEventListener("change", () => on_selected_image_change(input));
}

window.addEventListener("DOMContentLoaded", setup);

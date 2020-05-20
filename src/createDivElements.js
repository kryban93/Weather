//FUNCTION THAT CREATES DIVS
const createDivElement = (isMain = false, setName) => {
  console.log("recurrentDiv");
  let box, nameTag, valTag;
  box = document.createElement("div");
  nameTag = document.createElement("h3");
  valTag = document.createElement("h4");
  isMain ? box.classList.add("content__element--main") : box.classList.add("content__element");
  isMain ? nameTag.classList.add("content__title--main") : nameTag.classList.add("content__title");
  isMain ? valTag.classList.add("content__value--main") : valTag.classList.add("content__value");

  box.dataset.name = setName;
  box.appendChild(nameTag);
  box.appendChild(valTag);

  return box;
};

export default createDivElement;

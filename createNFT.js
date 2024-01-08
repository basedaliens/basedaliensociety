const svgElement = document.getElementById("alien");

const traits = {};

window.$layers.forEach((_urls) => {
  let _url = $hl.randomElement(_urls);
  let [, key, value] = _url.split("/");
  // just in case
  if (!key || !value) {
    _url = $hl.randomElement(_urls);
    [, key, value] = _url.split("/");
  }
  // add trait
  traits[key] = value.replace(/\.png$/, "");
  // gas mask replaces Eyes and Mouth
  if (_url === "layers/Headwear/Gas Mask.png") {
    traits["Eyes"] = "Gas Mask";
    traits["Mouth"] = "Gas Mask";
    replaceGasMask();
  }
  // create html / svg tags
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("id", key + "-Layer");
  // no clothes image if naked
  if (_url === "layers/Clothes/Naked") {
    let descElem = createDesc("Naked");
    group.appendChild(descElem);
  } else {
    let imgElem = createImage(_url);
    group.appendChild(imgElem);
  }

  // append layer group to svg
  svgElement.appendChild(group);
});

traits.Seed = $hl.tx.hash + $hl.tx.tokenId;
$hl.token.setTraits(traits);
$hl.token.setName(`Based Alien #${$hl.tx.tokenId}`);
$hl.token.setDescription(
  `Based ${traits["Avatar"]}${
    traits["Clothes"] !== "Naked" ? " wearing " + traits["Clothes"] : ""
  } with ${traits["Headwear"]}.`
);

// functions

function createImage(_url) {
  const imgElem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  imgElem.setAttribute("href", _url);
  imgElem.setAttribute("width", "2048");
  imgElem.setAttribute("height", "2048");
  imgElem.setAttribute("x", "0");
  imgElem.setAttribute("y", "0");
  return imgElem;
}

function createDesc(_text) {
  let descElem = document.createElementNS("http://www.w3.org/2000/svg", "desc");
  descElem.textContent = _text;
  return descElem;
}

function replaceGasMask() {
  const gEyes = document.getElementById("Eyes-Layer");
  const gMouth = document.getElementById("Mouth-Layer");
  const eyeImg = gEyes.querySelector("image");
  const mouthImg = gMouth.querySelector("image");
  if (eyeImg) {
    let descElem = createDesc("Gas Mask");
    gEyes.replaceChild(descElem, eyeImg);
  }
  if (mouthImg) {
    let descElem = createDesc("Gas Mask");
    gMouth.replaceChild(descElem, mouthImg);
  }
}

let glitchInterval;
let glitchTimeout;
function glitchImages() {
  let i = 3;
  clearInterval(glitchInterval);
  glitchInterval = setInterval(() => {
    let _url = $hl.randomElement($layers[i]);
    let [, key] = _url.split("/");
    let group = document.getElementById(key + "-Layer");
    let image = group.querySelector("image");
    let ogHref = image.getAttribute("href");
    image.setAttribute("href", _url);
    clearTimeout(glitchTimeout);
    glitchTimeout = setTimeout(() => {
      image.setAttribute("href", ogHref);
    }, 300);
    // skip headwear
    if (i < $layers.length - 2) {
      i++;
    } else {
      // skip background / avatar / clothes
      i = 3;
    }
  }, 3000);
}
// after 15 seconds start glitching the eyes and mouth every 3 seconds
setTimeout(() => glitchImages(), 12000);

let timeout;
let descElem = createDesc("Naked");
let ogClothesImg;
// remote clothes on click
svgElement.addEventListener("click", function () {
  let clothesGroup = document.getElementById("Clothes-Layer");
  let imageElem = clothesGroup.querySelector("image");
  if (imageElem) {
    clearTimeout(timeout);
    ogClothesImg = imageElem;
    clothesGroup.replaceChild(descElem, imageElem);
    // put clothes back on after 30 sec
    timeout = setTimeout(() => {
      clothesGroup.replaceChild(imageElem, descElem);
    }, 30000);
  } else {
    clearTimeout(timeout);
    let desc = clothesGroup.querySelector("desc");
    if (desc && ogClothesImg) {
      clothesGroup.replaceChild(ogClothesImg, desc);
    }
  }
});

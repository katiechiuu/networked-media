const colors = ["pink", "blue", "teal", "orange"];

const plotBoxes = [
  { left: 27.02, top: 46.78, width: 5.34, height: 6.93 },
  { left: 34.31, top: 46.78, width: 5.66, height: 7.03 },
  { left: 44.66, top: 27.25, width: 6.64, height: 8.5 },
  { left: 53.91, top: 27.25, width: 6.97, height: 8.69 },
  { left: 64.06, top: 24.71, width: 7.55, height: 10.84 },
  { left: 74.48, top: 24.71, width: 7.55, height: 10.84 },
  { left: 44.73, top: 40.43, width: 6.58, height: 8.4 },
  { left: 53.71, top: 40.53, width: 7.1, height: 8.3 },
  { left: 64.06, top: 40.72, width: 7.55, height: 8.2 },
  { left: 74.48, top: 40.53, width: 7.62, height: 8.4 },
  { left: 35.61, top: 62.7, width: 5.14, height: 8.11 },
  { left: 42.58, top: 62.7, width: 5.66, height: 8.11 },
];

const houseParts = {
  base: { x: 30, y: 52, size: 100 },
  roof: {
    flat: { x: 30, y: 22, size: 100 },
    round: { x: 30, y: 18, size: 100 },
    triangular: { x: 30, y: 7, size: 100 },
  },
  chimney: {
    flat: { x: 75, y: 38, size: 42 },
    round: { x: 75, y: 32, size: 42 },
    triangular: { x: 89, y: 27, size: 38 },
  },
  door: { x: 30, y: 87, size: 56 },
  window: {
    square: { x: 75, y: 85, size: 50 },
    circle: { x: 82, y: 85, size: 42 },
    cat: { x: 72, y: 80, size: 50 },
  },
};

let currentHouse = {
  roofType: "round",
  roofColor: "pink",
  doorColor: "pink",
  windowStyle: "square",
  windowColor: "pink",
  chimneyEnabled: true,
  chimneyColor: "pink",
  catWindowEnabled: false,
  houseName: "",
  houseNote: "",
};

let houses = [];
let selectedPlot = null;
let selectedHouse = null;
let images = {};

let previewCanvas;
let detailsCanvas;
let detailsCard;
let plotLayer;
let hoverCard;
let statusMessage;
let chimneyEnabled;
let catWindowEnabled;
let houseNameInput;
let houseNoteInput;
let detailsTitle;
let detailsRoof;
let detailsWindow;
let detailsExtras;
let detailsDate;
let detailsNote;

window.onload = async function () {
  getElements();
  loadSaved();
  addClickEvents();
  await loadImages();
  drawPage();
};

function getElements() {
  previewCanvas = document.getElementById("preview-canvas");
  detailsCanvas = document.getElementById("details-canvas");
  detailsCard = document.getElementById("details-card");
  plotLayer = document.getElementById("plot-layer");
  hoverCard = document.getElementById("hover-card");
  statusMessage = document.getElementById("status-message");
  chimneyEnabled = document.getElementById("chimney-enabled");
  catWindowEnabled = document.getElementById("cat-window-enabled");
  houseNameInput = document.getElementById("house-name");
  houseNoteInput = document.getElementById("house-note");
  detailsTitle = document.getElementById("details-title");
  detailsRoof = document.getElementById("details-roof");
  detailsWindow = document.getElementById("details-window");
  detailsExtras = document.getElementById("details-extras");
  detailsDate = document.getElementById("details-date");
  detailsNote = document.getElementById("details-note");
}

function loadSaved() {
  let savedCurrentHouse = getSavedItem("ourtown-draft");
  let savedHouses = getSavedItem("ourtown-houses");

  if (savedCurrentHouse) {
    currentHouse = makeHouse(savedCurrentHouse);
  }

  if (savedHouses) {
    for (let i = 0; i < savedHouses.length; i++) {
      houses.push(makeHouse(savedHouses[i]));
    }
  }
}

function addClickEvents() {
  let buttons = document.querySelectorAll("[data-key]");

  for (let i = 0; i < buttons.length; i++) {
    let button = buttons[i];

    button.addEventListener("click", function () {
      let key = button.dataset.key;
      let value = button.dataset.value;

      currentHouse[key] = value;

      if (key === "windowStyle" && value === "circle") {
        currentHouse.catWindowEnabled = false;
      }

      saveDraft();
      drawPage();
    });
  }

  chimneyEnabled.addEventListener("change", function () {
    currentHouse.chimneyEnabled = chimneyEnabled.checked;
    saveDraft();
    drawPage();
  });

  catWindowEnabled.addEventListener("change", function () {
    currentHouse.catWindowEnabled = catWindowEnabled.checked;

    if (currentHouse.catWindowEnabled) {
      currentHouse.windowStyle = "square";
    }

    saveDraft();
    drawPage();
  });

  houseNameInput.addEventListener("input", function () {
    currentHouse.houseName = houseNameInput.value;
    saveDraft();
  });

  houseNoteInput.addEventListener("input", function () {
    currentHouse.houseNote = houseNoteInput.value;
    saveDraft();
  });

  document.getElementById("move-in-button").addEventListener("click", moveIn);
  document.getElementById("details-close").addEventListener("click", closeDetails);
}

async function loadImages() {
  let fileNames = ["housebase.png", "window1.png"];

  for (let i = 0; i < colors.length; i++) {
    let color = colors[i];
    fileNames.push(color + "flatroof.png");
    fileNames.push(color + "roundroof.png");
    fileNames.push(color + "triangularroof.png");
    fileNames.push(color + "door.png");
    fileNames.push(getSquareWindowFileName(color));
    fileNames.push(color + "circlewindow.png");
    fileNames.push(color + "catwindow.png");
    fileNames.push(color + "chimney.png");
  }

  statusMessage.textContent = "loading assets...";

  for (let i = 0; i < fileNames.length; i++) {
    let fileName = fileNames[i];
    images[fileName] = await loadImage("/uploads/" + fileName);
  }

  statusMessage.textContent = "your house preview is ready.";
}

function drawPage() {
  fillInputs();
  highlightButtons();
  drawHouse(previewCanvas, currentHouse);
  drawPlots();
  drawDetails();
}

function fillInputs() {
  chimneyEnabled.checked = currentHouse.chimneyEnabled;
  catWindowEnabled.checked = currentHouse.catWindowEnabled;
  houseNameInput.value = currentHouse.houseName;
  houseNoteInput.value = currentHouse.houseNote;

  let circleButton = document.getElementById("circle-button");
  circleButton.disabled = currentHouse.catWindowEnabled;

  if (currentHouse.catWindowEnabled) {
    circleButton.style.opacity = "0.45";
  } else {
    circleButton.style.opacity = "1";
  }

  let chimneyButtons = document.querySelectorAll(".chimney-color-button");

  for (let i = 0; i < chimneyButtons.length; i++) {
    let button = chimneyButtons[i];
    button.disabled = !currentHouse.chimneyEnabled;

    if (currentHouse.chimneyEnabled) {
      button.style.opacity = "1";
    } else {
      button.style.opacity = "0.45";
    }
  }
}

function highlightButtons() {
  let buttons = document.querySelectorAll("[data-key]");

  for (let i = 0; i < buttons.length; i++) {
    let button = buttons[i];
    let key = button.dataset.key;
    let value = button.dataset.value;

    if (currentHouse[key] === value) {
      button.classList.add("is-active");
    } else {
      button.classList.remove("is-active");
    }
  }
}

function drawPlots() {
  plotLayer.innerHTML = "";

  for (let i = 0; i < plotBoxes.length; i++) {
    let box = plotBoxes[i];
    let house = getHouseInPlot(i);
    let button = document.createElement("button");

    button.type = "button";
    button.style.left = box.left + "%";
    button.style.top = box.top + "%";
    button.style.width = box.width + "%";
    button.style.height = box.height + "%";

    if (house) {
      drawHouseButton(button, house);
    } else {
      drawEmptyPlot(button, i);
    }

    plotLayer.appendChild(button);
  }
}

function drawHouseButton(button, house) {
  button.className = "plot-house";

  if (selectedHouse === house.id) {
    button.classList.add("is-selected");
  }

  let canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 160;
  drawHouse(canvas, house);
  button.appendChild(canvas);

  button.addEventListener("mouseenter", function (event) {
    showHover(event, house.houseName || "house", getRoofLabel(house.roofType) + " roof", house.houseNote || "click for full details");
  });

  button.addEventListener("mouseleave", hideHover);

  button.addEventListener("click", function () {
    selectedHouse = house.id;
    selectedPlot = house.plotIndex;
    drawPage();
  });
}

function drawEmptyPlot(button, index) {
  button.className = "plot-slot";

  if (selectedPlot === index) {
    button.classList.add("is-selected");
  }

  button.addEventListener("mouseenter", function (event) {
    showHover(event, "empty plot", "plot " + (index + 1), "click to place your house here");
  });

  button.addEventListener("mouseleave", hideHover);

  button.addEventListener("click", function () {
    selectedPlot = index;
    selectedHouse = null;
    statusMessage.textContent = "plot " + (index + 1) + " selected. press move in when ready.";
    drawPage();
  });
}

function drawDetails() {
  let house = null;

  for (let i = 0; i < houses.length; i++) {
    if (houses[i].id === selectedHouse) {
      house = houses[i];
    }
  }

  clearCanvas(detailsCanvas);

  if (!house) {
    detailsCard.hidden = true;
    return;
  }

  detailsCard.hidden = false;
  detailsTitle.textContent = house.houseName || "house";
  detailsRoof.textContent = getRoofLabel(house.roofType) + " roof, " + house.roofColor + " trim";
  detailsWindow.textContent = getWindowText(house);
  detailsExtras.textContent = getExtrasText(house);
  detailsDate.textContent = new Date(house.movedInAt).toLocaleString();
  detailsNote.textContent = house.houseNote || "no note left for neighbors.";

  drawHouse(detailsCanvas, house);
}

function moveIn() {
  let plotIndex = selectedPlot;

  if (plotIndex === null || getHouseInPlot(plotIndex)) {
    plotIndex = getFirstOpenPlot();
  }

  if (plotIndex === -1) {
    statusMessage.textContent = "the island is full.";
    return;
  }

  let house = makeHouse(currentHouse);
  house.id = "house-" + houses.length;
  house.plotIndex = plotIndex;
  house.movedInAt = new Date().toISOString();
  house.houseName = currentHouse.houseName || "plot " + (plotIndex + 1);
  house.houseNote = currentHouse.houseNote;

  houses.push(house);
  selectedPlot = plotIndex;
  selectedHouse = house.id;

  saveHouses();
  drawPage();
  statusMessage.textContent = house.houseName + " moved in.";
}

function drawHouse(canvas, house) {
  let context = canvas.getContext("2d");
  clearCanvas(canvas);

  drawLayer(context, "housebase.png", houseParts.base);
  drawLayer(context, getRoofFileName(house), houseParts.roof[house.roofType]);

  if (house.chimneyEnabled) {
    drawLayer(context, house.chimneyColor + "chimney.png", houseParts.chimney[house.roofType]);
  }

  drawLayer(context, house.doorColor + "door.png", houseParts.door);
  drawLayer(context, getWindowFileName(house), getWindowBox(house));
}

function drawLayer(context, fileName, box) {
  let image = images[fileName];

  if (!image) {
    return;
  }

  context.drawImage(image, box.x, box.y, box.size, box.size);
}

function getHouseInPlot(index) {
  for (let i = 0; i < houses.length; i++) {
    if (houses[i].plotIndex === index) {
      return houses[i];
    }
  }
  return null;
}

function getRoofFileName(house) {
  return house.roofColor + house.roofType + "roof.png";
}

function getWindowFileName(house) {
  if (house.catWindowEnabled) {
    return house.windowColor + "catwindow.png";
  }

  if (house.windowStyle === "circle") {
    return house.windowColor + "circlewindow.png";
  }

  return getSquareWindowFileName(house.windowColor);
}

function getSquareWindowFileName(color) {
  if (color === "pink") {
    return "window1.png";
  }

  return color + "window.png";
}

function getWindowBox(house) {
  if (house.catWindowEnabled) {
    return houseParts.window.cat;
  }

  return houseParts.window[house.windowStyle];
}

function getRoofLabel(roofType) {
  if (roofType === "round") {
    return "rounded";
  }

  return roofType;
}

function getWindowText(house) {
  if (house.catWindowEnabled) {
    return house.windowColor + " cat window";
  }

  return house.windowColor + " " + house.windowStyle + " window";
}

function getExtrasText(house) {
  let extras = "";

  if (house.chimneyEnabled) {
    extras = house.chimneyColor + " chimney";
  }

  if (house.catWindowEnabled) {
    if (extras !== "") {
      extras = extras + ", cat in window";
    } else {
      extras = "cat in window";
    }
  }

  if (extras === "") {
    return "no extras";
  }

  return extras;
}

function getFirstOpenPlot() {
  for (let i = 0; i < plotBoxes.length; i++) {
    if (!getHouseInPlot(i)) {
      return i;
    }
  }

  return -1;
}

function showHover(event, title, lineOne, lineTwo) {
  hoverCard.hidden = false;
  hoverCard.innerHTML = "";

  let strong = document.createElement("strong");
  strong.textContent = title;

  let spanOne = document.createElement("span");
  spanOne.textContent = lineOne;

  let spanTwo = document.createElement("span");
  spanTwo.textContent = lineTwo;

  hoverCard.appendChild(strong);
  hoverCard.appendChild(spanOne);
  hoverCard.appendChild(spanTwo);

  hoverCard.style.left = event.clientX + 18 + "px";
  hoverCard.style.top = event.clientY - 14 + "px";
}

function hideHover() {
  hoverCard.hidden = true;
}

function closeDetails() {
  selectedHouse = null;
  drawPage();
}

function makeHouse(data) {
  let house = {};
  house.roofType = data.roofType || "round";
  house.roofColor = data.roofColor || "pink";
  house.doorColor = data.doorColor || "pink";
  house.windowStyle = data.windowStyle || "square";
  house.windowColor = data.windowColor || "pink";
  house.chimneyEnabled = data.chimneyEnabled;
  house.chimneyColor = data.chimneyColor || "pink";
  house.catWindowEnabled = data.catWindowEnabled;
  house.houseName = data.houseName || "";
  house.houseNote = data.houseNote || "";
  return house;
}

function saveDraft() {
  localStorage.setItem("ourtown-draft", JSON.stringify(currentHouse));
}

function saveHouses() {
  localStorage.setItem("ourtown-houses", JSON.stringify(houses));
}

function getSavedItem(key) {
  let item = localStorage.getItem(key);

  if (!item) {
    return null;
  }

  return JSON.parse(item);
}

function clearCanvas(canvas) {
  let context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function loadImage(src) {
  return new Promise(function (resolve, reject) {
    let image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = function () {
      reject(image);
    };
    image.src = src;
  });
}
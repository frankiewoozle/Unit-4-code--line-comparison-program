let numLines = 6;
let startXRatio = 0.15;
let boxWidthRatio = 0.12;
let boxHeightRatio = 0.035;
let dotSpacingRatio = 0.07;

let mode = "stops";
let stopsBtn, datesBtn, timeBtn, carriageBtn, passengersBtn, frequencyBtn;
let overlayLabels = []; //connected to divs for text

let targetY = [];  //where the lines want to move to, y is up
let animSpeed = 0.1; //how fast lines rearrange 

let selectedImage = null;
let lineImages = {};
let originalOrder = [];

let verticalOffsetRatio = 0.1;

let turbulenceLabelDiv;


//to create buttons and add new information add things here
let lineInfo = [
    {
        color: [0, 152, 216, 200], label: "Victoria Line",
        stations: ["Pimlico", "Victoria", "Green Park", "Oxford Circus", "Warren Street", "Euston"],
        dates: ["1968", "1972", "1969", "1906", "1969", "1907", "1968"],
        times: [11],
        turbulence: [6.4, 12.2, 9.2, 10.4, 9],
        carriage: "2009 stock (updated on service: 2009-2011)",
        passengers: "850,000 per day",
        frequency: "every 1-2 minutes"
    },
    {
        color: [0, 0, 0, 200], label: "Northern Line",
        stations: ["Euston", "Warren Street", "Goodge Street", "Tottenham Court Road", "Leicester Square", "Charing Cross", "Embankment"],
        dates: ["1890", "1907", "1907", "1907", "1907", "1906", "1907", "1906"],
        times: [7],
        turbulence: [4.4, 4.6, 5.6, 2.3, 6.5, 5.1],
        carriage: "1995 Stock (updated on service: 1998-2001)",
        passengers: "950,000 per day",
        frequency: "every 2-3 minutes"
    },
    {
        color: [255, 211, 41, 200], label: "Circle Line",
        stations: ["Embankment", "Westminster", "St James's Park", "Victoria", "Sloane Square", "South Kensington", "Gloucester Road", "High Street Kensington", "Notting Hill Gate", "Bayswater", "Paddington"],
        dates: ["1884", "1906", "1868", "1868", "1868", "1868", "1868", "1868", "1868", "1868", "1868", "1868"],
        times: [24],
        turbulence: [3.1, 3.4, 5.3, 11.2, 6.9, 8.9, 13.1, 6.7, 7.8, 6.4],
        carriage: "S7 and S8 Stock (updated on service: 2010)",
        passengers: "300,000 per day",
        frequency: "every 5-10 minutes"
    },
    {
        color: [119, 61, 189, 200], label: "Elizabeth Line",
        stations: ["Paddington", "Bond Street", "Tottenham Court Road", "Farringdon", "Liverpool Street"],
        dates: ["2022", "2022", "2022", "2022", "2022", "2022"],
        times: [11],
        turbulence: [2.9, 4.2, 3.6, 2.9],
        carriage: "Class 345 Aventra (updated on service: 2022)",
        passengers: "700,000 per day",
        frequency: "every 2-5 minutes"
    },
    {
        color: [220, 36, 31, 200], label: "Central Line",
        stations: ["Liverpool Street", "Bank", "St Pauls", "Chancery Lane", "Holborn", "Tottenham Court Road", "Oxford Circus"],
        dates: ["1900", "1900", "1900", "1900", "1900", "1900", "1900", "1900"],
        times: [11],
        turbulence: [4.7, 8.5, 21.2, 6.6, 5.4, 7.7],
        carriage: "1992 Stock (updated on service: 1993, under refurbishment since 2019)",
        passengers: "1,000,000 per day",
        frequency: "every 2-3 minutes"
    },
    {
        color: [178, 99, 0, 200], label: "Bakerloo Line",
        stations: ["Oxford Circus", "Piccadilly Circus", "Charing Cross", "Embankment", "Waterloo", "Lambeth North", "Elephant & Castle"],
        dates: ["1906", "1906", "1906", "1906", "1906", "1906", "1906", "1906"],
        times: [11],
        turbulence: [13.6, 9.4, 4, 10.4, 13.6, 9.1],
        carriage: "1972 Stock (the same since opening)",
        passengers: "200,000 per day",
        frequency: "5-7 minutes"
    }
];

async function setup() {

    //set up canvas and overall font 
    pixelDensity(1);
    createCanvas(windowWidth, windowHeight);
    textFont("Helvetica");
    textAlign(CENTER, CENTER);

    //creates the buttons at the top
    stopsBtn = createButton("Stops");
    datesBtn = createButton("Dates");
    timeBtn = createButton("Time");
    carriageBtn = createButton("Carriages");
    passengersBtn = createButton("Passengers");
    frequencyBtn = createButton("Frequency");

    //colours the buttons at the top, also calls to the style button function
    styleButton(stopsBtn, "#71b700");
    styleButton(datesBtn, "#ac0707");
    styleButton(timeBtn, "#f89008");
    styleButton(carriageBtn, "#4b6cb7");
    styleButton(passengersBtn, "#2a9d8f");
    styleButton(frequencyBtn, "#e76f51");

    //calls to mouse pressed function when button pressed
    stopsBtn.mousePressed(() => changeMode("stops"));
    datesBtn.mousePressed(() => changeMode("dates"));
    timeBtn.mousePressed(() => changeMode("time"));
    carriageBtn.mousePressed(() => changeMode("carriage"));
    passengersBtn.mousePressed(() => changeMode("passengers"));
    frequencyBtn.mousePressed(() => changeMode("frequency"));

    //calls to these functions, because the page resizes so they keep the maths together
    positionButtons();
    createOverlayLabels();

    targetY = Array(lineInfo.length).fill(0);
    originalOrder = [...lineInfo];

    lineImages = {
        "Victoria Line": await loadImage("assets/victoria line information ticket.png"),
        "Northern Line": await loadImage("assets/northern information ticket.png"),
        "Circle Line": await loadImage("assets/circle information ticket.png"),
        "Elizabeth Line": await loadImage("assets/elizabeth information ticket.png"),
        "Central Line": await loadImage("assets/central information ticket.png"),
        "Bakerloo Line": await loadImage("assets/bakerloo information ticket.png")
    };

    turbulenceImages = {

        "Victoria Line": await loadImage("assets/victoriaBuild.png"),
        "Northern Line": await loadImage("assets/northernBuild.png"),
        "Circle Line": await loadImage("assets/circleBuild.png"),
        "Elizabeth Line": await loadImage("assets/elizabethBuild.png"),
        "Central Line": await loadImage("assets/centralBuild.png"),
        "Bakerloo Line": await loadImage("assets/bakerlooBuild.png")
    };

    //details for the label that shows up under turbulance drawing
    turbulenceLabelDiv = createDiv("All turbulance drawings from this line layered");
    turbulenceLabelDiv.style("position", "absolute");
    turbulenceLabelDiv.style("color", "white");
    turbulenceLabelDiv.style("font-size", "18px");
    turbulenceLabelDiv.style("font-family", "monospace");
    turbulenceLabelDiv.style("text-align", "center");
    turbulenceLabelDiv.style("pointer-events", "none");
    turbulenceLabelDiv.hide();

    //so it opens on stops, got rid of that weird bunching at the top
    changeMode("stops");
}
//so it fits the screen
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    positionButtons();
    createOverlayLabels();
}

function mousePressed() {

    //if an image is already shown when clicked again will stop showing
    if (selectedImage) {
        selectedImage = null;
        return;
    }

    let boxWidth = width * boxWidthRatio;
    let boxHeight = height * boxHeightRatio;
//too click names of lines and get information ticket shown
    lineInfo.forEach((line, lineIndex) => {
        let lineSpacing = height / (numLines + 2);
        let verticalOffset = height * verticalOffsetRatio;
        let y = line.currentY || (verticalOffset + lineSpacing + lineIndex * lineSpacing);

        let boxX = 10;
        let boxY = y - boxHeight / 2;
        if (
            mouseX >= boxX &&
            mouseX <= boxX + boxWidth &&
            mouseY >= boxY &&
            mouseY <= boxY + boxHeight
        ) {
            selectedImage = lineImages[line.label];
            return;
        }
//to click turbulance at end of line and have those images shown
        overlayLabels.forEach(lbl => {
            if (lbl.lineIndex === lineIndex && lbl.type === "turb") {
                let divX = lbl.div.elt.offsetLeft;
                let divY = lbl.div.elt.offsetTop;
                let divW = lbl.div.elt.offsetWidth;
                let divH = lbl.div.elt.offsetHeight;

                if (
                    mouseX >= divX &&
                    mouseX <= divX + divW &&
                    mouseY >= divY &&
                    mouseY <= divY + divH
                ) {
                    selectedImage = turbulenceImages[line.label];
                    console.log("clicked");
                    textAlign(CENTER, TOP);
                }
            }
        });
    });
}
//gives the buttons a style
function styleButton(btn, color) {
    btn.style("background-color", color);
    btn.style("color", "white");
    btn.style("border", "none");
    btn.style("padding", "10px 20px");
    btn.style("border-radius", "20px");
    btn.style("font-size", "14px");
    btn.style("cursor", "pointer");
    btn.style("font-family", "monospace");
}

//buttons at top so theyre evenly spaced
function positionButtons() {
    let buttons = [stopsBtn, datesBtn, timeBtn, carriageBtn, passengersBtn, frequencyBtn];
    let totalWidth = width;
    let spacing = totalWidth / (buttons.length + 1);
    let y = 20;
    buttons.forEach((btn, i) => {
        btn.position(spacing * (i + 1) - btn.size().width / 2, y);
    });
}

//flips between the different modes, while keeping the turbulance visible, for comparing
function changeMode(newMode) {
    mode = newMode;

    if (mode === "time") {
        lineInfo.sort((a, b) => a.times.reduce((sum, t) => sum + t, 0) - b.times.reduce((sum, t) => sum + t, 0));
    }
    else if (mode === "dates") {
        lineInfo.sort((a, b) => parseInt(b.dates[0]) - parseInt(a.dates[0]));
    }
    else if (mode === "carriage") {
        lineInfo.sort((a, b) => {
            let aYear = parseInt(a.carriage.match(/\d{4}/)?.[0] || 0);
            let bYear = parseInt(b.carriage.match(/\d{4}/)?.[0] || 0);
            return aYear - bYear;
        });
    }
    else if (mode === "passengers") {
        lineInfo.sort((a, b) => {
            let aNum = parseInt(a.passengers.replace(/,/g, '').match(/\d+/)[0]);
            let bNum = parseInt(b.passengers.replace(/,/g, '').match(/\d+/)[0]);
            return aNum - bNum;
        });
    }
    else if (mode === "frequency") {
        lineInfo.sort((a, b) => {
            let aMin = parseInt(a.frequency.match(/\d+/)?.[0] || 0);
            let bMin = parseInt(b.frequency.match(/\d+/)?.[0] || 0);
            return aMin - bMin;
        });
    }
    else {
        lineInfo.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));
    }

    //overlays, did this because when just using text, for some reason it all looked smudged
    createOverlayLabels();

    //depending on which mode is chosen show relevant labels, but always show turbulance
    overlayLabels.forEach(lbl => {
        if ((mode === "stops" && lbl.type === "station") ||
            (mode === "time" && lbl.type === "time") ||
            (mode === "dates" && lbl.type === "date") ||
            (mode === "carriage" && lbl.type === "carriage") ||
            (mode === "passengers" && lbl.type === "passengers") ||
            (mode === "frequency" && lbl.type === "frequency") ||
            lbl.type === "turb") {
            lbl.div.show();
        } else {
            lbl.div.hide();
        }
    });

    let lineSpacing = height / (numLines + 2);
    let verticalOffset = height * verticalOffsetRatio;

    for (let i = 0; i < lineInfo.length; i++) {
        targetY[i] = verticalOffset + lineSpacing + i * lineSpacing;
    }
}

//what each mode has as its overlays
function createOverlayLabels() {
    overlayLabels.forEach(lbl => lbl.div.remove());
    overlayLabels = [];

    let dynamicFont = max(12, width * 0.01);

    lineInfo.forEach((line, lineIndex) => {
        //station labels
        line.stations.forEach((station, i) => {
            let div = createDiv(wrapText(station));
            styleOverlayDiv(div, dynamicFont);
            overlayLabels.push({ div, type: "station", lineIndex, i });
            if (mode !== "stops") div.hide();
        });

        //date labels at end of track
        let dateDiv = createDiv("Officially opened in: " + line.dates[0]);
        styleOverlayDiv(dateDiv, max(12, width * 0.008));
        overlayLabels.push({ div: dateDiv, type: "date", lineIndex, i: 0 });
        if (mode !== "dates") dateDiv.hide();

        //time labels
        line.times.forEach((time, i) => {
            let div = createDiv(time + " min");
            styleOverlayDiv(div, dynamicFont);
            overlayLabels.push({ div, type: "time", lineIndex, i });
            if (mode !== "time") div.hide();
        });

        //carriage at end of track
        let carriageDiv = createDiv("");
        styleOverlayDiv(carriageDiv, dynamicFont);
        overlayLabels.push({ div: carriageDiv, type: "carriage", lineIndex });
        if (mode !== "carriage") carriageDiv.hide();

        //passengers at end of track
        let passengersDiv = createDiv("");
        styleOverlayDiv(passengersDiv, dynamicFont);
        overlayLabels.push({ div: passengersDiv, type: "passengers", lineIndex });
        if (mode !== "passengers") passengersDiv.hide();

        //frequency at end of track
        let frequencyDiv = createDiv("");
        styleOverlayDiv(frequencyDiv, dynamicFont);
        overlayLabels.push({ div: frequencyDiv, type: "frequency", lineIndex });
        if (mode !== "frequency") frequencyDiv.hide();

        //turbulence at end of track
        let turbDiv = createDiv("");
        styleOverlayDiv(turbDiv, dynamicFont);
        overlayLabels.push({ div: turbDiv, type: "turb", lineIndex, i: 0 });
    });
}

//stops labels going off screen or clashing with each other
function wrapText(text, maxChars = 12) {
    let words = text.split(" ");
    let lines = [];
    let currentLine = "";
    for (let w of words) {
        if ((currentLine + " " + w).trim().length > maxChars) {
            if (currentLine.length > 0) lines.push(currentLine);
            currentLine = w;
        } else {
            currentLine = currentLine ? currentLine + " " + w : w;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines.join("<br>");
}

//what the labels look like overlayed
function styleOverlayDiv(div, fontSize) {
    div.style("position", "absolute");
    div.style("font-size", fontSize + "px");
    div.style("font-family", "monospace");
    div.style("color", "#000");
    div.style("text-align", "center");
    div.style("pointer-events", "none");
    div.style("line-height", "1.2em");
    div.style("z-index", "1");
}

function draw() {
    background(240);

    //how things are positioned on the screen, so it can be resized on different computers
    let lineSpacing = height / (numLines + 2);
    let verticalOffset = height * verticalOffsetRatio;
    let startX = width * startXRatio;
    let boxWidth = width * boxWidthRatio;
    let boxHeight = height * boxHeightRatio;
    let dotSpacing = width * dotSpacingRatio;

    lineInfo.forEach((line, lineIndex) => {
        if (targetY[lineIndex] === undefined) {
            targetY[lineIndex] = verticalOffset + lineSpacing + lineIndex * lineSpacing;
        }

        if (!line.currentY) line.currentY = targetY[lineIndex];
        line.currentY += (targetY[lineIndex] - line.currentY) * animSpeed;
        let y = line.currentY;

        let xCoordinates = line.stations.map((_, i) => startX + i * dotSpacing);

        //drawing lines
        stroke(...line.color);
        strokeWeight(10);
        noFill();
        beginShape();
        xCoordinates.forEach(x => vertex(Math.round(x), Math.round(y)));
        endShape();

        //drawing the station dots
        stroke(0);
        strokeWeight(5);
        fill(255);
        xCoordinates.forEach(x => circle(Math.round(x), Math.round(y), 25));

        //turbulance bars to measure per stop, have different shades to show the severity of the turbulance
        let turbMin = Math.min(...line.turbulence);
        let turbMax = Math.max(...line.turbulence);
        for (let i = 0; i < xCoordinates.length - 1; i++) {
            let midX = (xCoordinates[i] + xCoordinates[i + 1]) / 2;
            let midY = y - 20;
            let turbValue = line.turbulence[i];
            let tColor = lerpColor(color(0, 255, 0), color(255, 0, 0), (turbValue - turbMin) / (turbMax - turbMin));
            fill(tColor);
            noStroke();
            rect(midX - 5, midY - 10, 10, 20);
        }

        //labels
        overlayLabels.forEach(lbl => {
            if (lbl.lineIndex === lineIndex) {
                let div = lbl.div;
                if (selectedImage) {
                    div.hide();
                } else if (lbl.type === "station" && mode === "stops") {
                    div.show();
                    div.position(Math.round(startX + lbl.i * dotSpacing - div.size().width / 2), y + 15);
                } else if (lbl.type === "date" && mode === "dates") {
                    div.show();
                    let endX = xCoordinates[xCoordinates.length - 1] + dotSpacing / 2;
                    if (endX + div.size().width > width - 10) endX = width - div.size().width - 10;
                    div.position(Math.round(endX), y);
                } else if (lbl.type === "time" && mode === "time") {
                    if (lbl.i === line.times.length - 1) {
                        div.show();
                        let totalTime = line.times.reduce((a, b) => a + b, 0);
                        let endX = xCoordinates[xCoordinates.length - 1] + dotSpacing / 2;
                        if (endX + div.size().width > width - 10) endX = width - div.size().width - 10;
                        div.html(totalTime + " min");
                        div.position(Math.round(endX), y);
                    } else {
                        div.hide();
                    }
                } else if (lbl.type === "turb") {
                    div.show(); //turbulance put in boxes where the gradient represents the turbulance severity again
                    let avgTurb = line.turbulence.reduce((a, b) => a + b, 0) / line.turbulence.length;
                    let brightGreen = color("#14ff66");
                    let darkGreen = color("#0a4f22");
                    let allAvgTurb = lineInfo.map(l => l.turbulence.reduce((a, b) => a + b, 0) / l.turbulence.length);
                    let minAvgTurb = Math.min(...allAvgTurb);
                    let maxAvgTurb = Math.max(...allAvgTurb);
                    let tNorm = (maxAvgTurb - minAvgTurb === 0) ? 0 : (avgTurb - minAvgTurb) / (maxAvgTurb - minAvgTurb);
                    let boxColor = lerpColor(brightGreen, darkGreen, tNorm);

                    let endX = xCoordinates[xCoordinates.length - 1] + dotSpacing / 2;
                    let divWidth = div.elt.offsetWidth || 80;
                    let divHeight = div.elt.offsetHeight || 20;
                    let boxW = divWidth + 12;
                    let boxH = divHeight + 6;
                    let endY = y - 25;
                    if (endX + boxW > width - 10) endX = width - boxW - 10;

                    fill(boxColor);
                    noStroke();
                    rect(Math.round(endX), Math.round(endY), boxW, boxH, 5);

                    div.html("Turbulance Average: " + Math.round(avgTurb));
                    div.position(Math.round(endX + 6), Math.round(endY + 3));
                }
                else if (lbl.type === "carriage" && mode === "carriage") {
                    div.show();

                    let endX = xCoordinates[xCoordinates.length - 1] + dotSpacing / 2;
                    let baseY = y + 3; 

                    div.html("Carriages: " + line.carriage);
                    div.position(Math.round(endX), Math.round(baseY));
                }

                else if (lbl.type === "passengers" && mode === "passengers") {
                    div.show();

                    let endX = xCoordinates[xCoordinates.length - 1] + dotSpacing / 2;
                    let baseY = y + 3; 

                    div.html("Passengers: " + line.passengers);
                    div.position(Math.round(endX), Math.round(baseY));
                }

                else if (lbl.type === "frequency" && mode === "frequency") {
                    div.show();

                    let endX = xCoordinates[xCoordinates.length - 1] + dotSpacing / 2;
                    let baseY = y + 3;

                    div.html("Frequency: " + line.frequency);
                    div.position(Math.round(endX), Math.round(baseY));
                }
                else {
                    div.hide();
                }
            }
        });

        let boxX = 10;
        let boxY = y - boxHeight / 2;
        fill(...line.color);
        noStroke();
        rect(Math.round(boxX), Math.round(boxY), boxWidth, boxHeight, 8);

   
        fill(255);
        textAlign(CENTER, CENTER);
        textFont("monospace");
        textSize(14);
        text(line.label, Math.round(boxX + boxWidth / 2), Math.round(y));
    });

//when an image is selected show it in the middle of the screen and slightly dull the background
    if (selectedImage) {
        let imgWidth = width * 0.5;
        let imgHeight = imgWidth * (selectedImage.height / selectedImage.width);
        let x = width / 2 - imgWidth / 2;
        let y = height / 2 - imgHeight / 2;


        fill(0, 150);
        noStroke();
        rect(0, 0, width, height);

        image(selectedImage, x, y, imgWidth, imgHeight);

      //if its a turbulance image shown also show the label underneath
        turbulenceLabelDiv.show();
        turbulenceLabelDiv.position(
            Math.round(x + imgWidth / 2 - turbulenceLabelDiv.size().width / 2),
            Math.round(y + imgHeight + 10)
        );
    } else {
     
        turbulenceLabelDiv.hide();
    }
}
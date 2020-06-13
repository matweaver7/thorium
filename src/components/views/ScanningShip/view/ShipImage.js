import React, {useEffect} from "react";
import {Container, Row, Col} from "reactstrap";

const ShipImage = ({imagePath, fireLayout}) => {
  const divParentSytle = {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100%",
    margin: "auto",
    maxWidth: 1100,
  };
  const divChildStyle = {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    height: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: "56.26%",
    backgroundImage: `url("${imagePath}")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
  };

  useEffect(() => {
    const image = document.querySelector("#theImage");
    const data = window.getComputedStyle(image);
    const marginLeft = parseInt(data.marginLeft);
    const marginRight = parseInt(data.marginRight);
    const width = parseInt(data.width);
    const height = parseInt(data.height);
    console.log(width);
    console.log(height);
    console.log(marginLeft);
    let i = 1;
    fireLayout.fireDecks.forEach(deck => {
      deck.fireZones.forEach(zone => {
        console.log(zone);
        const pixelY = zone.pixelLocationY;
        const ratioY = 270;
        const calculatedTop = (pixelY * height) / ratioY + 20;
        const pixelX = zone.pixelLocationX;
        const ratioX = 480;
        const calculatedLeft = (pixelX * width) / ratioX + marginLeft + 20;

        const myDiv = document.querySelector(`.test[data-target="${i}"]`);
        myDiv.style.top = calculatedTop + "px";
        myDiv.style.left = calculatedLeft + "px";
        if (zone.status == "NORMAL") {
          myDiv.style.backgroundColor = "blue";
        } else {
          myDiv.style.backgroundColor = "red";
        }
        i++;
      });
    });
  }, [fireLayout]);

  const setupDivs = () => {
    const divCircleStyle = {
      borderRadius: "50%",
      position: "absolute",
      display: "inline-block",
      width: 20,
      height: 20,
    };
    let items = [];
    let i = 1;
    fireLayout.fireDecks.forEach(deck => {
      deck.fireZones.forEach(zone => {
        items.push(
          <div
            key={i}
            className="test"
            data-target={i}
            style={divCircleStyle}
          ></div>,
        );
        i++;
      });
    });

    return items;
  };

  return (
    <div style={divParentSytle}>
      <div id="theImage" style={divChildStyle}></div>
      {setupDivs()}
    </div>
  );
};

export default ShipImage;

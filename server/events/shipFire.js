import App from "../app";
import {pubsub} from "../helpers/subscriptionManager";
import * as Classes from "../classes";

function getFireLayout(simulatorId) {
  const systems = App.systems.filter(s => s.type === "ShipFires");
  const fireLayout = systems.filter(i => i.simulatorId === simulatorId);
  if (fireLayout.length > 0) {
    return fireLayout[0];
  } else {
    return null;
  }
}

App.on("updateFireLayout", ({fireLayoutInput}) => {
  const systems = App.systems.filter(s => s.type === "ShipFires");
  const fireLayout = systems.filter(
    i => i.simulatorId === fireLayoutInput.simulatorId,
  )[0];
  fireLayout.updateLayout(fireLayoutInput);
  pubsub.publish(
    "fireLayoutUpdated",
    App.systems.filter(s => s.type === "ShipFires"),
  );
});

App.on("addFireDeck", ({fireDeckInput}) => {
  const fireLayout = getFireLayout(fireDeckInput.simulatorId);
  if (fireLayout) {
    fireLayout.addFireDeck(fireDeckInput);
    pubsub.publish(
      "fireLayoutUpdated",
      App.systems.filter(s => s.type === "ShipFires"),
    );
  } else {
    return "Simulator not found";
  }
});

App.on("removeFireDeck", ({removeFireInput}) => {
  const fireLayout = getFireLayout(removeFireInput.simulatorId);
  if (fireLayout) {
    fireLayout.removeFireDeck(removeFireInput.deckNumber);
    pubsub.publish(
      "fireLayoutUpdated",
      App.systems.filter(s => s.type === "ShipFires"),
    );
  } else {
    return "Simulator not found";
  }
});

App.on("updateFireDeck", ({updateFireDeckInput}) => {
  const fireLayout = getFireLayout(updateFireDeckInput.simulatorId);
  if (fireLayout) {
    fireLayout.updateFireDeck(
      updateFireDeckInput.deckNumber,
      updateFireDeckInput.fireDeckInput,
    );
    pubsub.publish(
      "fireLayoutUpdated",
      App.systems.filter(s => s.type === "ShipFires"),
    );
  } else {
    return "Simulator not found";
  }
});

App.on("addFireZone", ({fireZoneInput}) => {
  const fireLayout = getFireLayout(fireZoneInput.simulatorId);
  if (fireLayout) {
    const deck = fireLayout.getDeck(fireZoneInput.deckNumber);
    if (deck) {
      deck.addFireZone(fireZoneInput);
      pubsub.publish(
        "fireLayoutUpdated",
        App.systems.filter(s => s.type === "ShipFires"),
      );
    } else {
      return "No Decks";
    }
  } else {
    return "Simulator not found";
  }
});

App.on("removeFireZone", ({removeFireInput}) => {
  const fireLayout = getFireLayout(removeFireInput.simulatorId);
  if (fireLayout) {
    const deck = fireLayout.getDeck(removeFireInput.deckNumber);
    if (deck) {
      deck.removeFireZone(removeFireInput.fireZoneNumber);
      pubsub.publish(
        "fireLayoutUpdated",
        App.systems.filter(s => s.type === "ShipFires"),
      );
    } else {
      return "No Decks";
    }
  } else {
    return "Simulator not found";
  }
});

App.on("updateFireZone", ({updateFireZoneInput}) => {
  const fireLayout = getFireLayout(updateFireZoneInput.simulatorId);
  if (fireLayout) {
    const deck = fireLayout.getDeck(updateFireZoneInput.deckNumber);
    if (deck) {
      const zone = deck.getZone(updateFireZoneInput.fireZoneNumber);
      deck.updateFireZone(
        updateFireZoneInput.fireZoneNumber,
        updateFireZoneInput.fireZoneInput,
      );
      pubsub.publish(
        "fireLayoutUpdated",
        App.systems.filter(s => s.type === "ShipFires"),
      );
      if (updateFireZoneInput.fireZoneInput.status) {
        pubsub.publish(
          "fireZoneStatusChanged",
          App.systems.filter(s => s.type === "ShipFires"),
        );
      }
    } else {
      return "No Decks";
    }
  } else {
    return "Simulator not found";
  }
});

App.on("moveFireDeck", ({updateFireZoneInput}) => {
  const fireLayout = getFireLayout(updateFireZoneInput.simulatorId);
  if (fireLayout) {
    let deck = fireLayout.getDeck(updateFireZoneInput.deckNumber);
    const newDeckNumber = updateFireZoneInput.fireZoneInput.deckNumber;
    let newDeck;
    if (deck) {
      const zone = deck.getZone(updateFireZoneInput.fireZoneNumber);
      deck.removeFireZone(updateFireZoneInput.fireZoneNumber);
      newDeck = fireLayout.getDeck(newDeckNumber);
      if (!newDeck) {
        fireLayout.addFireDeck({
          simulatorId: updateFireZoneInput.simulatorId,
          deckNumber: newDeckNumber,
          numberOfFireZones: 0,
          fireZones: [],
        });
        newDeck = fireLayout.getDeck(newDeckNumber);
      }
      if (newDeck) {
        newDeck.addFireZone(zone, true);
        newDeck.updateFireZone(
          updateFireZoneInput.fireZoneNumber,
          updateFireZoneInput.fireZoneInput,
        );
      } else {
        return "there was a problem";
      }
      pubsub.publish(
        "fireLayoutUpdated",
        App.systems.filter(s => s.type === "ShipFires"),
      );
      if (updateFireZoneInput.fireZoneInput.status) {
        pubsub.publish(
          "fireZoneStatusChanged",
          App.systems.filter(s => s.type === "ShipFires"),
        );
      }
    } else {
      if (updateFireZoneInput.deckNumber === 0) {
        deck = fireLayout.getDeck(updateFireZoneInput.fireZoneInput.deckNumber);
        if (!deck) {
          fireLayout.addFireDeck({
            simulatorId: updateFireZoneInput.simulatorId,
            deckNumber: updateFireZoneInput.fireZoneInput.deckNumber,
            numberOfFireZones: 0,
            fireZones: [],
          });
          deck = fireLayout.getDeck(
            updateFireZoneInput.fireZoneInput.deckNumber,
          );
        }
        if (deck) {
          deck.addFireZone(updateFireZoneInput.fireZoneInput);
          pubsub.publish(
            "fireLayoutUpdated",
            App.systems.filter(s => s.type === "ShipFires"),
          );
        }
      } else {
        return "No Decks";
      }
    }
  } else {
    return "Simulator not found";
  }
});

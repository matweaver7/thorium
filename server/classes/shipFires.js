import uuid from "uuid";
import {System} from "./generic";

class FireZone {
  constructor(params) {
    this.class = "FireZone";
    this.id = params.id || uuid.v4();
    this.name = params.name || null;
    this.fireZoneNumber = params.fireZoneNumber || 0;
    this.pixelLocationX = params.pixelLocationX || null;
    this.pixelLocationY = params.pixelLocationY || null;
    this.fireType = params.fireType || "NORMAL";
    this.status = params.status || "NORMAL";
  }
  getData() {
    return {
      class: this.class,
      id: this.id,
      name: this.name,
      fireZoneNumber: this.fireZoneNumber,
      pixelLocationX: this.pixelLocationX,
      pixelLocationY: this.pixelLocationY,
      fireType: this.fireType,
      status: this.status,
    };
  }
  updateFireZone(params) {
    if (params.id) {
      this.id = params.id;
    }
    if (params.name) {
      this.name = params.name;
    }
    if (params.fireZoneNumber) {
      this.fireZoneNumber = params.fireZoneNumber;
    }
    if (params.pixelLocationX) {
      this.pixelLocationX = params.pixelLocationX;
    }
    if (params.pixelLocationY) {
      this.pixelLocationY = params.pixelLocationY;
    }
    if (params.fireType) {
      this.fireType = params.fireType;
    }
    if (params.status) {
      this.status = params.status;
    }
    if (params.numberOfFireZones) {
      this.numberOfFireZones = params.numberOfFireZones;
    }
    if (params.fireZones) {
      this.fireZones = params.fireZones;
    }
  }
}

class FireDeck {
  constructor(params) {
    this.class = "FireDeck";
    this.id = params.id || uuid.v4();
    this.name = params.name || null;
    this.deckNumber = params.deckNumber || 0;
    this.fireZones = [];
    const fireZonesConfig = params.fireZones || [];
    fireZonesConfig.forEach(i => this.fireZones.push(new FireZone(i)));
    this.numberOfFireZones =
      params.numberOfFireZones || this.fireZones.length || 0;
  }
  addFireZone(params, isClass) {
    if (isClass) {
      this.fireZones.push(params);
    } else {
      this.fireZones.push(new FireZone(params));
    }
    this.numberOfFireZones = this.numberOfFireZones + 1;
  }
  getZone(fireZoneNumber) {
    const index = this.fireZones.findIndex(
      i => i.fireZoneNumber === fireZoneNumber,
    );
    if (index >= 0) {
      return this.fireZones[index];
    }
    return null;
  }
  removeFireZone(fireZoneNumber) {
    console.log("here");
    console.log(this);
    const index = this.fireZones.findIndex(
      i => i.fireZoneNumber === fireZoneNumber,
    );
    if (index >= 0) {
      this.fireZones.splice(index, 1);
    }
    this.numberOfFireZones = this.numberOfFireZones - 1;
    if (this.numberOfFireZones < 0) {
      this.numberOfFireZones = 0;
    }
  }
  updateFireZone(fireZoneNumber, fireZone) {
    const index = this.fireZones.findIndex(
      i => i.fireZoneNumber === fireZoneNumber,
    );
    if (index >= 0) {
      this.fireZones[index].updateFireZone(fireZone);
    }
  }
  updateFireDeck(params) {
    if (params.id) {
      this.id = params.id;
    }
    if (params.name) {
      this.name = params.name;
    }
    if (params.numberOfFireZones) {
      this.numberOfFireZones = params.numberOfFireZones;
    }
    if (params.fireZones) {
      this.fireZones = params.fireZones;
    }
  }
}

export default class ShipFires extends System {
  constructor(params) {
    super(params);
    this.class = "ShipFires";
    this.type = "ShipFires";
    this.imagePath = params.imagePath || null;
    this.simulatorId = params.simulatorId || null;
    this.id = params.id || uuid.v4();
    this.fireDecks = [];
    const fireDecksConfig = params.fireDecks || [];
    fireDecksConfig.forEach(i => this.fireDecks.push(new FireDeck(i)));
    this.numberOfFireDecks =
      params.numberOfFireDecks || this.fireDecks.length || 0;
  }

  addFireDeck(params) {
    this.fireDecks.push(new FireDeck(params));
    this.numberOfFireDecks++;
  }
  removeFireDeck(deckNumber) {
    const deckIndex = this.fireDecks.findIndex(
      i => i.deckNumber === deckNumber,
    );
    if (deckIndex >= 0) {
      this.fireDecks.splice(deckIndex, 1);
    }
    this.numberOfFireDecks = this.numberOfFireDecks - 1;
    if (this.numberOfFireDecks < 0) {
      this.numberOfFireDecks = 0;
    }
  }

  updateLayout(params) {
    if (params.id) {
      this.id = params.id;
    }
    if (params.name) {
      this.name = params.name;
    }
    if (params.changeImage) {
      this.imagePath = params.imagePath;
    }
    if (params.numberOfFireDecks) {
      this.numberOfFireDecks = params.numberOfFireDecks;
    }
    if (params.fireDecks) {
      this.fireDecks = params.fireDecks;
    }
  }

  updateZoneNumber(deckNumber, zoneNumber, params) {
    const deck = this.fireDecks.filter(i => i.deckNumber === deckNumber);
    const zone = deck.fireZones[zoneNumber];
    if (zone) {
      deck.fireZones[zoneNumber] = zone.updateFireZone(params);
    }
  }

  getZone(deckNumber, fireZoneNumber) {
    const index = this.fireDecks.findIndex(i => i.deckNumber === deckNumber);
    if (index >= 0) {
      const zoneIndex = this.fireDecks[index].fireZones.findIndex(
        i => i.fireZoneNumber === fireZoneNumber,
      );
      if (zoneIndex >= 0) {
        return this.fireDecks[index].fireZones[zoneIndex];
      }
      return null;
    }
    return null;
  }
  getDeck(deckNumber) {
    const index = this.fireDecks.findIndex(i => i.deckNumber === deckNumber);
    if (index >= 0) {
      return this.fireDecks[index];
    }
    return null;
  }

  updateFireDeck(deckNumber, fireDeck) {
    const index = this.fireDecks.findIndex(i => i.deckNumber === deckNumber);
    if (index >= 0) {
      this.fireDecks[index].updateFireDeck(fireDeck);
    }
  }
}

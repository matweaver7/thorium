import App from "../app";
import { System } from "./generic";

export default class DockingPort extends System {
  constructor(params) {
    super(params);
    this.class = "DockingPort";
    this.type = params.type || "shuttlebay";
    if (this.type === "shuttlebay") {
      this.clamps = params.clamps || true;
      this.compress = params.compress || true;
      this.doors = params.doors || true; // Doors are closed
      this.image = params.image || "/Docking Images/Default.png";
      this.docked = params.docked || true;
    } else {
      this.clamps = params.clamps || false;
      this.compress = params.compress || false;
      this.doors = params.doors || false; // Doors are closed
      this.image = params.image || "/Docking Images/Default.png";
      this.docked = params.docked || false;
    }
  }
  static tasks = [
    {
      name: "Undock Shuttle",
      active({ system, stations }) {
        // Check cards
        return (
          system.type === "shuttlebay" &&
          stations.find(s => s.cards.find(c => c.component === "Shuttles")) &&
          system.docked === true &&
          (system.clamps || system.compress || system.doors)
        );
      },
      verify({ system }) {
        system.docked = false;
      }
    },
    {
      name: "Dock Shuttle",
      active({ system, stations }) {
        // Check cards
        return (
          system.type === "shuttlebay" &&
          stations.find(s => s.cards.find(c => c.component === "Shuttles")) &&
          system.docked === true &&
          (system.clamps || system.compress || system.doors)
        );
      },
      verify({ system }) {
        system.docked = false;
      }
    },
    {
      name: "Undock All Shuttles",
      active({ system, stations }) {
        return (
          system.type === "shuttlebay" &&
          stations.find(s => s.cards.find(c => c.component === "Shuttles"))
        );
      },
      verify({ simulator }) {
        const shuttles = App.dockingPorts.filter(
          d => d.simulatorId === simulator.id && d.type === "shuttlebay"
        );
        return !shuttles.find(s => s.clamps || s.compress || s.doors);
      }
    },
    {
      name: "Dock All Shuttles",
      active({ system, stations }) {
        return (
          system.type === "shuttlebay" &&
          stations.find(s => s.cards.find(c => c.component === "Shuttles"))
        );
      },
      verify({ simulator }) {
        const shuttles = App.dockingPorts.filter(
          d => d.simulatorId === simulator.id && d.type === "shuttlebay"
        );
        return !shuttles.find(s => !s.clamps || !s.compress || !s.doors);
      }
    }
  ];
  updateDockingPort({ name, type, clamps, compress, doors, image, docked }) {
    if (name || name === "") {
      this.name = name;
    }
    if (type) {
      this.type = type;
    }
    if (clamps || clamps === false) {
      this.clamps = clamps;
    }
    if (compress || compress === false) {
      this.compress = compress;
    }
    if (doors || doors === false) {
      this.doors = doors;
    }
    if (image) {
      this.image = image;
    }
    if (docked || docked === false) {
      this.docked = docked;
    }
  }
}

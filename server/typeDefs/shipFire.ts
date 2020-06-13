import App from "../app";
import {gql, withFilter} from "apollo-server-express";
import {pubsub} from "../helpers/subscriptionManager";
const mutationHelper = require("../helpers/mutationHelper").default;

const schema = gql`
  # Definitions
  type FireLayout implements SystemInterface {
    simulatorId: ID!
    id: ID
    type: String
    name: String
    displayName: String
    upgradeName: String
    imagePath: String
    upgraded: Boolean
    damage: Damage
    power: Power
    stealthFactor: Float
    locations: [Room]
    numberOfFireDecks: Int
    fireDecks: [FireDeck]
  }
  type FireDeck {
    id: ID
    name: String
    deckNumber: Int
    numberOfFireZones: Int
    fireZones: [FireZone]
  }
  type FireZone {
    id: ID
    name: String
    fireZoneNumber: Int
    pixelLocationX: Int
    pixelLocationY: Int
    fireType: FireType
    status: FireStatus
  }

  # Inputs
  input FireLayoutInput {
    simulatorId: ID!
    id: ID
    numberOfFireDecks: Int
    imagePath: String
    changeImage: Boolean
    fireDecks: [FireDeckInput]
  }
  input FireDeckInput {
    simulatorId: ID
    deckNumber: Int
    id: ID
    name: String
    numberOfFireZones: Int
    fireZones: [FireZoneInput]
  }
  input FireZoneInput {
    simulatorId: ID
    deckNumber: Int
    id: ID
    fireZoneNumber: Int
    name: String
    pixelLocationX: Int
    pixelLocationY: Int
    fireType: FireType
    status: FireStatus
  }
  input RemoveFireInput {
    simulatorId: ID!
    deckNumber: Int
    fireZoneNumber: Int
  }
  input UpdateFireDeckInput {
    simulatorId: ID!
    deckNumber: Int!
    fireDeckInput: FireDeckInput!
  }
  input UpdateFireZoneInput {
    simulatorId: ID!
    deckNumber: Int!
    fireZoneNumber: Int!
    fireZoneInput: FireZoneInput!
  }
  input StopFireInput {
    simulatorId: ID!
    deckNumber: Int!
    fireZoneNumber: Int!
    materialType: MaterialType!
    fireStatus: FireStatus
    isAdmin: Boolean
  }

  extend type Query {
    FireLayout(simulatorId: ID): [FireLayout]
    Scan(simulatorId: ID, deckNumber: Int, zoneNumber: Int): [FireZone]
  }

  extend type Mutation {
    updateFireLayout(firelayoutInput: FireLayoutInput!): String
    addFireDeck(fireDeckInput: FireDeckInput!): String
    removeFireDeck(removeFireInput: RemoveFireInput!): String
    updateFireDeck(updateFireDeckInput: UpdateFireDeckInput): String
    moveFireDeck(updateFireZoneInput: UpdateFireZoneInput): String
    addFireZone(fireZoneInput: FireZoneInput!): String
    removeFireZone(removeFireInput: RemoveFireInput!): String
    updateFireZone(updateFireZoneInput: UpdateFireZoneInput): String
    stopFire(stopfireInput: StopFireInput!): String
  }

  extend type Subscription {
    fireLayoutUpdated(simulatorId: ID): [FireLayout]
    fireZoneStatusChanged(simulatorId: ID): [FireLayout]
  }

  enum FireStatus {
    BURNING
    NORMAL
    BEING_PUT_OUT
  }
  enum FireType {
    CHEMICAL
    NORMAL
    OIL
  }
  enum MaterialType {
    WATER
    CO2
    SAND
  }
`;

const resolver = {
  Query: {
    FireLayout(rootValue, {simulatorId}) {
      let returnVal = App.systems.filter(s => s.type === "ShipFires");
      if (simulatorId)
        returnVal = returnVal.filter(i => i.simulatorId === simulatorId);
      return returnVal;
    },
    Scan(rootValue, {simulatorId, deckNumber, zoneNumber}) {
      let returnVal = App.systems.filter(s => s.type === "ShipFires");
      if (simulatorId)
        returnVal = returnVal.filter(i => i.simulatorId === simulatorId);
      returnVal = returnVal[0].getZone(deckNumber, zoneNumber);
      return [returnVal];
    },
  },
  Mutation: {
    ...mutationHelper(schema, ["stopFire"]),
    stopFire(root, args, context) {
      const returnVal = App.systems.filter(s => s.type === "ShipFires");
      const data = args.stopfireInput;
      let fireLayout = returnVal.filter(
        i => i.simulatorId === data.simulatorId,
      );
      if (fireLayout.length > 0) {
        const layout = fireLayout[0];
        const deck = layout.getDeck(data.deckNumber);
        const zone = layout.getZone(data.deckNumber, data.fireZoneNumber);

        if (data.isAdmin) {
          const updateArgs = {
            updateFireZoneInput: {
              simulatorId: data.simulatorId,
              deckNumber: data.deckNumber,
              fireZoneNumber: data.fireZoneNumber,
              fireZoneInput: {
                status: data.fireStatus,
              },
            },
          };
          App.handleEvent(updateArgs, "updateFireZone", context);
        } else {
          const updateArgs = {
            updateFireZoneInput: {
              simulatorId: data.simulatorId,
              deckNumber: data.deckNumber,
              fireZoneNumber: data.fireZoneNumber,
              fireZoneInput: {
                status: "NORMAL",
              },
            },
          };
          if (zone.fireType === "CHEMICAL" && data.materialType === "C02") {
            App.handleEvent(updateArgs, "updateFireZone", context);
          } else if (
            zone.fireType === "NORMAL" &&
            data.materialType === "WATER"
          ) {
            App.handleEvent(updateArgs, "updateFireZone", context);
          } else if (zone.fireType === "OIL" && data.materialType === "SAND") {
            App.handleEvent(updateArgs, "updateFireZone", context);
          } else {
            return (
              "Incorrect Material: " +
              data.materialType +
              " For Fire Type: " +
              zone.fireType
            );
          }
        }
      } else {
        return "Simulator: " + data.simulatorId + "not found";
      }
      return "Fire Successfully Put Out";
    },
  },
  Subscription: {
    fireLayoutUpdated: {
      resolve(rootValue, {simulatorId}) {
        let returnVal = rootValue;
        if (simulatorId)
          returnVal = returnVal.filter(i => i.simulatorId === simulatorId);
        return returnVal;
      },
      subscribe: withFilter(
        () => {
          return pubsub.asyncIterator("fireLayoutUpdated");
        },
        rootValue => !!(rootValue && rootValue.length),
      ),
    },
    fireZoneStatusChanged: {
      resolve(rootValue, {simulatorId}) {
        let returnVal = rootValue;
        if (simulatorId)
          returnVal = returnVal.filter(i => i.simulatorId === simulatorId);
        return returnVal;
      },
      subscribe: withFilter(
        () => {
          return pubsub.asyncIterator("fireZoneStatusChanged");
        },
        rootValue => !!(rootValue && rootValue.length),
      ),
    },
  },
};

export default {schema, resolver};

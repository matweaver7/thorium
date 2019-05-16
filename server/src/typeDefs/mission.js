import App from "../app";
import { gql, withFilter } from "apollo-server-express";
import { pubsub } from "../helpers/subscriptionManager";
const mutationHelper = require("../helpers/mutationHelper").default;
// We define a schema that encompasses all of the types
// necessary for the functionality in this file.
const schema = gql`
  type Mission {
    id: ID
    name: String
    description: String
    timeline: [TimelineStep]
    simulators: [Simulator]
    aux: Boolean
  }
  input MacroInput {
    stepId: ID
    event: String
    args: String
    delay: Int
  }
  type TimelineStep {
    id: ID!
    name: String
    description: String
    order: Int
    timelineItems: [TimelineItem]
  }

  type TimelineItem {
    id: ID
    name: String
    type: String
    event: String
    args: String
    delay: Int
  }

  input TimelineItemInput {
    id: ID
    name: String
    type: String
    event: String
    args: String
    delay: Int
  }

  type TimelineInstance {
    id: ID
    mission: Mission
    currentTimelineStep: Int
    executedTimelineSteps: [ID]
  }
  extend type Query {
    missions(id: ID, aux: Boolean): [Mission]
    auxTimelines(simulatorId: ID!): [TimelineInstance]
  }
  extend type Mutation {
    createMission(name: String!): String
    removeMission(missionId: ID!): String
    editMission(
      missionId: ID!
      name: String
      description: String
      aux: Boolean
      simulators: [ID]
    ): String
    importMission(jsonString: String!): String
    addTimelineStep(
      simulatorId: ID
      missionId: ID
      name: String!
      description: String
    ): ID
    removeTimelineStep(
      simulatorId: ID
      missionId: ID
      timelineStepId: ID!
    ): String
    reorderTimelineStep(
      simulatorId: ID
      missionId: ID
      timelineStepId: ID!
      order: Int!
    ): String
    updateTimelineStep(
      simulatorId: ID
      missionId: ID
      timelineStepId: ID!
      name: String
      description: String
    ): String
    addTimelineItemToTimelineStep(
      simulatorId: ID
      missionId: ID
      timelineStepId: ID!
      timelineItem: TimelineItemInput!
    ): String
    removeTimelineStepItem(
      simulatorId: ID
      missionId: ID
      timelineStepId: ID!
      timelineItemId: ID!
    ): String
    updateTimelineStepItem(
      simulatorId: ID
      missionId: ID
      timelineStepId: ID!
      timelineItemId: ID!
      updateTimelineItem: TimelineItemInput!
    ): String
    duplicateTimelineStep(missionId: ID!, timelineStepId: ID!): String

    # Aux Timelines
    """
    Macro: Timelines: Start Aux Timeline
    """
    startAuxTimeline(simulatorId: ID!, missionId: ID!): ID
    setAuxTimelineStep(simulatorId: ID!, timelineId: ID!, step: Int!): String
  }
  extend type Subscription {
    missionsUpdate(missionId: ID): [Mission]
    auxTimelinesUpdate(simulatorId: ID!): [TimelineInstance]
  }
`;

const resolver = {
  Mission: {
    id(rootValue) {
      const mission = rootValue.timeline
        ? rootValue
        : App.missions.find(m => m.id === rootValue);
      return mission.id;
    },
    name(rootValue) {
      const mission = rootValue.timeline
        ? rootValue
        : App.missions.find(m => m.id === rootValue);
      return mission.name;
    },
    description(rootValue) {
      const mission = rootValue.timeline
        ? rootValue
        : App.missions.find(m => m.id === rootValue);
      return mission.description;
    },
    aux(rootValue) {
      const mission = rootValue.timeline
        ? rootValue
        : App.missions.find(m => m.id === rootValue);
      return mission.aux;
    },
    simulators(rootValue) {
      const mission = rootValue.timeline
        ? rootValue
        : App.missions.find(m => m.id === rootValue);
      return mission.simulators.map(id =>
        App.simulators.find(s => s.id === id)
      );
    },
    timeline(rootValue) {
      const mission = rootValue.timeline
        ? rootValue
        : App.missions.find(m => m.id === rootValue);
      return mission.timeline;
    }
  },
  Query: {
    missions(root, { id, aux }) {
      if (id) return App.missions.filter(m => m.id === id);
      if (aux || aux === false) {
        return App.missions.filter(m => m.aux === aux);
      }
      return App.missions;
    }
  },
  Mutation: mutationHelper(schema),
  Subscription: {
    missionsUpdate: {
      resolve: (rootValue, { missionId }) => {
        if (missionId) {
          return rootValue.filter(m => m.id === missionId);
        }
        return rootValue;
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator("missionsUpdate"),
        (rootValue, { missionId }) => {
          if (missionId) {
            return !!rootValue.find(m => m.id === missionId);
          }
          return true;
        }
      )
    }
  }
};

export default { schema, resolver };

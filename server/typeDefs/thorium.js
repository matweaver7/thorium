import App from "../app";
import {gql} from "apollo-server-express";
import {pubsub} from "../helpers/subscriptionManager";
import GraphQLClient from "../helpers/graphqlClient";
import request from "request";
import fetch from "node-fetch";
import uuid from "uuid";
import {capitalCase} from "change-case";
const mutationHelper = require("../helpers/mutationHelper").default;

const issuesUrl =
  "https://12usj3vwf1.execute-api.us-east-1.amazonaws.com/prod/issueTracker";

let spaceEdventuresData = null;
let spaceEdventuresTimeout = 0;
const version = require("../../package.json").version;
// We define a schema that encompasses all of the types
// necessary for the functionality in this file.
const schema = gql`
  type Thorium {
    thoriumId: String
    doTrack: Boolean
    askedToTrack: Boolean
    addedTaskTemplates: Boolean
    spaceEdventuresToken: String
    spaceEdventuresCenter: SpaceEdventuresCenter
    port: Int
    httpOnly: Boolean
  }

  type SpaceEdventuresCenter {
    id: ID
    name: String
    token: String
    simulators: [NamedObject]
    missions: [NamedObject]
    badges: [NamedObject]
    flightTypes: [FlightType]
  }

  type NamedObject {
    id: ID
    name: String
    description: String
  }
  type FlightType {
    id: ID
    name: String
    flightHours: Float
    classHours: Float
  }
  extend type Query {
    thorium: Thorium
  }
  extend type Mutation {
    setTrackingPreference(pref: Boolean!): String
    importTaskTemplates: String
    setSpaceEdventuresToken(token: String!): SpaceEdventuresCenter

    """
    Macro: Space EdVentures: Assign Space EdVentures Badge
    Requires:
      - Space EdVentures
    """
    assignSpaceEdventuresBadge(
      """
      Dynamic: Station
      """
      station: String
      badgeId: ID!
    ): String

    """
    Macro: Space EdVentures: Assign Space EdVentures Mission
    Requires:
      - Space EdVentures
    """
    assignSpaceEdventuresMission(station: String, badgeId: ID!): String

    """
    Macro: Space EdVentures: Change Flight Type
    Requires:
      - Space EdVentures
    """
    assignSpaceEdventuresFlightType(flightId: ID!, flightType: ID!): String

    """
    Macro: Space EdVentures: Transmit to Space EdVentures
    Requires:
      - Space EdVentures
    """
    assignSpaceEdventuresFlightRecord(flightId: ID!): String
    getSpaceEdventuresLogin(token: String!): String
    removeSpaceEdventuresClient(flightId: ID!, clientId: ID!): String

    """
    Macro: Generic: Do a generic thing. Use for triggers.
    """
    generic(simulatorId: ID!, key: String!): String

    addIssue(
      title: String!
      body: String!
      person: String!
      priority: String!
      type: String!
    ): String
    addIssueUpload(data: String!, filename: String!, ext: String!): String
  }
  extend type Subscription {
    thoriumUpdate: Thorium
    clockSync: String
  }
`;

const resolver = {
  Thorium: {
    spaceEdventuresCenter: () => {
      // Simple timeout based caching
      if (
        !spaceEdventuresData ||
        spaceEdventuresTimeout + 1000 * 60 * 5 < new Date()
      ) {
        spaceEdventuresTimeout = Date.now();
        return GraphQLClient.query({
          query: `query {
          center {
            id
            name
            simulators {
              id
              name
            }
            badges(type:badge) {
              id
              name
              description
            }
            missions: badges(type:mission) {
              id
              name
              description
            }
            flightTypes {
              id
              name
              flightHours
              classHours
            }
          }
        }`,
        }).then(({data: {center}}) => {
          if (!center) return spaceEdventuresData;
          spaceEdventuresData = {...center, token: App.spaceEdventuresToken};
          return spaceEdventuresData;
        });
      }
      if (spaceEdventuresData) {
        return spaceEdventuresData;
      }
    },
  },
  Query: {
    thorium(root) {
      return App;
    },
  },
  Mutation: {
    ...mutationHelper(schema, ["addIssue", "addIssueUpload"]),
    addIssue(rootValue, {title, body, person, priority, type}) {
      // Create our body
      var postBody =
        `
          ### Requested By: ${person}
    
          ### Priority: ${capitalCase(priority)}
    
          ### Version: ${version}
        `
          .replace(/^\s+/gm, "")
          .replace(/\s+$/m, "\n\n") + body;

      var postOptions = {
        title,
        body: postBody,
        labels: [
          version.includes("beta") && "beta",
          `priority/${priority}`,
          type,
        ].filter(Boolean),
      };
      request.post(
        {url: issuesUrl, body: postOptions, json: true},
        function() {},
      );
    },
    addIssueUpload(rootValue, {data, filename, ext}) {
      const uploadPath = `uploads/${filename}-${uuid.v4()}.${ext}`;
      const url =
        "https://api.github.com/repos/thorium-sim/issue-uploads/contents/" +
        uploadPath;
      const payload = {
        message: "issue tracker snapshot",
        branch: "master",
        content: data,
      };

      return fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "token " + process.env.GH_ISSUE_TOKEN,
        },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(res => {
          if (!res.content || !res.content.html_url) return null;
          return res.content.html_url + "?raw=true";
        })
        .catch(err => console.error(err));
    },
  },
  Subscription: {
    thoriumUpdate: {
      resolve(rootValue) {
        return rootValue;
      },
      subscribe: () => pubsub.asyncIterator("thoriumUpdate"),
    },
    clockSync: {
      resolve() {
        return new Date();
      },
      subscribe: () => pubsub.asyncIterator("clockSync"),
    },
  },
};

export default {schema, resolver};

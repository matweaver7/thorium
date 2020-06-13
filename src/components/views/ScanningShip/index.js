import React from "react";
import gql from "graphql-tag.macro";
import useQueryAndSubscription from "helpers/hooks/useQueryAndSubscribe";
import FireTable from "./view/FireTable.js";
const GET_INITIAL = gql`
  query GET_INITIAL($simulatorId: ID!) {
    FireLayout(simulatorId: $simulatorId) {
      numberOfFireDecks
      fireDecks {
        deckNumber
        numberOfFireZones
        fireZones {
          name
          pixelLocationX
          pixelLocationY
          fireType
          status
          fireZoneNumber
        }
      }
    }
  }
`;

const SUBSCRIBE_LAYOUT = gql`
  subscription SUBSCRIBE_LAYOUT($simulatorId: ID!) {
    fireLayoutUpdated(simulatorId: $simulatorId) {
      numberOfFireDecks
      fireDecks {
        deckNumber
        numberOfFireZones
        fireZones {
          name
          pixelLocationX
          pixelLocationY
          fireType
          status
          fireZoneNumber
        }
      }
    }
  }
`;

const ScanningShip = props => {
  const {simulator} = props;
  const {loading, data} = useQueryAndSubscription(
    {query: GET_INITIAL, variables: {simulatorId: simulator.id}},
    {query: SUBSCRIBE_LAYOUT, variables: {simulatorId: simulator.id}},
  );

  if (!data || loading) return null;
  const {FireLayout} = data;

  return (
    <div>
      <FireTable fireLayout={FireLayout[0]} />
    </div>
  );
};

export default ScanningShip;

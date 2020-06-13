import React from "react";
import PictureUpload from "./core/PictureUpload";
import FireManagementTable from "./core/Table";
import gql from "graphql-tag.macro";
import useQueryAndSubscription from "helpers/hooks/useQueryAndSubscribe";

const GET_INITIAL = gql`
  query GET_INITIAL($simulatorId: ID!) {
    FireLayout(simulatorId: $simulatorId) {
      numberOfFireDecks
      imagePath
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
      imagePath
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

const ScanningShipCore = props => {
  const {simulator} = props;
  const {loading, data} = useQueryAndSubscription(
    {query: GET_INITIAL, variables: {simulatorId: simulator.id}},
    {query: SUBSCRIBE_LAYOUT, variables: {simulatorId: simulator.id}},
  );

  if (!data || loading) return null;
  const {FireLayout} = data;

  return (
    <div>
      <PictureUpload
        simulatorId={simulator.id}
        imagePath={FireLayout[0].imagePath}
      />
      <FireManagementTable
        simulatorId={simulator.id}
        fireLayout={FireLayout[0]}
      />
    </div>
  );
};

export default ScanningShipCore;

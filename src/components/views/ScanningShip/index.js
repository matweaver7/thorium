import React from "react";
import gql from "graphql-tag.macro";
import useQueryAndSubscription from "helpers/hooks/useQueryAndSubscribe";
import FireTable from "./view/FireTable";
import ShipImage from "./view/ShipImage";

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

const ScanningShip = props => {
  const {simulator} = props;
  const {loading, data} = useQueryAndSubscription(
    {query: GET_INITIAL, variables: {simulatorId: simulator.id}},
    {query: SUBSCRIBE_LAYOUT, variables: {simulatorId: simulator.id}},
  );

  if (!data || loading) return null;
  const {FireLayout} = data;

  const ImageOrTable = () => {
    if (FireLayout[0].imagePath) {
      return (
        <ShipImage
          imagePath={FireLayout[0].imagePath}
          fireLayout={FireLayout[0]}
        />
      );
    } else {
      return <FireTable fireLayout={FireLayout[0]} />;
    }
  };

  return <div>{ImageOrTable()}</div>;
};

export default ScanningShip;

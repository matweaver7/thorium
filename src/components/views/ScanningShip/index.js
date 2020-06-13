import React from "react";
import gql from "graphql-tag.macro";
import {useQuery} from "react-apollo";
import {useSubscribeToMore} from "helpers/hooks/useQueryAndSubscribe";
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
  const {loading, data, subscribeToMore} = useQuery(GET_INITIAL, {
    variables: {simulatorId: simulator.id},
  });
  const subConfig = React.useMemo(
    () => ({
      variables: {simulatorId: simulator.id},
      updateQuery: (previousResult, {subscriptionData}) => ({
        ...previousResult,
        FireLayout: subscriptionData.data.FireLayout,
      }),
    }),
    [simulator.id],
  );
  useSubscribeToMore(subscribeToMore, SUBSCRIBE_LAYOUT, subConfig);
  if (loading || !data) return null;
  let fireLayout = {fireDecks: []};
  if (data.FireLayout) {
    fireLayout = data.FireLayout[0];
  }

  return (
    <div>
      <FireTable fireLayout={fireLayout} />
    </div>
  );
};

export default ScanningShip;

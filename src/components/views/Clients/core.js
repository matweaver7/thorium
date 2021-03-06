import React from "react";
import {Table} from "helpers/reactstrap";
import {Query, Mutation} from "react-apollo";
import gql from "graphql-tag.macro";
import {Input} from "helpers/reactstrap";
import {capitalCase} from "change-case";
import Views from "../index";
import SubscriptionHelper from "helpers/subscriptionHelper";
import "./style.scss";

const fragment = gql`
  fragment HypercardData on Client {
    id
    station {
      name
    }
    currentCard {
      name
    }
    loginName
    hypercard
  }
`;

export const CLIENTS_CORE_QUERY = gql`
  query Clients($simulatorId: ID!) {
    clients(simulatorId: $simulatorId) {
      ...HypercardData
    }
  }
  ${fragment}
`;
export const CLIENTS_CORE_SUBSCRIPTION = gql`
  subscription ClientUpdate($simulatorId: ID!) {
    clientChanged(simulatorId: $simulatorId) {
      ...HypercardData
    }
  }
  ${fragment}
`;

const excludedStations = ["Sound"];

const HypercardPicker = ({clientId = null, hypercard, simulatorId}) => {
  const viewList = Object.keys(Views)
    .filter(v => !Views[v].hypercard)
    .concat()
    .sort()
    .map((v, i) => (
      <option key={`${i}-${v}`} value={v}>
        {capitalCase(v)}
      </option>
    ));
  const hypercardList = Object.keys(Views)
    .filter(v => Views[v].hypercard)
    .concat()
    .sort()
    .map((v, i) => (
      <option key={`${i}-${v}`} value={v}>
        {capitalCase(v)}
      </option>
    ));
  return (
    <Mutation
      mutation={gql`
        mutation SetClientHypercard(
          $clientId: ID
          $simulatorId: ID
          $component: String
        ) {
          setClientHypercard(
            clientId: $clientId
            component: $component
            simulatorId: $simulatorId
          )
        }
      `}
    >
      {action => (
        <Input
          bsSize="sm"
          className="hypercard-picker"
          value={hypercard === null ? "null" : hypercard || "nothing"}
          onChange={e =>
            action({
              variables: {
                clientId,
                component: e.target.value === "null" ? null : e.target.value,
                simulatorId: clientId ? null : simulatorId,
              },
            })
          }
          type="select"
        >
          {!clientId && (
            <option value="nothing" disabled>
              Set hypercard on all clients
            </option>
          )}
          <option value="null">No Hypercard</option>
          <optgroup label="Designed to be Hypercards">{hypercardList}</optgroup>
          <optgroup label="Standard Cards">{viewList}</optgroup>
        </Input>
      )}
    </Mutation>
  );
};
const ClientCore = ({clients, simulator}) => (
  <div className="client-card">
    <HypercardPicker simulatorId={simulator.id} clientId={null} />
    <Table size="sm">
      <thead>
        <tr>
          <th>Station</th>
          <th>Name</th>
          <th>Card</th>
          <th>Client</th>
          <th>Hypercard</th>
        </tr>
      </thead>
      <tbody>
        {clients
          .filter(
            c =>
              c.station &&
              c.station.name.indexOf("keyboard") === -1 &&
              excludedStations.indexOf(c.station.name) === -1,
          )

          .map(c => (
            <tr key={c.id}>
              <td>{c.station.name}</td>
              <td>{c.loginName}</td>
              <td>{c.currentCard.name}</td>
              <td>{c.id}</td>
              <td>
                {" "}
                <HypercardPicker
                  simulatorId={simulator.id}
                  clientId={c.id}
                  hypercard={c.hypercard}
                />
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  </div>
);

const ClientData = props => (
  <Query
    query={CLIENTS_CORE_QUERY}
    variables={{simulatorId: props.simulator.id}}
  >
    {({loading, data, subscribeToMore}) => {
      if (loading || !data) return null;
      const {clients} = data;
      return (
        <SubscriptionHelper
          subscribe={() =>
            subscribeToMore({
              document: CLIENTS_CORE_SUBSCRIPTION,
              variables: {simulatorId: props.simulator.id},
              updateQuery: (previousResult, {subscriptionData}) => {
                return Object.assign({}, previousResult, {
                  clients: subscriptionData.data.clientChanged,
                });
              },
            })
          }
        >
          <ClientCore {...props} clients={clients} />
        </SubscriptionHelper>
      );
    }}
  </Query>
);
export default ClientData;

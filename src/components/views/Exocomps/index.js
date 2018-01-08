import React, { Component } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import gql from "graphql-tag";
import { graphql, withApollo } from "react-apollo";
import Exocomp from "./exocomp";
import ExocompConfig from "./exocompConfig";

import "./style.css";

const EXOCOMP_SUB = gql`
  subscription Exocomps($simulatorId: ID!) {
    exocompsUpdate(simulatorId: $simulatorId) {
      id
      state
      parts
      completion
      destination {
        id
        displayName
      }
      logs {
        timestamp
        message
      }
    }
  }
`;

const stardate = date => {
  var calculatedDate = new Date(date).getTime() / 1000 / 60 / 60 / 30 / 2;
  var subtraction = Math.floor(calculatedDate);
  var finalDate = (calculatedDate - subtraction) * 100000;
  return Math.floor(finalDate) / 10;
};

class Exocomps extends Component {
  state = { selectedExocomp: null };
  componentWillReceiveProps(nextProps) {
    if (!this.subscription && !nextProps.data.loading) {
      this.subscription = nextProps.data.subscribeToMore({
        document: EXOCOMP_SUB,
        variables: {
          simulatorId: nextProps.simulator.id
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            exocomps: subscriptionData.data.exocompsUpdate
          });
        }
      });
    }
  }
  componentWillUnmount() {
    this.subscription && this.subscription();
  }
  deploy = (id, destination, parts) => {
    const mutation = gql`
      mutation DeployExocomp($exocomp: ExocompInput!) {
        deployExocomp(exocomp: $exocomp)
      }
    `;
    const variables = {
      exocomp: {
        destination,
        parts,
        id
      }
    };
    this.props.client.mutate({
      mutation,
      variables
    });
    this.setState({
      selectedExocomp: null
    });
  };
  recall = id => {
    const mutation = gql`
      mutation RecallExocomp($exocomp: ID!) {
        recallExocomp(exocomp: $exocomp)
      }
    `;
    const variables = {
      exocomp: id
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  };
  render() {
    const { data: { systems, exocomps, loading } } = this.props;
    if (loading || !systems || !exocomps) return null;
    const { selectedExocomp } = this.state;
    const exocomp = exocomps.find(e => e.id === selectedExocomp);
    const exocompNum = exocomps.findIndex(e => e.id === selectedExocomp) + 1;
    return (
      <Container className="card-exocomps">
        <Row>
          <Col sm={5}>
            <h2>Exocomps</h2>
            <div className="exocomp-list">
              {exocomps.map((e, i) => {
                console.log(e);
                return (
                  <Exocomp
                    {...e}
                    number={i + 1}
                    key={e.id}
                    select={ex => this.setState({ selectedExocomp: ex })}
                    recall={() => this.recall(e.id)}
                  />
                );
              })}
            </div>
          </Col>
          <Col sm={7}>
            {selectedExocomp ? (
              <ExocompConfig
                {...exocomp}
                systems={systems}
                cancel={() => this.setState({ selectedExocomp: null })}
                number={exocompNum}
                deploy={this.deploy}
              />
            ) : (
              <div>
                <h3>Information</h3>
                <Card className="exocomp-information">
                  <CardBody>
                    {exocomps
                      .reduce((prev, next, i) => {
                        return prev.concat(
                          next.logs.map(l =>
                            Object.assign({}, l, { number: i + 1 })
                          )
                        );
                      }, [])
                      .sort((a, b) => {
                        if (a.timestamp > b.timestamp) return -1;
                        if (a.timestamp < b.timestamp) return 1;
                        return 0;
                      })
                      .map((l, i) => (
                        <p key={`log-${l.timestamp}-${i}`}>
                          {stardate(l.timestamp)} - Exocomp #{l.number}:{" "}
                          {l.message}
                        </p>
                      ))}
                  </CardBody>
                </Card>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}

const QUERY = gql`
  query Exocomps($simulatorId: ID) {
    systems(simulatorId: $simulatorId) {
      id
      name
      type
      displayName
      damage {
        damaged
      }
    }
    exocomps(simulatorId: $simulatorId) {
      id
      state
      parts
      completion
      logs {
        timestamp
        message
      }
      destination {
        id
        displayName
      }
    }
  }
`;
export default graphql(QUERY, {
  options: ownProps => ({
    variables: {
      simulatorId: ownProps.simulator.id
    }
  })
})(withApollo(Exocomps));

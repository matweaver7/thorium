import React, { Component } from "react";
import { graphql, withApollo } from "react-apollo";
import { Row, Col, Button, Input, Card, CardBody } from "reactstrap";
import gql from "graphql-tag";
import Tour from "reactour";
import FontAwesome from "react-fontawesome";

import { DeckDropdown, RoomDropdown } from "../helpers/shipStructure";
import assetPath from "../../../helpers/assets";
import DamageOverlay from "../helpers/DamageOverlay";
import "./style.css";

const SENSOR_SUB = gql`
  subscription SensorsChanged($simulatorId: ID, $domain: String) {
    sensorsUpdate(simulatorId: $simulatorId, domain: $domain) {
      id
      simulatorId
      scanResults
      scanRequest
      processedData
      scanning
      history
      scans {
        id
        request
        mode
        location
        response
        scanning
        timestamp
        cancelled
      }
      damage {
        damaged
        report
      }
      power {
        power
        powerLevels
      }
    }
  }
`;

const scanTypes = ["Standard", "Organic", "Inorganic", "Infrared", "Subspace"];

class Scanning extends Component {
  constructor(props) {
    super(props);
    this.sensorsSubscription = null;
    this.state = {
      selectedDeck: null,
      selectedRoom: null,
      selectedScanType: "Standard",
      scanResults: "",
      scanRequest: ""
    };
    this.trainingSteps = [];
    if (props.domain === "internal") {
      this.trainingSteps.push({
        selector: ".nothing",
        content:
          "There are sensors located throughout the entire ship which allow you to run scans. These scans could tell you about the location of people on the ship, or any other situation that is happening inside the ship."
      });
    } else {
      this.trainingSteps.push({
        selector: ".nothing",
        content:
          "There are precise sensors located outside of the ship which allow you to scan objects around your ship for specific information."
      });
    }
    this.trainingSteps.push({
      selector: ".scantype",
      content:
        "You can select a scan type from this list. This will focus your scan to a specific category."
    });
    if (props.domain === "internal") {
      this.trainingSteps.push({
        selector: ".locations",
        content:
          "Select where you want to scan here. The more specific your scan location, the faster your results will come."
      });
    }
    this.trainingSteps.push(
      {
        selector: ".scan-input",
        content: "Type in what you want to scan for here."
      },
      {
        selector: ".begin-scan",
        content: "Click here to begin your scan."
      },
      {
        selector: ".results",
        content: "The results of your scan will appear in this box."
      }
    );
  }
  componentWillReceiveProps(nextProps) {
    if (!this.sensorsSubscription && !nextProps.data.loading) {
      this.sensorsSubscription = nextProps.data.subscribeToMore({
        document: SENSOR_SUB,
        variables: {
          simulatorId: nextProps.simulator.id,
          domain: nextProps.domain || "internal"
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            sensors: subscriptionData.data.sensorsUpdate
          });
        }
      });
    }
    if (!nextProps.data.loading && nextProps.data.sensors) {
      if (nextProps.data.sensors[0].history) {
        if (this.state.selectedScan) {
          this.selectScan(
            nextProps.data.sensors[0].scans.find(
              s => s.id === this.state.selectedScan
            )
          );
        }
      } else {
        const nextSensors = nextProps.data.sensors[0];
        if (this.props.data.loading) {
          //First time load
          //Remove the first line of metadata;
          const request = nextSensors.scanRequest.split("\n");
          request.shift();
          this.setState({
            scanResults: nextSensors.scanResults,
            scanRequest: request.join("\n")
          });
        } else {
          //Every other load
          if (nextSensors.scanResults !== this.state.scanResults) {
            if (this.state.scanResults === undefined) {
              this.setState({
                scanResults: nextSensors.scanResults
              });
            } else {
              this.typeIn(nextSensors.scanResults, 0, "scanResults");
            }
          }
        }
      }
    }
  }
  componentWillUnmount() {
    this.sensorsSubscription && this.sensorsSubscription();
  }
  _scanRequest() {
    // For now, include the location in the scan request string, not separately.
    if (this.state.scanRequest.trim().length === 0) return;
    let deckName = "All Decks";
    let roomName = "";
    if (this.state.selectedDeck && this.state.selectedDeck !== "All Decks") {
      const deck = this.props.data.decks.find(
        d => d.id === this.state.selectedDeck
      );
      deckName = "Deck " + deck.number;
      roomName = "Entire Deck";
      if (!this.state.selectedRoom || this.state.selectedRoom !== "") {
        const room = deck.rooms.find(r => r.id === this.state.selectedRoom);
        roomName = room ? room.name : roomName;
      }
    }

    const request =
      this.props.domain === "internal"
        ? `${this.state.selectedScanType} - ${deckName}${roomName &&
            ", "}${roomName}\n${this.state.scanRequest}`
        : `${this.state.selectedScanType} - \n${this.state.scanRequest}`;
    const obj = {
      id: this.props.data.sensors[0].id,
      request
    };
    this.props.client.mutate({
      mutation: gql`
        mutation SensorScanRequest($id: ID!, $request: String!) {
          sensorScanRequest(id: $id, request: $request)
        }
      `,
      variables: obj
    });
  }
  _stopScan() {
    let obj = {
      id: this.props.data.sensors[0].id
    };
    this.props.client.mutate({
      mutation: gql`
        mutation CancelScan($id: ID!) {
          sensorScanCancel(id: $id)
        }
      `,
      variables: obj
    });
  }
  typeIn(text, chars, stateProp) {
    let currentState = this.state;
    if (text) {
      if (text.length >= chars) {
        currentState[stateProp] = text.substring(chars, 0);
        this.setState(currentState);
        setTimeout(this.typeIn.bind(this, text, chars + 1, stateProp), 1);
      }
    }
  }
  _selectDeck(e) {
    this.setState({
      selectedDeck: e.target.value,
      selectedRoom: ""
    });
  }
  _selectRoom(e) {
    this.setState({
      selectedRoom: e.target.value
    });
  }
  _setSelectedScan = type => {
    this.setState({
      selectedScanType: type
    });
  };
  _setScanRequest(e) {
    this.setState({
      scanRequest: e.target.value
    });
  }
  newScan = () => {
    const {
      selectedScanType,
      scanRequest,
      selectedDeck,
      selectedRoom
    } = this.state;
    const { decks, sensors } = this.props.data;
    const deck = decks.find(d => d.id === selectedDeck);
    const room = deck && deck.rooms.find(r => r.id === selectedRoom);
    const mutation = gql`
      mutation NewScan($id: ID!, $scan: SensorScanInput!) {
        newSensorScan(id: $id, scan: $scan)
      }
    `;
    const variables = {
      id: sensors[0].id,
      scan: {
        mode: selectedScanType,
        request: scanRequest,
        location:
          deck &&
          (room ? `${room.name}, Deck ${deck.number}` : `Deck ${deck.number}`)
      }
    };
    this.props.client.mutate({
      mutation,
      variables
    });
    this.setState({
      selectedScan: null,
      scanRequest: "",
      selectedScanType: "Standard",
      scanResults: "",
      scanning: false,
      selectedDeck: "All Decks",
      selectedRoom: null
    });
  };
  cancelScan = () => {
    const { selectedScan } = this.state;
    const { sensors } = this.props.data;
    const mutation = gql`
      mutation CancelScan($id: ID!, $scan: ID!) {
        cancelSensorScan(id: $id, scan: $scan)
      }
    `;
    const variables = {
      id: sensors[0].id,
      scan: selectedScan
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  };
  selectScan = ({ id, location = "", request, response, mode, scanning }) => {
    const { decks } = this.props.data;
    let deck = location.split(", Deck ")[1];
    let room = location.split(", Deck ")[0];
    if (!deck) {
      room = null;
      deck = location.replace("Deck ", "");
    }
    this.setState({
      selectedScan: id,
      scanRequest: request,
      selectedScanType: mode,
      scanResults: response,
      scanning,
      selectedDeck:
        deck && deck === "All Decks"
          ? "All Decks"
          : decks.find(d => d.number === parseInt(deck, 10)).id,
      selectedRoom:
        room &&
        deck &&
        decks
          .find(d => d.number === parseInt(deck, 10))
          .rooms.find(r => r.name === room).id
    });
  };
  render() {
    if (this.props.data.loading || !this.props.data.sensors) return null;
    const { domain } = this.props;
    let { scanning, history, scans } = this.props.data.sensors[0];
    const { selectedScan } = this.state;
    if (history && selectedScan) {
      scanning = scans.find(s => s.id === selectedScan).scanning;
    }
    const decks = this.props.data.decks;
    return (
      <Row className="scanning">
        <DamageOverlay
          message="Scanning Offline"
          system={this.props.data.sensors[0]}
        />
        {history && (
          <Col sm={3}>
            <h3>Scan Log</h3>
            <Card>
              <CardBody>
                {scans.map(s => (
                  <p
                    key={s.id}
                    className={`${s.cancelled ? "text-danger" : ""} ${
                      selectedScan === s.id ? "selected" : ""
                    } ${!s.cancelled && !s.scanning ? "text-success" : ""}`}
                    onClick={() => this.selectScan(s)}
                  >
                    {s.request.substr(0, 30)}
                    {s.request.length > 30 ? "... " : " "}
                    {s.scanning && <FontAwesome name="refresh" spin />}
                  </p>
                ))}
              </CardBody>
            </Card>
            <Button
              block
              color="primary"
              onClick={() =>
                this.setState({
                  selectedScan: null,
                  scanRequest: "",
                  selectedScanType: "Standard",
                  scanResults: "",
                  scanning: false,
                  selectedDeck: "All Decks",
                  selectedRoom: null
                })
              }
            >
              New Scan
            </Button>
          </Col>
        )}
        <Col sm={{ size: 6, offset: history ? 0 : 2 }}>
          {domain === "internal" && (
            <Row>
              <h4>Location Select:</h4>
            </Row>
          )}
          {domain === "internal" && (
            <Row className="locations">
              <Col sm={"auto"}>
                <DeckDropdown
                  selectedDeck={this.state.selectedDeck}
                  decks={decks}
                  allDecks
                  disabled={scanning || selectedScan}
                  setSelected={a =>
                    this.setState({
                      selectedDeck: a.deck,
                      selectedRoom: null
                    })
                  }
                />
              </Col>
              <Col>
                <RoomDropdown
                  selectedDeck={this.state.selectedDeck}
                  selectedRoom={this.state.selectedRoom}
                  decks={decks}
                  disabled={scanning || selectedScan}
                  setSelected={a =>
                    this.setState({
                      selectedRoom: a.room
                    })
                  }
                />
              </Col>
            </Row>
          )}
          <Row style={{ marginTop: "20px" }}>
            <h4>Scan Input:</h4>
          </Row>
          <Row className="scan-input">
            <Col>
              <Input
                type="text"
                disabled={selectedScan}
                onChange={this._setScanRequest.bind(this)}
                value={this.state.scanRequest}
              />
            </Col>
          </Row>
          {scanning ? (
            <div>
              <Row>
                <Col sm="auto">
                  <Button
                    size="lg"
                    color="danger"
                    onClick={
                      history ? this.cancelScan : this._stopScan.bind(this)
                    }
                  >
                    Cancel Scan
                  </Button>
                </Col>
              </Row>
              <Row style={{ marginTop: "50px" }}>
                <h4 className="text-center">Scan in progress...</h4>
                {domain === "internal" ? (
                  <Card className="scannerBox">
                    <img
                      alt="ship view"
                      role="presentation"
                      className="mw-100 ship-image"
                      draggable="false"
                      src={assetPath(
                        "/Ship Views/Right",
                        "default",
                        "png",
                        false
                      )}
                    />
                    <div className="scanner" />
                  </Card>
                ) : (
                  <Card className="scannerBox">
                    <video
                      ref={"ReactVideo"}
                      autoPlay
                      loop
                      style={{ height: "100%", width: "100%" }}
                    >
                      <source
                        src={require("../Sensors/scansvid.mov")}
                        type="video/mp4"
                      />
                    </video>
                  </Card>
                )}
              </Row>
            </div>
          ) : (
            <div>
              <Row>
                <Col sm="auto">
                  <Button
                    className="begin-scan"
                    size="lg"
                    disabled={selectedScan}
                    onClick={
                      history ? this.newScan : this._scanRequest.bind(this)
                    }
                  >
                    Begin Scan
                  </Button>
                </Col>
                <Col sm="auto">
                  <Button
                    color="warning"
                    size="lg"
                    disabled={selectedScan}
                    onClick={() =>
                      this.setState({
                        selectedDeck: null,
                        selectedRoom: null,
                        scanRequest: ""
                      })
                    }
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
              <Row style={{ marginTop: "50px" }}>
                <h4>Scan Results:</h4>
              </Row>
              <Row>
                <Col>
                  <Card className="results">
                    <CardBody>
                      <p>{this.state.scanResults}</p>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Col>
        <Col sm={{ size: 2, offset: history ? 0 : 1 }} className="scantype">
          <h4>Scan Type:</h4>
          {scanTypes.map(s => (
            <Button
              key={`scan-type-${s}`}
              block
              disabled={selectedScan}
              onClick={() => this._setSelectedScan(s)}
              className={this.state.selectedScanType === s ? "active" : ""}
            >
              {s}
            </Button>
          ))}
        </Col>
        <Tour
          steps={this.trainingSteps}
          isOpen={this.props.clientObj.training}
          onRequestClose={this.props.stopTraining}
        />
      </Row>
    );
  }
}

const SENSOR_QUERY = gql`
  query GetSensors($simulatorId: ID!, $domain: String) {
    sensors(simulatorId: $simulatorId, domain: $domain) {
      id
      simulatorId
      scanResults
      scanRequest
      scanning
      history
      scans {
        id
        request
        mode
        location
        response
        scanning
        timestamp
        cancelled
      }
      damage {
        damaged
        report
      }
      power {
        power
        powerLevels
      }
    }
    decks(simulatorId: $simulatorId) {
      id
      number
      evac
      doors
      rooms {
        id
        name
        gas
      }
    }
  }
`;

export default graphql(SENSOR_QUERY, {
  options: ownProps => ({
    variables: {
      simulatorId: ownProps.simulator.id,
      domain: ownProps.domain || "internal"
    }
  })
})(withApollo(Scanning));

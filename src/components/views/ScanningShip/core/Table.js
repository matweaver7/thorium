import React, {Component} from "react";
import {
  Table,
  Button,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "helpers/reactstrap";
import {useMutation} from "react-apollo";
import gql from "graphql-tag.macro";

const UPDATE_ZONE = gql`
  mutation UPDATE_ZONE(
    $simulatorId: ID!
    $deckNumber: Int!
    $zoneNumber: Int!
    $input: FireZoneInput!
  ) {
    updateFireZone(
      updateFireZoneInput: {
        simulatorId: $simulatorId
        deckNumber: $deckNumber
        fireZoneNumber: $zoneNumber
        fireZoneInput: $input
      }
    )
  }
`;
const UPDATE_FIRE_ZONE = gql`
  mutation UPDATE_DECK(
    $simulatorId: ID!
    $deckNumber: Int!
    $zoneNumber: Int!
    $input: FireZoneInput!
  ) {
    updateFireZone(
      updateFireZoneInput: {
        simulatorId: $simulatorId
        deckNumber: $deckNumber
        fireZoneNumber: $zoneNumber
        fireZoneInput: $input
      }
    )
  }
`;

const MOVE_FIRE_DECK = gql`
  mutation MOVE_DECK(
    $simulatorId: ID!
    $deckNumber: Int!
    $zoneNumber: Int!
    $input: FireZoneInput!
  ) {
    moveFireDeck(
      updateFireZoneInput: {
        simulatorId: $simulatorId
        deckNumber: $deckNumber
        fireZoneNumber: $zoneNumber
        fireZoneInput: $input
      }
    )
  }
`;

const FireManagementTable = ({simulatorId, fireLayout}) => {
  const [modalIsOpen, setmodalIsOpen] = React.useState(false);
  const [defaultDeckNumber, setDefaultDeckNumber] = React.useState(0);
  const [defaultZoneNumber, setDefaultZoneNumber] = React.useState(0);
  const [inputDeck, setInputDeck] = React.useState(0);
  const [inputZone, setInputZone] = React.useState(0);
  const [inputName, setInputName] = React.useState(null);
  const [inputStatus, setInputStatus] = React.useState(null);
  const [inputFireType, setInputFireType] = React.useState(null);
  const [inputPixelX, setInputPixelX] = React.useState(0);
  const [inputPixelY, setInputPixelY] = React.useState(0);

  const setupModalData = rowNumber => {
    const row = document.querySelector("#row-" + rowNumber);
    const inputs = row.querySelectorAll("[data-target]");
    inputs.forEach(input => {
      if (input.getAttribute("data-target") === "deck") {
        setInputDeck(parseInt(input.innerText));
        setDefaultDeckNumber(parseInt(input.innerText));
      }
      if (input.getAttribute("data-target") === "zone") {
        setInputZone(parseInt(input.innerText));
        setDefaultZoneNumber(parseInt(input.innerText));
      }
      if (input.getAttribute("data-target") === "name") {
        setInputName(input.innerText);
      }
      if (input.getAttribute("data-target") === "status") {
        setInputStatus(input.innerText);
      }
      if (input.getAttribute("data-target") === "fireType") {
        setInputFireType(input.innerText);
      }
      if (input.getAttribute("data-target") === "pixelLocation") {
        let texts = input.innerText.split(",");
        setInputPixelX(parseFloat(texts[0].substr(2)));
        setInputPixelY(parseFloat(texts[1].substr(0, texts[1].length - 2)));
      }
    });
  };
  const resetStateData = () => {
    setInputDeck(0);
    setDefaultDeckNumber(0);
    setInputZone(0);
    setDefaultZoneNumber(0);
    setInputName(null);
    setInputStatus(null);
    setInputFireType(null);
    setInputPixelX(0);
    setInputPixelY(0);
  };

  const [UpdateZoneMutation] = useMutation(UPDATE_FIRE_ZONE);
  const [MoveZoneMutation] = useMutation(MOVE_FIRE_DECK);

  const renderedTable = React.useMemo(() => {
    let table = [];
    let i = 1;
    fireLayout.fireDecks.forEach((deck, index) => {
      deck.fireZones.forEach((zone, zoneIndex) => {
        const pixelLocationString = `( ${zone.pixelLocationX}, ${zone.pixelLocationY} )`;
        table.push(
          <tr id={`row-${i}`} key={i}>
            <td data-target="deck">{deck.deckNumber}</td>
            <td data-target="zone">{zone.fireZoneNumber}</td>
            <td data-target="name">{zone.name}</td>
            <td data-target="status">{zone.status}</td>
            <td data-target="fireType">{zone.fireType}</td>
            <td data-target="pixelLocation">{pixelLocationString}</td>
            <td data-target="controller">
              <Button
                data-target-row={i}
                onClick={() => {
                  //handleRemoveClick
                }}
                color="danger"
              >
                Remove
              </Button>
              <Button
                data-target-row={i}
                onClick={e => {
                  e.preventDefault();
                  setupModalData(e.target.getAttribute("data-target-row"));
                  setmodalIsOpen(!modalIsOpen);
                }}
                color="warning"
              >
                Edit
              </Button>
            </td>
          </tr>,
        );
        i++;
      });
    });
    return table;
  }, [fireLayout]);

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <th>Deck #</th>
            <th>Zone #</th>
            <th>Name</th>
            <th>Status</th>
            <th>Fire Type</th>
            <th>Pixel Location</th>
            <th>Commands</th>
          </tr>
        </thead>
        <tbody>{renderedTable}</tbody>
      </Table>
      <Button
        onClick={() => {
          //addRowClick
        }}
      >
        + Add Row
      </Button>
      <Modal
        id="add-row-submit"
        isOpen={modalIsOpen}
        toggle={() => {
          setmodalIsOpen(!modalIsOpen);
        }}
        size="large"
      >
        <ModalHeader
          toggle={() => {
            setmodalIsOpen(!modalIsOpen);
          }}
        >
          Change Client ID
        </ModalHeader>
        <ModalBody>
          <Label>
            Deck #
            <Input
              value={inputDeck}
              onChange={e => setInputDeck(parseInt(e.target.value))}
            />
          </Label>
          <Label>
            Zone #
            <Input
              value={inputZone}
              onChange={e => setInputZone(parseInt(e.target.value))}
            />
          </Label>
          <Label>
            Name
            <Input
              value={inputName || ""}
              onChange={e => setInputName(e.target.value)}
            />
          </Label>
          <br />
          <Label>
            Status
            <Input
              value={inputStatus || ""}
              onChange={e => setInputStatus(e.target.value)}
            />
          </Label>
          <Label>
            Type
            <Input
              value={inputFireType || ""}
              onChange={e => setInputFireType(e.target.value)}
            />
          </Label>
          <Label>
            Pixel X Location
            <Input
              value={inputPixelX}
              onChange={e => setInputPixelX(parseInt(e.target.value))}
            />
          </Label>
          <Label>
            Pixel Y Location
            <Input
              value={inputPixelY}
              onChange={e => setInputPixelY(parseInt(e.target.value))}
            />
          </Label>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => {
              setmodalIsOpen(!modalIsOpen);
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => {
              const variables = {
                variables: {
                  simulatorId: simulatorId,
                  deckNumber: defaultDeckNumber,
                  zoneNumber: defaultZoneNumber,
                  input: {
                    fireZoneNumber: inputZone,
                    deckNumber: inputDeck,
                    name: inputName,
                    pixelLocationX: inputPixelX,
                    pixelLocationY: inputPixelY,
                    fireType: inputFireType,
                    status: inputStatus,
                  },
                },
              };
              if (inputDeck != defaultDeckNumber) {
                MoveZoneMutation(variables);
              } else {
                UpdateZoneMutation(variables);
              }
              resetStateData();
              setmodalIsOpen(!modalIsOpen);
            }}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default FireManagementTable;

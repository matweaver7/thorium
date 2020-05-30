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

class ScanningTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fireSuppressant: [
        {
          nickname: "Control Room",
          status: "active",
          pixelLocation: {x: 1, y: 23},
        },
        {nickname: "Engines", status: "active", pixelLocation: {x: 5, y: 23}},
        {
          nickname: "Science Lab",
          status: "active",
          pixelLocation: {x: 66, y: 23},
        },
        {
          nickname: "Crew Quarters",
          status: "active",
          pixelLocation: {x: 780, y: 23},
        },
      ],
      modalIsOpen: false,
      inputData: {
        nickname: "",
        status: "inactive",
        pixelLocation: {x: 0, y: 0},
      },
    };
    //bind this on click event
    this.handleAddRowClick = this.handleAddRowClick.bind(this);
    this.handleActivationToggleClick = this.handleActivationToggleClick.bind(
      this,
    );
    this.handleRemoveClick = this.handleRemoveClick.bind(this);
    this.handleAddRowSubmit = this.handleAddRowSubmit.bind(this);
  }

  renderTable() {
    return this.state.fireSuppressant.map((fireSuppressant, index) => {
      const {nickname, status, pixelLocation} = fireSuppressant;
      const pixelLocationString = `( ${pixelLocation.x}, ${pixelLocation.y} )`;
      return (
        <tr id={`row-${index}`} key={index + 1}>
          <td>{index + 1}</td>
          <td>{nickname}</td>
          <td>{status}</td>
          <td>{pixelLocationString}</td>
          <td>
            <Button
              data-target-row={index}
              onClick={this.handleActivationToggleClick}
            >
              Toggle Status
            </Button>
            <Button
              data-target-row={index}
              onClick={this.handleRemoveClick}
              color="danger"
            >
              Remove
            </Button>
          </td>
        </tr>
      );
    });
  }
  handleAddRowClick() {
    this.toggleModal();
  }
  handleActivationToggleClick(e) {
    e.preventDefault();
    const targetRow = e.target.getAttribute("data-target-row");
    this.toggleActivation(targetRow);
  }
  handleToggleModalClick() {}
  toggleActivation(rowIndex) {
    console.log(this);
    let updatedState = [...this.state.fireSuppressant];
    updatedState[rowIndex].status =
      updatedState[rowIndex].status == "active" ? "inactive" : "active";
    this.setState({
      fireSuppressant: [...updatedState],
    });
  }
  handleRemoveClick(e) {
    e.preventDefault();
    const targetRow = e.target.getAttribute("data-target-row");
    this.removeRow(targetRow);
  }
  handleAddRowSubmit(e) {
    e.preventDefault();
    this.addRow(this.state.inputData);
    this.state.inputData = {
      nickname: "",
      status: "inactive",
      pixelLocation: {x: 0, y: 0},
    };
    this.setState(this.state);
    this.toggleModal();
  }

  removeRow(rowIndex) {
    let updatedState = [...this.state.fireSuppressant];
    updatedState.splice(rowIndex, 1);
    console.log(updatedState);
    this.setState({
      fireSuppressant: [...updatedState],
    });
  }
  addRow(row) {
    alert("setting state");
    this.state.fireSuppressant = [...this.state.fireSuppressant, row];
    this.setState(this.state);
  }
  inputRow() {
    return (
      <tr>
        <th scope="row">
          <Button onClick={this.handleAddRowClick}>+ Add Row</Button>
        </th>
      </tr>
    );
  }
  toggleModal = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen;
    this.setState(this.state);
  };
  setNickname = name => {
    this.state.inputData.nickname = name;
    this.setState(this.state);
  };
  setPixelLocation = (x = null, y = null) => {
    if (x) {
      this.state.inputData.pixelLocation.x = x;
    }
    if (y) {
      this.state.inputData.pixelLocation.y = y;
    }
    this.setState(this.state);
  };
  render() {
    return (
      <div>
        <Table>
          <thead>
            <tr>
              <th>Suppressant #</th>
              <th>Nickname</th>
              <th>Status</th>
              <th>Pixel Location</th>
              <th>Commands</th>
            </tr>
          </thead>
          <tbody>
            {this.renderTable(this.state.fireSuppressant)}
            {this.inputRow()}
          </tbody>
        </Table>
        <Modal
          id="add-row-submit"
          isOpen={this.state.modalIsOpen}
          toggle={this.toggleModal}
          size="large"
        >
          <ModalHeader toggle={this.toggleModal}>Change Client ID</ModalHeader>
          <ModalBody>
            <Label>
              Nickname
              <Input
                value={this.state.inputData.nickname}
                onChange={e => this.setNickname(e.target.value)}
              />
            </Label>
            <br />
            <Label>
              X Pixel Location
              <Input
                value={this.state.inputData.pixelLocation.x}
                onChange={e => this.setPixelLocation(e.target.value)}
              />
            </Label>
            <Label>
              Y Pixel Location
              <Input
                value={this.state.inputData.pixelLocation.y}
                onChange={e => this.setPixelLocation(null, e.target.value)}
              />
            </Label>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button color="primary" onClick={this.handleAddRowSubmit}>
              Change Client ID
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ScanningTable;

import React, {Component} from "react";
import PictureUpload from "./core/PictureUpload";
import ScanningTable from "./core/Table";

class ScanningShipCore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numRows: 0,
    };
  }

  addRow(fireSuppressant) {
    this.state.numRows = this.state.numRows + 1;
    const pixelLocation = `( ${fireSuppressant.pixelLocation.x}, ${fireSuppressant.pixelLocation.y} )`;
    return (
      <tr>
        <th scope="row">{this.state.numRows}</th>
        <td>{fireSuppressant.nickname}</td>
        <td>{fireSuppressant.status}</td>
        <td>{pixelLocation}</td>
      </tr>
    );
  }
  render() {
    return (
      <div>
        <PictureUpload />
        <ScanningTable />
      </div>
    );
  }
}

export default ScanningShipCore;

import React from "react";
import {Table} from "helpers/reactstrap";

const FireTable = ({fireLayout}) => {
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
          </tr>
        </thead>
        <tbody>{renderedTable}</tbody>
      </Table>
    </div>
  );
};

export default FireTable;

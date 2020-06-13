import React from "react";
import {Spinner, Button} from "reactstrap";
import {useMutation} from "react-apollo";
import gql from "graphql-tag.macro";

const UPDATE_IMAGE = gql`
  mutation UPDATE_IMAGE($simulatorId: ID!, $imagePath: String) {
    updateFireLayout(
      firelayoutInput: {
        simulatorId: $simulatorId
        imagePath: $imagePath
        changeImage: true
      }
    )
  }
`;
const PictureUpload = ({simulatorId, imagePath}) => {
  const [isUploading, setIsUploading] = React.useState(false);

  const [UpdateImageMutation] = useMutation(UPDATE_IMAGE);
  console.log(imagePath);

  const removeImage = () => {
    UpdateImageMutation({
      variables: {simulatorId: simulatorId, imagePath: null},
    });
  };
  const submitImage = e => {
    setIsUploading(true);
    const files = Array.from(e.target.files);

    const formData = new FormData();
    files.forEach((file, i) => {
      formData.append(i, file);
    });
    formData.append("folderPath", "/Misc");

    fetch(`/upload`, {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(res => setIsUploading(false))
      .then(() => {
        if (files.length > 0) {
          const path = "/assets/Misc/" + files[0].name;
          UpdateImageMutation({
            variables: {simulatorId: simulatorId, imagePath: path},
          });
        }
      });
  };

  const content = () => {
    if (isUploading) {
      return <Spinner />;
    } else if (imagePath) {
      return (
        <div>
          <img alt="ship" src={imagePath} />
          <Button onClick={removeImage} color="danger">
            Remove
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <input type="file" onChange={submitImage}></input>
          <br />
          <br />
        </div>
      );
    }
  };

  return (
    <div>
      <h1>Fire System Manager</h1>
      <br />
      <br />
      <div className="buttons">{content()}</div>
    </div>
  );
};

export default PictureUpload;

import React, {Component} from "react";
import {Spinner, Button} from "reactstrap";

class PictureUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      images: [],
    };
    this.Change = this.Change.bind(this);
    this.removeImage = this.removeImage.bind(this);
  }

  Change(e) {
    const files = Array.from(e.target.files);
    this.setState({uploading: true});

    var file = files[0];
    console.log(file);
    var reader = new FileReader();
    var url = reader.readAsDataURL(file);

    reader.onloadend = e => {
      this.setState({
        images: [{url: reader.result}],
      });
    };

    console.log(url); // Would see a path?

    this.setState({uploading: false});

    // const formData = new FormData()

    // files.forEach((file, i) => {
    //     formData.append(i, file)
    // })

    // fetch(`${API_URL}/image-upload`, {
    //     method: 'POST',
    //     body: formData
    // })
    // .then(res => res.json())
    // .then(images => {
    //     this.setState({
    //         uploading: false,
    //         images
    //     })
    // })
  }

  removeImage() {
    this.setState({
      images: [],
    });
  }

  render() {
    const {uploading, images} = this.state;

    const content = () => {
      switch (true) {
        case uploading:
          return <Spinner />;
        case images.length > 0:
          return (
            <div>
              <img alt="ship" src={this.state.images[0].url} />
              <Button onClick={this.removeImage} color="danger">
                Remove
              </Button>
            </div>
          );
        default:
          return (
            <div>
              <input type="file" onChange={this.Change}></input>
              <br />
              <br />
            </div>
          );
      }
    };

    return (
      <div>
        <h1>
          Hello Welcome to Mat's cool uploader. Please upload an image below:
        </h1>
        <br />
        <br />
        <div className="buttons">{content()}</div>
      </div>
    );
  }
}

export default PictureUpload;

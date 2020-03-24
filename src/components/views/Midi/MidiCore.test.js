import React from "react";
import {waitForElementToBeRemoved, wait} from "@testing-library/react";
import render from "../../../helpers/testHelper";
import baseProps from "../../../stories/helpers/baseProps";
import Core from "./index";

// While it is possible to use the queries API to generate
// fake mock data, it is much better to use actual mock
// data generated by Thorium. Please replace the generated
// mocks with real mock data.
it.skip("should render", async () => {
  const {container, getByText, debug} = render(<Core {...baseProps} />);
  await waitForElementToBeRemoved(() => getByText("Loading..."));
  await wait();
  debug();
  expect(container.innerHTML).toBeTruthy();
  expect(container.innerHTML).not.toBe("Error");
});

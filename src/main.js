//v0 ---------------------------------------------------------------
const redDiv = document.createElement("div");
redDiv.id = "red";
redDiv.style = "background-color: red; width: 100px; height: 100px;";
// ---------------------------------------------------------------

//v1 ---------------------------------------------------------------
const element = {
  type: "div",
  props: {
    id: "skyblue",
    style: "background-color: skyblue; width: 100px; height: 100px",
  },
};
const skyBlueDiv = document.createElement(element.type);
Object.keys(element.props).forEach(
  (name) => (skyBlueDiv[name] = element.props[name])
);

const textElement = {
  type: "TEXT_ELEMENT",
  props: {
    nodeValue: "yxj",
  },
};
const text = document.createTextNode("text");
Object.keys(textElement.props).forEach(
  (name) => (text[name] = textElement.props[name])
);

skyBlueDiv.append(text);
// ---------------------------------------------------------------

//v2 ---------------------------------------------------------------
const pinkElement = {
  type: "div",
  props: {
    id: "pink",
    style: "background-color: pink; width: 100px; height: 100px;",
    children: [
      {
        type: "TEXT_ELEMENT",
        props: {
          nodeValue: "yxj",
        },
      },
    ],
  },
};
const isProperty = (key) => key !== "children";
function render(element, container) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => (dom[name] = element.props[name]));
  container.append(dom);
  element.props.children &&
    element.props.children.forEach((child) => render(child, dom));
}
// ---------------------------------------------------------------

//root
const root = document.querySelector("#root");

//v0
root.append(redDiv);

//v1
root.append(skyBlueDiv);

//v2
render(pinkElement, root);

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
export default {
  render
};
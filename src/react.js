function createTextElement(text)
{
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}
function createElement(type, props, ...children)
{
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === "string" ? createTextElement(child) : child)
    }
  }
}
const isProperty = (key) => key !== "children";
let nextUnit = null;
function render(element, container) {
  nextUnit = {
    type: container.type,
    props: {
      children: [element]
    },
    dom: container,
    parent: null,
    child: null,
    sibling: null
  }
  // const dom =
  //   element.type === "TEXT_ELEMENT"
  //     ? document.createTextNode("")
  //     : document.createElement(element.type);
  // Object.keys(element.props)
  //   .filter(isProperty)
  //   .forEach((name) => (dom[name] = element.props[name]));
  // container.append(dom);
  // element.props.children &&
  //   element.props.children.forEach((child) => render(child, dom));
}
function workLoop(deadline)
{
  let shouldYield = false;
  while (nextUnit && !shouldYield)
  {
    nextUnit = performUnit(nextUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function performUnit(fiber)
{
  const elements = fiber.props.children;
  let index = 0, prevFiber = null;
  while (index < elements.length)
  {
    const child = elements[index];
    const newFiber = {
      type: child.type,
      props: child.props,
      dom: child,
      parent: fiber,
      sibling: null
    }
    if (index === 0)
    {
      fiber.child = newFiber;
    }
    else
    {
      prevFiber.sibling = newFiber;
    }
    prevFiber = newFiber;
    index++;
  }
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber)
  {
    if (nextFiber.sibling) 
    {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
export default {
  render,
  createElement
};
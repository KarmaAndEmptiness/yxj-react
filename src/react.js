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
let nextUnit = null, rootFiber;
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
  rootFiber = nextUnit;
  
}
function workLoop(deadline)
{
  let shouldYield = false;
  while (nextUnit && !shouldYield)
  {
    nextUnit = performUnit(nextUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnit && rootFiber)
  {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function commitRoot()
{
  commitWork(rootFiber.child);
  rootFiber = null;
}

function commitWork(fiber)
{
  if (!fiber) return;
  let parent = fiber.parent;
  while (!parent.dom)
  {
    parent = parent.parent;
  }
  const parentDom = parent.dom;
  if (fiber.dom)
  {
    parentDom.append(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

const isProperty = (key) => key !== "children";
const isEvent = key => key.startsWith("on"); 
const eventType = type => type.substr(2).toLowerCase();
function createDom (fiber)
{
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  Object.keys(fiber.props)
    .filter(value => isProperty(value) && !isEvent(value))
    .forEach((name) => (dom[name] = fiber.props[name]));
    
  Object.keys(fiber.props)
    .filter(isEvent)
    .forEach((name) => (dom.addEventListener(eventType(name), fiber.props[name])));
    return dom;
}

const isFunction = fiber => fiber.type instanceof Function;
function performUnit(fiber)
{
  if (isFunction(fiber))
  {
    fiber.props.children = [fiber.type(fiber.props)];
  }
  else if (!fiber.dom)
  {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children;
  let index = 0, prevFiber = null;
  while (index < elements.length)
  {
    const child = elements[index];
    const newFiber = {
      type: child.type,
      props: child.props,
      dom: null,
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
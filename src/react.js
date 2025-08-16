function createElement(type, props, ...children)
{
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === "object" ? child : createTextElement(child))
    }
  }
}
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
let wipRoot = null, nextUnitOfWork = null, currentRoot = null;
function render(container, element)
{
  wipRoot = {
    dom: container,
    props: {
      children: [element]  
    },
    alternate: currentRoot
  }
  nextUnitOfWork = wipRoot;
  deletions = [];
}
function workLoop(deadline)
{
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield)
  {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot)
  {
    commitRoot();
  }
  window.requestIdleCallback(workLoop);
}
window.requestIdleCallback(workLoop);
function performUnitOfWork(fiber)
{
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent)
  {
    updateFunctionComponent(fiber);
  }
  else
  {
    updateHostComponent(fiber);
  }
  if (fiber.child)
  {
    return fiber.child;
  }
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
let wipFiber = null, hookIndex = null;
function updateFunctionComponent(fiber)
{
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
function updateHostComponent(fiber)
{
  if (!fiber.dom)
  {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
let deletions = [];
function reconcileChildren(wipFiber, elements)
{
  let index = 0, prevSibling = null, oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  while (index < elements.length || oldFiber)
  {
    const element = elements[index];
    let newFiber = null;
    const sameType = oldFiber && element.type === oldFiber.type;
    if (sameType)
    {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: "UPDATE"
      }
    }
    if (element && !sameType)
    {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: null,
        alternate: null,
        effectTag: "PLACEMENT"
      }
    }
    if (oldFiber && !sameType)
    { 
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
    if (index === 0)
    {
      wipFiber.child = newFiber;
    }
    else
    {
      prevSibling.sibling = newFiber; 
    }
    prevSibling = newFiber;
    index++;
    if (oldFiber)
    {
      oldFiber = oldFiber.sibling;
    }
  }
}
function commitRoot()
{
  deletions.forEach(commitWork);
  deletions = [];
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}
function commitWork(fiber)
{
  if (!fiber)
  {
    return;
  }
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom)
  {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom)
  {
    domParent.append(fiber.dom);
  }
  else if (fiber.effectTag === "UPDATE")
  {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }
  else if (fiber.effectTag === "DELETION")
  {
    commitDeletion(fiber, domParent);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
function updateDom(dom, prevProps, nextProps)
{
  const isEvent = key => key.startsWith("on");
  const eventType = type => type.substr(2).toLowerCase();
  const isProperty = key => key !== "children" && !isEvent(key);
  const isGone = nextProps => key => !(key in nextProps);
  const isNew = (prevProps, nextProps) => key => prevProps[key] !== nextProps[key];

  Object.keys(prevProps)
  .filter(isProperty)
  .filter(isGone(nextProps))
  .forEach(name => dom[name] = "");

  Object.keys(prevProps)
  .filter(isEvent)
  .filter(key => isGone(nextProps)(key) || isNew(prevProps, nextProps)(key))
  .forEach(name => dom.removeEventListener(eventType(name), prevProps[name]));

  Object.keys(nextProps)
  .filter(isProperty)
  .filter(isNew(prevProps, nextProps))
  .forEach(name => dom[name] = nextProps[name]);

  Object.keys(nextProps)
  .filter(isEvent)
  .filter(isNew(prevProps, nextProps))
  .forEach(name => dom.addEventListener(eventType(name), nextProps[name]));
}
function commitDeletion(fiber, domParent)
{
  if (fiber.dom)
  {
    domParent.removeChild(fiber.dom);
  }
  else
  {
    commitDeletion(fiber.child, domParent);
  }
}
function createDom(fiber)
{
  const dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom;
}
function useState(initial)
{
    const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  const setState = action => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}
export default {
  createElement,
  render,
  useState
}
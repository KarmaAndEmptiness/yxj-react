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
      children: children.map(child => typeof child === "object" ? child : createTextElement(child) )
    }
  }
}
let nextUnit = null, rootFiber, currentRoot = null;
function render(element, container) {
  nextUnit = {
    type: container.type,
    props: {
      children: [element]
    },
    dom: container,
    parent: null,
    child: null,
    sibling: null,
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
  deletions.forEach(fiber => commitWork(fiber));
  deletions = [];
  commitWork(rootFiber.child);
  currentRoot = rootFiber;
  rootFiber = null;
}

function commitDeletion (fiber, parentDom)
{
  if (fiber.dom)
  {
    parentDom.removeChild(fiber.dom);
  }
  else
  {
    commitDeletion(fiber.child, parentDom);
  }
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
  if (fiber.effectTag === "DELETION")
  {
    commitDeletion(fiber, parentDom);
    return;
  }
  if (fiber.effectTag === "UPDATE")
  {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props); 
  }
  if (fiber.effectTag === "PLACEMENT" && fiber.dom)
  {
    parentDom.append(fiber.dom);
  }
  
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

const isProperty = (key) => key !== "children";
const isEvent = key => key.startsWith("on"); 
const eventType = type => type.substr(2).toLowerCase();
const isGone = (next) => key => !(key in next);
const isNew = (prev, next) => key => prev[key] !== next[key];
function createDom (fiber)
{
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
    updateDom(dom, {}, fiber.props); 
    return dom;
}
function updateDom(dom, prev, next)
{
  Object.keys(next)
    .filter(value => isProperty(value) && !isEvent(value))
    .filter(isGone(next))
    .forEach((name) => (dom[name] = ""));
    
  Object.keys(prev)
    .filter(isEvent)
    .filter(key => isGone(next)(key) || isNew(prev, next)(key))
    .forEach((name) => (dom.removeEventListener(eventType(name), prev[name])));

  Object.keys(next)
    .filter(value => isProperty(value) && !isEvent(value))
    .filter(isNew(prev, next))
    .forEach((name) => (dom[name] = next[name]));

  Object.keys(next)
    .filter(isEvent)
    .filter(isNew(prev, next))
    .forEach((name) => (dom.addEventListener(eventType(name), next[name])));

    
}

const isFunction = fiber => fiber.type instanceof Function;
function performUnit(fiber)
{
  if (isFunction(fiber))
  {
    updateFunctionComponent(fiber);
  }
  else 
  {
    updateHostComponent(fiber);
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
function updateHostComponent(fiber)
{
  if (!fiber.dom)
  {
      fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

}
let wipFiber = null
let hookIndex = null
function updateFunctionComponent(fiber)
{
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
let deletions = [];
function reconcileChildren(fiber, elements)
{
  let index = 0, prevFiber = null;
  let oldFiber = fiber.alternate && fiber.alternate.child;
  while (index < elements.length)
  {
    const child = elements[index];
    const sameType = oldFiber && oldFiber.type === child.type;
    let newFiber =null;
    if (sameType)
    {
      newFiber = {
        type: child.type,
        props: child.props,
        dom: oldFiber.dom,
        parent: fiber,
        sibling: null,
        alternate: oldFiber,
        effectTag: "UPDATE"
      }
    }
    if (child && !sameType)
    {
      newFiber = {
          type: child.type,
          props: child.props,
          dom: null,
          parent: fiber,
          sibling: null,
          alternate: null,
          effectTag: "PLACEMENT"
      }
    }
    if (oldFiber && !sameType)
    {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
  
    if (oldFiber)
    {
      oldFiber = oldFiber.sibling;
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
}

function useState(initial) {
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
    rootFiber = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnit = rootFiber
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}
export default {
  render,
  createElement,
  useState
};

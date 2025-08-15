import React from './react'
import {createRoot} from './reactDom'
import {App} from './App'
//root
const root = document.querySelector("#root");
//v2
createRoot(root).render(<App name = "yxj"/>);
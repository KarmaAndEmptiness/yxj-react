// export const App = {
//   type: "div",
//   props: {
//     id: "pink",
//     style: "background-color: pink; width: 100px; height: 100px;",
//     children: [
//       {
//         type: "TEXT_ELEMENT",
//         props: {
//           nodeValue: "yxj",
//         },
//       },
//     ],
//   },
// };
import React from './react'
// export const App = <div id="pink" style="background-color: pink; width: 100px; height: 100px;">yxj</div>
export function App (props) {
  const handleClick = () => {
    console.log(1);
  }
  return (
    <>
    <div id="pink" style="background-color: pink; width: 100px; height: 100px;">yxj - {props.name}</div>
    <button onClick = {handleClick}>yxj</button>
    </>
  );

}
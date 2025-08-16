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
  let [a, setA] = React.useState(1);
  const handleClick = () => {
    setA(a => a + 1);
  }
  return (
    <>
    <button onClick = {handleClick}>yxj - {a}</button>
    {a % 2 ? <h1>1</h1> : <div>2</div>}
    </>
  );

}